import { useState, useCallback } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { useBanners } from "../hooks/useBanners";
import { useSongs } from "@/features/songs/hooks/useSongs";
import BannerFormModal from "./BannerModalForm";
import { IBanner } from "../types";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext, closestCenter, KeyboardSensor,
  PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  arrayMove, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis, restrictToParentElement,
} from "@dnd-kit/modifiers";
import SortableBannerItem from "./SortableBannerItem";

// ── Bugs fixed ────────────────────────────────────────────────────────────────
// 1. window.confirm() in handleDelete blocks the main thread.
//    Fixed: inline two-step confirm per row.
// 2. alert() used for toggle/delete/reorder errors.
//    Fixed: inline toast with auto-dismiss.
// 3. Edit button used blue colour (#hover:text-blue-500) — inconsistent with
//    the design system. Fixed: uses #1d1d1f / ghost circle like other managers.
// 4. Toggle visibility button used green/gray — inconsistent.
//    Fixed: uses #34c759 active, #aeaeb2 inactive, same as SectionManager.
// 5. All previously fixed bugs (window.confirm, isDragging leak, reorderingId
//    timing, getBannerStatus priority) are preserved from earlier fixes.
// ─────────────────────────────────────────────────────────────────────────────

type BannerStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DISABLED";

const STATUS_CONFIG: Record<BannerStatus, { label: string; color: string; bg: string; border: string }> = {
  ACTIVE:    { label: "Active",    color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
  SCHEDULED: { label: "Scheduled", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
  EXPIRED:   { label: "Expired",   color: "#6e6e73", bg: "#f5f5f7", border: "#e5e5ea" },
  DISABLED:  { label: "Disabled",  color: "#fa243c", bg: "#fff0f3", border: "#ffd1d9" },
};

const getBannerStatus = (banner: IBanner): BannerStatus => {
  const now   = Date.now();
  const start = banner.startDate?.toDate?.()?.getTime?.() ?? null;
  const end   = banner.endDate?.toDate?.()?.getTime?.()   ?? null;
  // Order matters: time-based states take priority over manual isActive flag
  if (end   && now > end)   return "EXPIRED";
  if (start && now < start) return "SCHEDULED";
  if (!banner.isActive)     return "DISABLED";
  return "ACTIVE";
};

const BannerManager = () => {
  const { banners, loading } = useBanners(true);
  const { songs }            = useSongs();

  const [selectedBanner,  setSelectedBanner]  = useState<IBanner | null>(null);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [deletingId,      setDeletingId]      = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId,      setTogglingId]      = useState<string | null>(null);
  const [reorderingId,    setReorderingId]    = useState<string | null>(null);
  const [isDragging,      setIsDragging]      = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await deleteDoc(doc(db, "banners", id));
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete banner", "error");
    } finally {
      setDeletingId(null);
    }
  }, []);

  // ── Toggle active ─────────────────────────────────────────────────────────
  const toggleActive = useCallback(async (banner: IBanner) => {
    setTogglingId(banner.id);
    try {
      await updateDoc(doc(db, "banners", banner.id), { isActive: !banner.isActive });
    } catch (err) {
      console.error("Toggle error:", err);
      showToast("Failed to update banner status", "error");
    } finally {
      setTogglingId(null);
    }
  }, []);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = useCallback(() => setIsDragging(true), []);
  const handleDragCancel = useCallback(() => setIsDragging(false), []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = banners.findIndex((b) => b.id === active.id);
    const newIndex = banners.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(banners, oldIndex, newIndex);
    setReorderingId(active.id as string);
    try {
      await Promise.all(
        reordered.map((banner, index) =>
          updateDoc(doc(db, "banners", banner.id), { order: index + 1 })
        )
      );
    } catch (err) {
      console.error("Reorder error:", err);
      showToast("Failed to save new order", "error");
    } finally {
      setReorderingId(null);
    }
  }, [banners]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getRedirectDisplay = (banner: IBanner) => {
    if (banner.redirectType === "song") {
      const song = songs.find((s) => s.id === banner.redirectId);
      return song ? `${song.title} — ${song.artist}` : banner.redirectId;
    }
    return banner.redirectId;
  };

  const openCreate = () => { setSelectedBanner(null); setModalOpen(true); };
  const openEdit   = (banner: IBanner) => { setConfirmDeleteId(null); setSelectedBanner(banner); setModalOpen(true); };

  // ── Summary counts ────────────────────────────────────────────────────────
  const activeCount = banners.filter((b) => getBannerStatus(b) === "ACTIVE").length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-[18px] border border-[#e5e5ea] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-8">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-7 h-7 border-2 border-[#ffd1d9] border-t-[#fa243c] rounded-full animate-spin" />
          <p className="text-[13px] text-[#aeaeb2]">Loading banners…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">

      {/* ── Page header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(24px,2.8vw,34px)] font-bold text-[#1d1d1f] tracking-[-0.7px] leading-[1.08] mb-1.5">
            Banners
          </h1>
          <p className="text-[15px] text-[#6e6e73] m-0">
            Manage hero banners displayed on the homepage
          </p>
        </div>
        <span className="text-[15px] font-medium text-[#6e6e73] whitespace-nowrap pb-[3px]">
          {banners.length} {banners.length === 1 ? "banner" : "banners"}
        </span>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3.5">
        {[
          { label: "Total",    value: banners.length,                    accent: "#1d1d1f" },
          { label: "Active",   value: activeCount,                       accent: "#34c759" },
          { label: "Inactive", value: banners.length - activeCount,      accent: "#aeaeb2" },
        ].map((card) => (
          <div key={card.label}
            className="bg-white border border-[#e5e5ea] rounded-[18px] p-[20px_18px_18px] flex flex-col gap-1 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <span className="text-[28px] font-bold tracking-[-1px] leading-none" style={{ color: card.accent }}>
              {card.value}
            </span>
            <span className="text-[12px] font-medium text-[#6e6e73]">{card.label}</span>
          </div>
        ))}
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-[18px] border border-[#e5e5ea] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">

        {/* Header row */}
        <div className="px-5 py-4 border-b border-[#f5f5f7] flex items-center justify-between gap-4">
          <p className="text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px]">
            Drag to reorder · order sets display sequence
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[980px] bg-[#fa243c] text-white text-[13px] font-semibold border-none cursor-pointer transition-all hover:bg-[#e02650]"
          >
            <AddIcon sx={{ fontSize: 15 }} />
            Create Banner
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mx-5 mt-4 flex items-center gap-3 px-4 py-3 rounded-[12px] border text-[13px] font-medium ${
            toast.type === "success"
              ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]"
              : "bg-[#fff0f3] border-[#ffd1d9] text-[#fa243c]"
          }`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M7 4v3.5M7 9.5v.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {toast.message}
          </div>
        )}

        {/* List */}
        <div className="p-5">
          {banners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" stroke="#e5e5ea" strokeWidth="1.5"/>
                <rect x="10" y="14" width="24" height="16" rx="3" stroke="#d1d1d6" strokeWidth="1.4"/>
                <path d="M10 19h24" stroke="#d1d1d6" strokeWidth="1.3"/>
              </svg>
              <div className="text-center">
                <p className="text-[14px] text-[#6e6e73]">No banners yet</p>
                <p className="text-[12px] text-[#aeaeb2] mt-1">Create your first banner to get started</p>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={banners.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="flex flex-col gap-2.5 transition-opacity duration-150"
                  style={{
                    cursor:        isDragging ? "grabbing" : "default",
                    pointerEvents: reorderingId ? "none" : "auto",
                    opacity:       reorderingId ? 0.6 : 1,
                  }}
                >
                  {banners.map((banner) => {
                    const status = getBannerStatus(banner);
                    const sc     = STATUS_CONFIG[status];

                    return (
                      <SortableBannerItem key={banner.id} id={banner.id} banner={banner}>
                        <div className="group bg-[#fafafa] border border-[#f5f5f7] rounded-[12px] overflow-hidden transition-all hover:border-[#e5e5ea]">
                          <div className="px-4 py-3 flex items-center gap-3">

                            {/* Drag handle */}
                            <div className="cursor-grab active:cursor-grabbing text-[#d1d1d6] hover:text-[#aeaeb2] transition-colors flex-shrink-0">
                              <DragIndicatorIcon sx={{ fontSize: 18 }} />
                            </div>

                            {/* Thumbnail */}
                            <div className="w-[88px] h-[52px] rounded-[8px] overflow-hidden bg-[#f5f5f7] flex-shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                              {banner.imageUrl ? (
                                <img
                                  src={banner.imageUrl}
                                  alt={banner.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <rect x="2" y="4" width="14" height="10" rx="2" stroke="#d1d1d6" strokeWidth="1.3"/>
                                    <path d="M2 8h14" stroke="#d1d1d6" strokeWidth="1.2"/>
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[13px] font-semibold text-[#1d1d1f] truncate">
                                  {banner.title}
                                </span>
                                {/* Status pill */}
                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-[980px] border flex-shrink-0"
                                  style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}>
                                  {sc.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11.5px] text-[#aeaeb2]">
                                <span className="capitalize">{banner.redirectType}</span>
                                <span className="w-[3px] h-[3px] rounded-full bg-[#d1d1d6]" />
                                <span className="truncate max-w-[200px]">
                                  {banner.redirectType === "song"
                                    ? getRedirectDisplay(banner)
                                    : `ID: ${banner.redirectId}`}
                                </span>
                                <span className="w-[3px] h-[3px] rounded-full bg-[#d1d1d6]" />
                                <span>#{banner.order ?? 1}</span>
                              </div>
                            </div>

                            {/* Actions — visible on hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">

                              {/* Toggle visibility */}
                              <button
                                onClick={() => toggleActive(banner)}
                                disabled={togglingId === banner.id}
                                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center border border-transparent transition-all disabled:cursor-not-allowed ${
                                  banner.isActive
                                    ? "text-[#34c759] hover:bg-[#f0fdf4] hover:border-[#bbf7d0]"
                                    : "text-[#aeaeb2] hover:bg-white hover:border-[#e5e5ea]"
                                }`}
                                title={banner.isActive ? "Deactivate" : "Activate"}
                              >
                                {togglingId === banner.id ? (
                                  <span className="w-3.5 h-3.5 border-2 border-[#d1d1d6] border-t-[#6e6e73] rounded-full animate-spin" />
                                ) : banner.isActive ? (
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 2a5 5 0 1 0 0 10A5 5 0 0 0 7 2z" stroke="currentColor" strokeWidth="1.3"/>
                                    <path d="M5 7l1.5 1.5L9 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : (
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 2a5 5 0 1 0 0 10A5 5 0 0 0 7 2z" stroke="currentColor" strokeWidth="1.3"/>
                                    <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                  </svg>
                                )}
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => openEdit(banner)}
                                className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[#aeaeb2] hover:text-[#1d1d1f] hover:bg-white border border-transparent hover:border-[#e5e5ea] transition-all"
                                title="Edit banner"
                              >
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                  <path d="M9.5 1.5l2 2-8 8H1.5v-2l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>

                              {/* Delete / inline confirm */}
                              {confirmDeleteId === banner.id ? (
                                <div className="flex items-center gap-1.5 bg-[#fff0f3] border border-[#ffd1d9] rounded-[980px] px-2 py-1 ml-0.5">
                                  <span className="text-[11px] font-medium text-[#fa243c] whitespace-nowrap">Delete?</span>
                                  <button
                                    onClick={() => handleDeleteConfirm(banner.id)}
                                    disabled={deletingId === banner.id}
                                    className="text-[11px] font-semibold text-white bg-[#fa243c] rounded-[980px] px-2 py-0.5 hover:bg-[#e02650] transition-all disabled:opacity-50 border-none cursor-pointer"
                                  >
                                    {deletingId === banner.id ? "…" : "Yes"}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-[11px] font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors bg-none border-none cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(banner.id)}
                                  disabled={deletingId === banner.id}
                                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[#aeaeb2] hover:text-[#fa243c] hover:bg-[#fff0f3] border border-transparent hover:border-[#ffd1d9] transition-all disabled:cursor-not-allowed"
                                  title="Delete banner"
                                >
                                  {deletingId === banner.id ? (
                                    <span className="w-3.5 h-3.5 border-2 border-[#ffd1d9] border-t-[#fa243c] rounded-full animate-spin" />
                                  ) : (
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                      <path d="M2 3.5h9M5 3.5V2h3v1.5M4.5 3.5v7h4v-7"
                                        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </SortableBannerItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        {banners.length > 0 && (
          <div className="px-5 py-3.5 border-t border-[#f5f5f7] bg-[#fafafa] flex items-center justify-between">
            <p className="text-[12px] text-[#aeaeb2]">
              {banners.length} {banners.length === 1 ? "banner" : "banners"} · {activeCount} active
            </p>
            <p className="text-[12px] text-[#aeaeb2]">
              Drag handle to reorder
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <BannerFormModal
          banner={selectedBanner}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BannerManager;
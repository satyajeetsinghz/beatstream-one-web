import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { ISong } from "@/features/songs/types";
import { useSections } from "@/features/sections/hooks/useSections";

interface Props {
  song: ISong | null;
  onClose: () => void;
}

const SongEditModal = ({ song, onClose }: Props) => {
  const { sections } = useSections();
  const [visible,  setVisible]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({
    title:      "",
    artist:     "",
    album:      "",
    duration:   "",
    sectionIds: [] as string[],
  });

  // Sync form when song changes
  useEffect(() => {
    if (song) {
      setForm({
        title:      song.title      ?? "",
        artist:     song.artist     ?? "",
        album:      song.album      ?? "",
        duration:   song.duration   ?? "",
        sectionIds: song.sectionIds ?? [],
      });
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [song]);

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 260);
  };

  const toggleSection = (id: string) => {
    setForm((prev) => ({
      ...prev,
      sectionIds: prev.sectionIds.includes(id)
        ? prev.sectionIds.filter((s) => s !== id)
        : [...prev.sectionIds, id],
    }));
  };

  const handleSave = async () => {
    if (!song) return;
    if (!form.title.trim() || !form.artist.trim()) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "songs", song.id), {
        title:      form.title.trim(),
        artist:     form.artist.trim(),
        album:      form.album.trim(),
        duration:   form.duration.trim(),
        sectionIds: form.sectionIds,
      });
      handleClose();
    } catch (err) {
      console.error("Failed to update song:", err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!song) return null;

  const activeSections = sections.filter((s) => s.isActive);
  const isValid = form.title.trim() && form.artist.trim();

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.26s ease" }}
        className="fixed inset-0 bg-black/20 backdrop-blur-[6px] z-[300]"
      />

      {/* Drawer */}
      <div
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)", transition: "transform 0.26s cubic-bezier(0.32,0,0.15,1)" }}
        className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[95vw] bg-white border-l border-[#e5e5ea] z-[301] flex flex-col overflow-y-auto"
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f5f5f7] sticky top-0 bg-white z-10">
          <button
            onClick={handleClose}
            className="w-[30px] h-[30px] rounded-full bg-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-center text-[#aeaeb2] hover:bg-[#e5e5ea] hover:text-[#6e6e73] transition-all flex-shrink-0"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="flex-1 text-[13px] font-semibold text-[#aeaeb2]">Edit Song</span>
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="flex items-center justify-center px-4 py-[7px] rounded-[980px] bg-[#fa243c] text-white text-[13px] font-semibold border-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e02650] min-w-[72px]"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            ) : "Save"}
          </button>
        </div>

        {/* Cover preview */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-[12px] overflow-hidden bg-[#f5f5f7] flex-shrink-0 shadow-sm">
            {song.coverUrl ? (
              <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19V6l12-3v13" stroke="#d1d1d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="19" r="3" stroke="#d1d1d6" strokeWidth="1.5"/>
                  <circle cx="18" cy="16" r="3" stroke="#d1d1d6" strokeWidth="1.5"/>
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[#1d1d1f] truncate">{song.title}</p>
            <p className="text-[13px] text-[#aeaeb2] truncate mt-0.5">{song.artist}</p>
          </div>
        </div>

        <div className="h-px bg-[#f5f5f7] mx-5" />

        {/* Form fields */}
        <div className="px-5 pt-5 pb-6 flex flex-col gap-5">

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
              Song Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Bohemian Rhapsody"
              className="w-full px-4 py-2.5 bg-white border border-[#e5e5ea] rounded-[10px] text-[13px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
            />
          </div>

          {/* Artist */}
          <div>
            <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
              Artist *
            </label>
            <input
              type="text"
              value={form.artist}
              onChange={(e) => setForm((p) => ({ ...p, artist: e.target.value }))}
              placeholder="e.g. Queen"
              className="w-full px-4 py-2.5 bg-white border border-[#e5e5ea] rounded-[10px] text-[13px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
            />
          </div>

          {/* Album + Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
                Album
              </label>
              <input
                type="text"
                value={form.album}
                onChange={(e) => setForm((p) => ({ ...p, album: e.target.value }))}
                placeholder="e.g. A Night at the Opera"
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5ea] rounded-[10px] text-[13px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
                Duration
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 3:45"
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5ea] rounded-[10px] text-[13px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
              />
            </div>
          </div>

          {/* Sections */}
          <div>
            <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
              Sections
              {form.sectionIds.length > 0 && (
                <span className="ml-2 text-[#fa243c] normal-case tracking-normal">
                  {form.sectionIds.length} selected
                </span>
              )}
            </label>
            {activeSections.length === 0 ? (
              <p className="text-[12px] text-[#aeaeb2]">No active sections available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeSections.map((section) => {
                  const selected = form.sectionIds.includes(section.id);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className={`px-3 py-1.5 rounded-[980px] text-[12px] font-semibold border transition-all ${
                        selected
                          ? "bg-[#fa243c] text-white border-[#fa243c]"
                          : "bg-white text-[#6e6e73] border-[#e5e5ea] hover:border-[#fa243c] hover:text-[#fa243c]"
                      }`}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default SongEditModal;
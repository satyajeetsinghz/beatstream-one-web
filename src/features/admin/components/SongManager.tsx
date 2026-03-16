import {
  useState,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { useSongs } from "@/features/songs/hooks/useSongs";
import { ISong } from "@/features/songs/types";
import SongEditModal from "./SongEditModal";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (ts: any): string => {
  if (!ts) return "—";
  try {
    const ms = ts?.seconds ? ts.seconds * 1000 : ts?.toDate?.()?.getTime?.();
    if (!ms) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }).format(new Date(ms));
  } catch { return "—"; }
};

type SortKey = "title" | "artist" | "likeCount" | "createdAt";
type SortDir = "asc" | "desc";

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  accent: string;
}

const StatCard = ({ label, value, accent }: StatCardProps) => (
  <div className="bg-white border border-[#e5e5ea] rounded-[18px] p-[20px_18px_18px] flex flex-col gap-1 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
    <span className="text-[28px] font-bold tracking-[-1px] leading-none" style={{ color: accent }}>
      {value}
    </span>
    <span className="text-[12px] font-medium text-[#6e6e73]">{label}</span>
  </div>
);

// ── Sort icon ─────────────────────────────────────────────────────────────────

const SortIcon = ({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) => {
  const active = sortKey === col;
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
      style={{ color: active ? "#fa243c" : "#d1d1d6", flexShrink: 0 }}>
      {active && sortDir === "asc"
        ? <path d="M2 7l3.5-4L9 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        : active && sortDir === "desc"
        ? <path d="M2 4l3.5 4L9 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        : <>
            <path d="M2 4l3.5-3L9 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 7l3.5 3L9 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </>
      }
    </svg>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const SongManager = () => {
  const { songs, loading } = useSongs();

  // Filters — immediate (UI) + deferred (filtering)
  const [search,         setSearch]         = useState("");
  const [deferredSearch, setDeferredSearch] = useState("");
  const [isPending,      startTransition]   = useTransition();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    startTransition(() => setDeferredSearch(value));
  }, []);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // Selected song for edit drawer
  const [editSong, setEditSong] = useState<ISong | null>(null);

  // Delete state
  const [deletingId,      setDeletingId]      = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Summary stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      songs.length,
    totalLikes: songs.reduce((acc, s) => acc + (s.likeCount ?? 0), 0),
    withAlbum:  songs.filter((s) => s.album && s.album.trim() !== "").length,
  }), [songs]);

  // ── Filtered + sorted list ──────────────────────────────────────────────────
  const filtered = useMemo<ISong[]>(() => {
    const q = deferredSearch.trim().toLowerCase();

    let result = q
      ? songs.filter(
          (s) =>
            s.title?.toLowerCase().includes(q) ||
            s.artist?.toLowerCase().includes(q) ||
            s.album?.toLowerCase().includes(q)
        )
      : [...songs];

    result.sort((a, b) => {
      let av: any, bv: any;

      if (sortKey === "createdAt") {
        av = a.createdAt?.seconds ?? 0;
        bv = b.createdAt?.seconds ?? 0;
      } else if (sortKey === "likeCount") {
        av = a.likeCount ?? 0;
        bv = b.likeCount ?? 0;
      } else {
        av = (a[sortKey] ?? "").toLowerCase();
        bv = (b[sortKey] ?? "").toLowerCase();
      }

      if (av < bv) return sortDir === "asc" ? -1 :  1;
      if (av > bv) return sortDir === "asc" ?  1 : -1;
      return 0;
    });

    return result;
  }, [songs, deferredSearch, sortKey, sortDir]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await deleteDoc(doc(db, "songs", id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete song");
    } finally {
      setDeletingId(null);
    }
  }, []);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-[18px] border border-[#e5e5ea] p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-7 h-7 border-2 border-[#ffd1d9] border-t-[#fa243c] rounded-full animate-spin" />
          <p className="text-[13px] text-[#aeaeb2]">Loading songs…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-7">

        {/* ── Header ── */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(24px,2.8vw,34px)] font-bold text-[#1d1d1f] tracking-[-0.7px] leading-[1.08] mb-1.5">
              Song Library
            </h1>
            <p className="text-[15px] text-[#6e6e73] m-0">
              Manage your music catalog
            </p>
          </div>
          <span className="text-[15px] font-medium text-[#6e6e73] whitespace-nowrap pb-[3px]">
            {stats.total} songs
          </span>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-3.5">
          <StatCard label="Total Songs"  value={stats.total}      accent="#1d1d1f" />
          <StatCard label="Total Likes"  value={stats.totalLikes} accent="#fa243c" />
          <StatCard label="With Album"   value={stats.withAlbum}  accent="#34c759" />
        </div>

        {/* ── Filter bar ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px] relative flex items-center">
            <SearchIcon className="absolute left-3 text-[#aeaeb2] pointer-events-none" sx={{ fontSize: 14 }} />
            <input
              type="text"
              placeholder="Search by title, artist or album…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full py-2.5 pl-9 pr-9 bg-white border border-[#e5e5ea] rounded-lg text-[13px] text-[#1d1d1f] outline-none shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#aeaeb2] focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-2 w-5 h-5 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#aeaeb2] hover:bg-[#e5e5ea] hover:text-[#6e6e73] transition-all"
                aria-label="Clear search"
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </button>
            )}
          </div>

          <span
            className="text-[13px] text-[#aeaeb2] ml-auto whitespace-nowrap tabular-nums transition-opacity duration-150"
            style={{ opacity: isPending ? 0.4 : 1 }}
          >
            {filtered.length} of {stats.total}
          </span>
        </div>

        {/* ── Table ── */}
<div
  className="bg-white border border-[#e5e5ea] rounded-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden transition-opacity duration-150 flex flex-col"
  style={{ opacity: isPending ? 0.65 : 1, maxHeight: '600px' }}
>
  {filtered.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="20" stroke="#e5e5ea" strokeWidth="1.5"/>
        <path d="M14 32V18l16-4v14" stroke="#d1d1d6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="11" cy="32" r="3" stroke="#d1d1d6" strokeWidth="1.4"/>
        <circle cx="27" cy="28" r="3" stroke="#d1d1d6" strokeWidth="1.4"/>
      </svg>
      <div className="text-center">
        <p className="text-[14px] text-[#6e6e73]">No songs found</p>
        <p className="text-[12px] text-[#aeaeb2] mt-1">
          {search ? "Try a different search term" : "Upload your first song to get started"}
        </p>
      </div>
    </div>
  ) : (
    <>
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f5f5f7]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-[#fafafa]">
                <th className="px-5 py-3 text-left w-14" />
                {([
                  { key: "title",     label: "Title"   },
                  { key: "artist",    label: "Artist"  },
                ] as { key: SortKey; label: string }[]).map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] hover:text-[#6e6e73] transition-colors cursor-pointer bg-none border-none p-0"
                    >
                      {col.label}
                      <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-left">
                  <span className="text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px]">Album</span>
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort("likeCount")}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] hover:text-[#6e6e73] transition-colors cursor-pointer bg-none border-none p-0"
                  >
                    Likes
                    <SortIcon col="likeCount" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] hover:text-[#6e6e73] transition-colors cursor-pointer bg-none border-none p-0"
                  >
                    Added
                    <SortIcon col="createdAt" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px]">Actions</span>
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(600px - 53px)' }}>
        <table className="w-full text-sm min-w-[700px]">
          <tbody className="divide-y divide-[#f5f5f7]">
            {filtered.map((song) => (
              <tr
                key={song.id}
                className="hover:bg-[#fafafa] transition-colors group"
              >
                {/* Cover */}
                <td className="px-5 py-3.5">
                  <div className="w-11 h-11 rounded-[8px] overflow-hidden bg-[#f5f5f7] shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex-shrink-0">
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 13V5l9-2v8" stroke="#d1d1d6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="3.5" cy="13" r="2.5" stroke="#d1d1d6" strokeWidth="1.3"/>
                          <circle cx="12.5" cy="11" r="2.5" stroke="#d1d1d6" strokeWidth="1.3"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </td>

                {/* Title */}
                <td className="px-4 py-3.5 max-w-[180px]">
                  <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">{song.title}</p>
                  {song.duration && (
                    <p className="text-[11px] text-[#aeaeb2] mt-0.5">{song.duration}</p>
                  )}
                </td>

                {/* Artist */}
                <td className="px-4 py-3.5 max-w-[140px]">
                  <p className="text-[13px] text-[#6e6e73] truncate">{song.artist}</p>
                </td>

                {/* Album */}
                <td className="px-4 py-3.5 max-w-[140px]">
                  <p className="text-[13px] text-[#aeaeb2] truncate">
                    {song.album && song.album.trim() ? song.album : "—"}
                  </p>
                </td>

                {/* Likes */}
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#fa243c]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M5 9L1.07 5.07a2.5 2.5 0 0 1 3.54-3.54L5 2.04l.39-.51a2.5 2.5 0 1 1 3.54 3.54L5 9z"/>
                    </svg>
                    {song.likeCount ?? 0}
                  </span>
                </td>

                {/* Added date */}
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <span className="text-[12px] text-[#aeaeb2] tabular-nums">
                    {formatDate(song.createdAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">

                    {/* Edit button */}
                    <button
                      onClick={() => setEditSong(song)}
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[#aeaeb2] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all opacity-0 group-hover:opacity-100"
                      title="Edit song"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10 2l2 2-8 8H2v-2L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Delete / confirm */}
                    {confirmDeleteId === song.id ? (
                      <div className="flex items-center gap-1.5 bg-[#fff0f3] border border-[#ffd1d9] rounded-[980px] px-2 py-1">
                        <span className="text-[11px] font-medium text-[#fa243c] whitespace-nowrap">Delete?</span>
                        <button
                          onClick={() => handleDeleteConfirm(song.id)}
                          disabled={deletingId === song.id}
                          className="text-[11px] font-semibold text-white bg-[#fa243c] rounded-[980px] px-2 py-0.5 hover:bg-[#fa243c] transition-all disabled:opacity-50"
                        >
                          {deletingId === song.id ? "…" : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px] font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(song.id)}
                        disabled={deletingId === song.id}
                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[#aeaeb2] hover:text-[#fa243c] hover:bg-[#fff0f3] transition-all opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed"
                        title="Delete song"
                      >
                        {deletingId === song.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-[#ffd1d9] border-t-[#fa243c] rounded-full animate-spin inline-block" />
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M2 3.5h9M5 3.5V2h3v1.5M4.5 3.5v7h4v-7"
                              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-[#f5f5f7] bg-[#fafafa] flex items-center justify-between">
        <p className="text-[12px] text-[#aeaeb2]">
          {filtered.length} {filtered.length === 1 ? "song" : "songs"}
          {search && filtered.length !== stats.total && (
            <span> · filtered from {stats.total} total</span>
          )}
        </p>
        <p className="text-[12px] text-[#aeaeb2]">
          {stats.totalLikes.toLocaleString()} total likes
        </p>
      </div>
    </>
  )}
</div>
      </div>

      {/* Edit drawer */}
      <SongEditModal song={editSong} onClose={() => setEditSong(null)} />
    </>
  );
};

export default SongManager;
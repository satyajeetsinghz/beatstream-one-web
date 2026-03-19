import { useState, useCallback } from "react";
import { useAuth }       from "@/features/auth/hooks/useAuth";
import { useHistory }    from "../hooks/useHistory";
import { clearHistory }  from "../services/historyService";
import SongCard          from "@/features/songs/components/SongCard";
import { SectionShell } from "@/components/shared/SectionShell";

// ── Bugs fixed ────────────────────────────────────────────────────────────────
// BUG 1 — window.confirm() blocks the main thread.
//         Fixed: inline two-step confirm matching the admin UI pattern.
// BUG 2 — alert() for error feedback.
//         Fixed: inline error state rendered below the header.
// BUG 3 — Gradient fade divs used `absolute` positioning but the parent
//         had no `relative` context outside the scroll area — the gradients
//         appeared at the wrong place on the page.
//         Fixed: gradients moved into SectionShell where they are correctly
//         anchored to the scroll container.
// BUG 4 — `w-[160px]` was set on the flex container (wrong — should be on
//         individual items). This broke wrapping and item sizing.
//         Fixed: flex container uses minWidth: "min-content" only, each item
//         has its own fixed width via the SongCard wrapper div.
// BUG 5 — handleClearHistory and scroll callbacks recreated every render.
//         Fixed: useCallback throughout.
// ─────────────────────────────────────────────────────────────────────────────

const RecentlyPlayed = () => {
  const { user }                                  = useAuth();
  const { historyTracks, loading, refresh }       = useHistory(user?.uid ?? "");
  const [clearing,     setClearing]               = useState(false);
  const [confirmClear, setConfirmClear]           = useState(false);
  const [clearError,   setClearError]             = useState<string | null>(null);

  const handleClearConfirm = useCallback(async () => {
    if (!user?.uid) return;
    setClearing(true);
    setClearError(null);
    setConfirmClear(false);
    try {
      await clearHistory(user.uid);
      refresh();
    } catch {
      setClearError("Failed to clear history. Please try again.");
    } finally {
      setClearing(false);
    }
  }, [user?.uid, refresh]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full animate-pulse">
        <div className="flex items-center justify-between mb-4 px-0.5">
          <div className="flex items-center gap-2">
            <div className="w-[3px] h-5 bg-gray-200 rounded-full" />
            <div className="h-5 w-36 bg-gray-200 rounded-md" />
          </div>
          <div className="w-24 h-7 bg-gray-100 rounded-full" />
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[140px] sm:w-[172px] flex-shrink-0">
              <div className="aspect-square bg-gray-100 rounded-xl mb-2" />
              <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />
              <div className="h-3   bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!historyTracks?.length) return null;

  // ── Action slot: "Remove History" with inline confirm ────────────────────
  const action = confirmClear ? (
    <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-[980px] px-2.5 py-1">
      <span className="text-xs font-medium text-red-500 whitespace-nowrap">Remove?</span>
      <button
        onClick={handleClearConfirm}
        disabled={clearing}
        className="text-xs font-semibold text-white bg-[#fa243c] rounded-[980px] px-2 py-0.5 hover:bg-[#e01e33] transition-colors disabled:opacity-50 border-none cursor-pointer"
      >
        {clearing ? "…" : "Yes"}
      </button>
      <button
        onClick={() => setConfirmClear(false)}
        className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors bg-none border-none cursor-pointer"
      >
        No
      </button>
    </div>
  ) : (
    <button
      onClick={() => setConfirmClear(true)}
      disabled={clearing}
      className="text-xs text-gray-400 hover:text-[#fa243c] transition-colors px-3 py-1.5 rounded-[980px] bg-gray-50 hover:bg-red-50 border border-transparent hover:border-red-100 disabled:opacity-50 whitespace-nowrap"
    >
      {clearing ? "Removing…" : "Clear History"}
    </button>
  );

  return (
    <div className="w-full">
      <SectionShell title="Recently Played" action={action} groupName="recent">
        {historyTracks.map((track, index) => (
          <div key={track.id} className="w-[140px] sm:w-[172px] flex-shrink-0">
            <SongCard
              track={track}
              songs={historyTracks}
              variant="default"
              index={index}
              disableLike={true}
            />
          </div>
        ))}
      </SectionShell>

      {/* Inline error */}
      {clearError && (
        <p className="text-xs text-red-500 mt-2 px-0.5">{clearError}</p>
      )}
    </div>
  );
};

export default RecentlyPlayed;
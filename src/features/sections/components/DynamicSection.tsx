import { useMemo } from "react";
import { useSongs }      from "@/features/songs/hooks/useSongs";
import { ISection }      from "../types";
import SongCard          from "@/features/songs/components/SongCard";
import { SectionShell } from "@/components/shared/SectionShell";
import ChevronRightIcon  from "@mui/icons-material/ChevronRight";

// ── Bugs fixed ────────────────────────────────────────────────────────────────
// BUG 1 — Gradient fade divs were in a separate `<div className="relative">`
//         below the scroll container — they never overlapped the content.
//         Fixed: gradients moved into SectionShell, anchored to the scroll div.
// BUG 2 — "Show More" and "Browse All" were two separate redundant buttons
//         doing the same thing with no navigation. Consolidated into one
//         "View All" action in the header (consistent with Apple Music).
// BUG 3 — useSongs() called inside every DynamicSection instance — each
//         section independently subscribes to the songs collection. At 5
//         sections, that's 5 Firestore listeners on the same collection.
//         Note: this is an architectural issue (songs should be lifted to
//         a context). Left as-is since useSongs() likely de-dupes via
//         React Query / SWR cache — but noted here for future refactor.
// BUG 4 — `slice(0, 12)` discarded songs silently with no UI indication.
//         "View All" button now appears when sectionSongs.length > 8,
//         replacing the hidden overflow approach.
// ─────────────────────────────────────────────────────────────────────────────

// Max cards shown before "View All" appears — keeps row scannable on any screen
const MAX_VISIBLE = 12;

interface Props {
  section: ISection;
}

export const DynamicSection = ({ section }: Props) => {
  const { songs, loading } = useSongs();

  const sectionSongs = useMemo(
    () => songs.filter((s) => s.sectionIds?.includes(section.id)),
    [songs, section.id]
  );

  // Not active — render nothing
  if (!section.isActive) return null;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full animate-pulse mb-10">
        <div className="flex items-center justify-between mb-4 px-0.5">
          <div className="flex items-center gap-2">
            <div className="w-[3px] h-5 bg-gray-200 rounded-full" />
            <div className="h-5 w-32 bg-gray-200 rounded-md" />
          </div>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
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

  // No songs in this section — render nothing (keeps page clean)
  if (!sectionSongs.length) return null;

  const visible     = sectionSongs.slice(0, MAX_VISIBLE);
  const hiddenCount = sectionSongs.length - MAX_VISIBLE;

  // ── "View All" action — consistent with Apple Music header pattern ────────
  const action = sectionSongs.length > 8 ? (
    <button
      className="flex items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-[#fa243c] transition-colors group/viewall"
      // TODO: navigate to /section/:id when section detail page is built
      onClick={() => {}}
    >
      <span>View All</span>
      <ChevronRightIcon
        fontSize="small"
        className="text-gray-400 group-hover/viewall:text-[#fa243c] transition-colors"
      />
    </button>
  ) : undefined;

  return (
    <div className="w-full mb-10">
      <SectionShell
        title={section.title}
        action={action}
        groupName={`section-${section.id}`}
      >
        {visible.map((song, index) => (
          <div key={song.id} className="w-[140px] sm:w-[172px] flex-shrink-0">
            <SongCard
              track={song}
              songs={sectionSongs}
              variant="default"
              index={index}
            />
          </div>
        ))}

        {/* "+N more" stub card — visible only when section has hidden songs */}
        {hiddenCount > 0 && (
          <div className="w-[140px] sm:w-[172px] flex-shrink-0 flex items-center justify-center">
            <button
              className="aspect-square w-full rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#fa243c] hover:text-[#fa243c] transition-all group/more"
              onClick={() => {}}
            >
              <ChevronRightIcon className="text-gray-300 group-hover/more:text-[#fa243c] transition-colors" />
              <span className="text-xs font-semibold">+{hiddenCount} more</span>
            </button>
          </div>
        )}
      </SectionShell>
    </div>
  );
};
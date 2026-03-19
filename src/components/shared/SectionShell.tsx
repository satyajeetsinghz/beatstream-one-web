import { ReactNode, useState } from "react";
import ChevronLeftIcon  from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useHorizontalScroll } from "./useHorizontalScroll";

// ── Root cause of missing arrows ─────────────────────────────────────────────
// The original used `group/${groupName}` + `group-hover/${groupName}:opacity-100`
// where groupName was a dynamic runtime value (e.g. "section-abc123").
// Tailwind's JIT compiler scans source files for static strings at build time —
// it never sees these dynamic class names and does NOT include them in the CSS
// bundle. At runtime the class exists in the DOM but has no styles, so the
// arrows stay at opacity-0 forever regardless of hover.
//
// Fix: replace the CSS group-hover mechanism with a React `isHovered` state.
// onMouseEnter/onMouseLeave on the container drives arrow visibility directly
// via an inline style — no Tailwind scanning required, works for any content.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  title:    string;
  action?:  ReactNode;
  children: ReactNode;
  /** groupName prop kept for API compatibility but no longer used internally */
  groupName?: string;
}

export const SectionShell = ({ title, action, children }: Props) => {
  const { ref, showLeft, showRight, onScroll, scrollLeft, scrollRight } =
    useHorizontalScroll(320);

  // React state drives arrow opacity — immune to Tailwind JIT scanning
  const [isHovered, setIsHovered] = useState(false);

  const arrowBase =
    "absolute top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-[#fa243c] rounded-full " +
    "shadow-md flex items-center justify-center transition-all duration-200 " +
    "hover:bg-[] hover:shadow-lg";

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-[4px] h-5 rounded-full bg-[#fa243c]" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
            {title}
          </h2>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* ── Scroll container ── */}
      <div className="relative">

        {/* Left arrow — opacity driven by React state, not Tailwind group */}
        {showLeft && (
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className={`${arrowBase} left-0 -ml-3`}
            style={{
              opacity:    isHovered ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            <ChevronLeftIcon className="text-neutral-100" fontSize="small" />
          </button>
        )}

        {/* Left gradient */}
        {showLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-[5]" />
        )}

        {/* Scroll track */}
        <div
          ref={ref}
          onScroll={onScroll}
          className="overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-3 sm:gap-4" style={{ minWidth: "min-content" }}>
            {children}
          </div>
        </div>

        {/* Right gradient */}
        {showRight && (
          <div className="absolute right-0 top-0 bottom-2 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none z-[5]" />
        )}

        {/* Right arrow — opacity driven by React state, not Tailwind group */}
        {showRight && (
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className={`${arrowBase} right-0 -mr-3`}
            style={{
              opacity:    isHovered ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            <ChevronRightIcon className="text-neutral-100" fontSize="small" />
          </button>
        )}
      </div>
    </div>
  );
};
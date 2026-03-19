import { useState, ReactNode } from "react";
import { DescriptionModal } from "./DescriptionModal";

// ── HeroInfoPanel ─────────────────────────────────────────────────────────────
// The right-side info panel in the Apple Music hero layout.
//
// KEY LAYOUT RULES from the reference:
//   1. Panel height is FIXED at exactly COVER_H (220px) to align with the cover.
//      Content is distributed vertically: title+subtitle at top, description in
//      middle (fixed 2-line truncation), meta+actions pinned to bottom.
//   2. Description is always clamped to 2 lines (line-clamp-2).
//      Hovering shows a cursor-pointer hint; clicking opens DescriptionModal.
//   3. On mobile the panel height is auto (stacked layout under the cover).
// ─────────────────────────────────────────────────────────────────────────────

const COVER_H = 220; // must match the cover div height in both pages

interface HeroInfoPanelProps {
  title:        string;
  subtitle:     string;      // red line (e.g. "Your Playlist", curator name)
  description:  string;      // full description text
  meta:         ReactNode;   // the small · separated meta row
  actions:      ReactNode;   // Play / Shuffle / New Playlist buttons
}

export const HeroInfoPanel = ({
  title, subtitle, description, meta, actions,
}: HeroInfoPanelProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Desktop: fixed height = cover height, flex-col space-between */}
      <div
        className="flex-1 hidden sm:flex flex-col text-left"
        style={{ height: COVER_H }}
      >
        {/* ── Top: title + subtitle ── */}
        <div>
          <h1
            className="font-bold text-[#1d1d1f] tracking-[-0.5px] leading-none"
            style={{ fontSize: "clamp(28px, 3.5vw, 42px)" }}
          >
            {title}
          </h1>
          <p className="text-[17px] font-semibold mt-1.5" style={{ color: "#fa243c" }}>
            {subtitle}
          </p>
        </div>

        {/* ── Middle: description — always 2-line clamp, click to expand ── */}
        {description && (
          <div className="mt-3 flex-1 flex items-start">
            <button
              className="text-left group w-full"
              onClick={() => setModalOpen(true)}
              title="Click to read more"
            >
              <p
                className="text-[13px] text-[#6e6e73] leading-[1.6] group-hover:text-[#3c3c43] transition-colors"
                style={{
                  display:           "-webkit-box",
                  WebkitLineClamp:   2,
                  WebkitBoxOrient:   "vertical",
                  overflow:          "hidden",
                  maxWidth:          520,
                }}
              >
                {description}
              </p>
              {/* "Read More" hint — appears on hover */}
              <span
                className="text-[12px] font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#fa243c" }}
              >
                Read More
              </span>
            </button>
          </div>
        )}

        {/* ── Bottom: meta + actions pinned to bottom ── */}
        <div className="mt-auto">
          <div className="text-[12px] text-[#6e6e73] mb-4">{meta}</div>
          <div className="flex items-center gap-3">{actions}</div>
        </div>
      </div>

      {/* Mobile: auto height, centered, with equal-width buttons */}
      <div className="flex sm:hidden flex-col items-center text-center gap-4 w-full">
        <div>
          <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.4px] leading-tight">
            {title}
          </h1>
          <p className="text-[16px] font-semibold mt-1" style={{ color: "#fa243c" }}>
            {subtitle}
          </p>
        </div>
        
        <div className="text-[12px] text-[#6e6e73] px-4">{meta}</div>
        
        {/* Actions container with full width and proper padding */}
        <div className="w-full px-4">
          {actions}
        </div>
      </div>

      {/* Description modal */}
      {modalOpen && (
        <DescriptionModal
          title={title}
          subtitle={subtitle}
          description={description}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};
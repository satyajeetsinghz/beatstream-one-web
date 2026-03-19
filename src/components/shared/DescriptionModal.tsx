import { useEffect, useRef } from "react";
import { createPortal }  from "react-dom";
import CloseIcon         from "@mui/icons-material/Close";

// ── DescriptionModal ──────────────────────────────────────────────────────────
// Renders the full description in an Apple Music-style overlay modal.
// Opened when the user clicks/hovers the truncated description in HeroInfoPanel.
// Matches the reference screenshot exactly:
//   - White modal, rounded-2xl, ~560px wide, shadow-xl
//   - × close button top-right
//   - Bold title, red subtitle, body text in normal weight grey
// ─────────────────────────────────────────────────────────────────────────────

interface DescriptionModalProps {
  title:       string;
  subtitle:    string;
  description: string;
  onClose:     () => void;
}

export const DescriptionModal = ({
  title, subtitle, description, onClose,
}: DescriptionModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <>
      {/* Backdrop — light scrim matching Apple Music */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      >
        {/* Modal card */}
        <div
          className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ maxWidth: 560, maxHeight: "80vh" }}
        >
          {/* Close button — top-right, matches reference */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] hover:bg-[#e5e5ea] transition-colors"
            aria-label="Close"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>

          {/* Scrollable content */}
          <div className="overflow-y-auto p-8" style={{ maxHeight: "80vh" }}>
            {/* Title — bold, large, matches modal in screenshot */}
            <h2 className="text-[22px] font-bold text-[#1d1d1f] tracking-[-0.3px] leading-tight pr-8">
              {title}
            </h2>
            {/* Subtitle — red, matches Apple Music curator line */}
            <p className="text-[14px] font-semibold mt-1 mb-5" style={{ color: "#fa243c" }}>
              {subtitle}
            </p>
            {/* Body — paragraph text, grey, matches reference exactly */}
            <div className="text-[14px] text-[#3c3c43] leading-[1.7] space-y-4">
              {description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
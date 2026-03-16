import { useState } from "react";
import { logoutUser } from "@/features/auth/services/auth.service";
// import CloseIcon from "@mui/icons-material/Close";
// import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { LockOutlineRounded } from "@mui/icons-material";

const SuspensionBanner = () => {
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  // ── Collapsed state — small pill like Apple Music's mini player indicator ──
  if (collapsed) {
    return (
      <>
        <button
          className="fixed top-[10px] left-1/2 -translate-x-1/2 z-[9999] inline-flex items-center gap-[6px] px-[13px] py-[5px] bg-white border border-[#e5e5ea] rounded-[980px] text-xs font-semibold text-neutral-800 cursor-pointer whitespace-nowrap shadow-[0_1px_8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.05)] transition-all duration-150 hover:shadow-[0_3px_16px_rgba(0,0,0,0.13)] hover:translate-x-[-50%] hover:-translate-y-[0px] antialiased"
          onClick={() => setCollapsed(false)}
        >
          {/* <span className="w-[5px] h-[5px] rounded-full bg-[#fa243c] flex-shrink-0 animate-[pdot_2s_ease-in-out_infinite]" /> */}
          <LockOutlineRounded sx={{ fontSize: 14, color: ["#fa243c"] }} />

          Limited Mode
        </button>
        <div className="" />

        <style>{`
          @keyframes pdot {
            0%,100% { opacity:1; }
            50%      { opacity:0.35; }
          }
        `}</style>
      </>
    );
  }

  // ── Full banner ─────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-[#e5e5ea] antialiased animate-[sbDown_0.28s_cubic-bezier(0.22,1,0.36,1)_both]"
        role="alert"
      >
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-5 py-[6px] gap-4">

          {/* Left — dot + label + pipe + description */}
          <div className="flex items-center justify-center gap-[8px] min-w-0 flex-1">
            {/* <span className="w-[6px] h-[6px] rounded-full bg-[#ff375f] flex-shrink-0 animate-[sbdot_2.4s_ease-in-out_infinite]" /> */}
            <LockOutlineRounded sx={{ fontSize: 16, color: ["#fa243c"] }} />
            <span className="text-[13px] font-semibold text-[#6e6e73] whitespace-nowrap flex-shrink-0">
              Account Locked
            </span>
            <span className="w-px h-[13px] bg-[#d1d1d6] flex-shrink-0 hidden sm:block" />
            <span className="text-[13px] text-[#6e6e73] hidden sm:block font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Limited mode is on. Likes, playlists, and history are paused.
            </span>
          </div>

          {/* Right — Appeal (red pill) · Sign Out (dark pill) · collapse */}
          <div className="flex items-center gap-[6px] flex-shrink-0">
            <a
              href="mailto:support@beatstream.com"
              className="inline-flex items-center justify-center px-4 py-1 rounded-[980px] text-[12px] font-medium cursor-pointer border-none no-underline whitespace-nowrap transition-all duration-150 active:scale-[0.96] bg-[#fa243c] text-white hover:bg-[#ff465c]"
            >
              Appeal
            </a>
            <button
              className="inline-flex items-center justify-center px-4 py-1 rounded-[980px] text-[12px] font-medium cursor-pointer border-none whitespace-nowrap transition-all duration-150 active:scale-[0.96] bg-[#262626] text-white hover:bg-[#3a3a3c]"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
            <button
              className="flex items-center justify-center w-5 h-5 rounded-full bg-transparent border border-[#e5e5ea] text-[#aeaeb2] cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7] hover:text-[#6e6e73] flex-shrink-0 ml-1"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse"
            >
              <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
            </button>
          </div>

        </div>
      </div>

      {/* Push page content below fixed banner */}
      <div className="h-[45px]" />

      <style>{`
        @keyframes sbDown {
          from { transform: translateY(-100%); }
          to   { transform: translateY(0); }
        }
        @keyframes sbdot {
          0%,100% { opacity:1; }
          50%      { opacity:0.3; }
        }
      `}</style>
    </>
  );
};

export default SuspensionBanner;
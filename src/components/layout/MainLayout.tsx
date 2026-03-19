import { Outlet }      from "react-router-dom";
import { useState }     from "react";
import Sidebar           from "./Sidebar";
import PlayerBar         from "@/features/player/components/PlayerBar";
import MobileNav         from "./MobileNav";
import { useResponsive } from "./hooks/useResponsive";
import { usePlayer }     from "@/features/player/hooks/usePlayer";

// ── Fixes ─────────────────────────────────────────────────────────────────────
//
// BUG 1 — showMobileNav re-derived as `isMobile || isTablet` instead of
//   reading the canonical flag from useResponsive.
//   When the hook's tablet threshold changed (now 768–1179px), this local
//   re-derivation silently produced the wrong value — the exact root cause
//   of the iPad Mini landscape bug where MobileNav disappeared.
//   Fix: use showMobileNav directly from the hook.
//
// BUG 2 — isDesktop used for sidebar visibility instead of showDesktopSidebar.
//   Same problem: a raw breakpoint flag instead of the canonical derived one.
//   Fix: use showDesktopSidebar from the hook.
//
// BUG 3 — isMobile, isTablet, isDesktop were destructured but never used
//   after the canonical flags were adopted. Removed unused destructures.
//
// IS usePlayer STILL NEEDED?
//   Yes — but only for two legitimate MainLayout responsibilities:
//     1. Conditionally rendering <PlayerBar /> (MainLayout owns this)
//     2. Choosing contentPadding so <Outlet /> content isn't hidden behind
//        the fixed PlayerBar (MainLayout owns this too)
//   The Sidebar now handles its OWN player-aware padding internally via its
//   own usePlayer call, so MainLayout no longer needs to pass anything down.
//   usePlayer stays, but only `currentTrack` is consumed.
// ─────────────────────────────────────────────────────────────────────────────

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Bug 1 + 2: canonical flags from the hook — one source of truth
  const { showMobileNav, showDesktopSidebar } = useResponsive();

  // usePlayer is necessary here: MainLayout renders <PlayerBar /> and
  // controls contentPadding — both depend on whether a track is loaded.
  const { currentTrack } = usePlayer();
  const isPlayerVisible  = !!currentTrack;

  // Padding keeps Outlet content clear of fixed bars at the bottom:
  //   mobile/tablet: PlayerBar (~80px) + MobileNav (~60px)
  //   desktop:       PlayerBar (~80px) only
  const contentPadding =
    showMobileNav
      ? isPlayerVisible ? "pb-40" : "pb-20"
      : isPlayerVisible ? "pb-24" : "pb-6";

  return (
    <div className="h-screen bg-white flex overflow-hidden">

      {/* Desktop sidebar — always visible at 1180px+ */}
      {showDesktopSidebar && <Sidebar />}

      {/* Mobile/tablet slide-out — Sidebar owns its backdrop internally */}
      {!showDesktopSidebar && (
        <Sidebar
          isMobile={true}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content — pb clears PlayerBar + MobileNav */}
      <main className={`flex-1 overflow-y-auto bg-white scroll-smooth ${contentPadding}`}>
        <Outlet />
      </main>

      {/* Player bar — fixed, only when a track is loaded */}
      {isPlayerVisible && <PlayerBar />}

      {/* Mobile/tablet bottom nav — only below 1180px */}
      {showMobileNav && (
        <MobileNav />
      )}

    </div>
  );
};

export default MainLayout;
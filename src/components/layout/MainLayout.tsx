import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
// import Topbar from "./Topbar";
import PlayerBar from "@/features/player/components/PlayerBar";
import { useResponsive } from "./hooks/useResponsive";
import MobileNav from "./MobileNav";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDesktop, isMobile, isTablet } = useResponsive(); // Added isTablet
  const { currentTrack } = usePlayer();
  const isPlayerVisible = !!currentTrack;

  // Show mobile nav for both mobile and tablet
  const showMobileNav = isMobile || isTablet;

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Desktop Sidebar - with dynamic bottom padding */}
      {isDesktop && (
        <div className="h-full flex flex-col">
          <Sidebar />
          {/* Dynamic spacer for player bar */}
          {isPlayerVisible && <div className="h-24 flex-shrink-0" />}
        </div>
      )}

      {/* Mobile/Tablet Sidebar - slide-out panel */}
      {!isDesktop && (
        <Sidebar 
          isMobile={true}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Section */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Topbar */}
        {/* <Topbar /> */}

        {/* Content Area - scrollable with dynamic bottom padding */}
        <div className="flex-1 overflow-y-auto bg-white scroll-smooth">
          {/* Dynamic bottom padding based on player visibility and device */}
          <div className={`
            ${isMobile 
              ? isPlayerVisible ? 'pb-32' : 'pb-16'  // Mobile: with/without player
              : isTablet
                ? isPlayerVisible ? 'pb-32' : 'pb-16'  // Tablet: same as mobile
                : isPlayerVisible ? 'pb-24' : 'pb-8'   // Desktop: with/without player
            }
          `}>
            <Outlet />
          </div>
        </div>
      </div>

      {/* Player Bar - only shown when there's a track playing */}
      {isPlayerVisible && <PlayerBar />}

      {/* Mobile/Tablet Bottom Navigation - on mobile AND tablet */}
      {showMobileNav && <MobileNav />}

      {/* Overlay for mobile/tablet menu */}
      {!isDesktop && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
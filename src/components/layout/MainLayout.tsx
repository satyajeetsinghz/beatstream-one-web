import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PlayerBar from "@/features/player/components/PlayerBar";
import { useResponsive } from "./hooks/useResponsive";
import MobileNav from "./MobileNav";

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDesktop, isMobile } = useResponsive();

  return (
    <div className="h-screen bg-white flex overflow-hidden pt-16 sm:pt-20">
      {/* Desktop Sidebar - visible only on desktop */}
      {isDesktop && <Sidebar />}

      {/* Mobile Sidebar - slide-out panel */}
      {!isDesktop && (
        <Sidebar 
          isMobile={true}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Section */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Topbar with mobile menu toggle - fixed at top */}
        <Topbar 
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Content Area - scrollable with top padding for fixed Topbar */}
        <div className="flex-1 overflow-y-auto bg-white scroll-smooth">
          {/* Add padding for player bar and mobile nav */}
          <div className={`${isMobile ? 'pb-32' : 'pb-24'}`}>
            <Outlet />
          </div>
        </div>
      </div>

      {/* Player Bar - fixed at bottom */}
      <PlayerBar />

      {/* Mobile Bottom Navigation - only on mobile */}
      {isMobile && <MobileNav />}

      {/* Overlay for mobile menu */}
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
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useHistory } from "../hooks/useHistory";
import SongCard from "@/features/songs/components/SongCard";
// import HistoryIcon from '@mui/icons-material/History';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { clearHistory } from "../services/historyService";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import { useState, useRef } from "react";

const RecentlyPlayed = () => {
  const { user } = useAuth();
  const { historyTracks, loading, refresh } = useHistory(user?.uid || "");
  const [clearing, setClearing] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsive();

  const handleClearHistory = async () => {
    if (!user?.uid) return;

    const confirmClear = window.confirm(
      "Are you sure you want to clear your listening history?"
    );

    if (!confirmClear) return;

    try {
      setClearing(true);
      await clearHistory(user.uid);
      refresh();
    } catch (error) {
      console.error("Failed to clear history:", error);
      alert("Failed to clear history");
    } finally {
      setClearing(false);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="w-full animate-pulse">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 sm:h-5 bg-[#FA2E6E] rounded-full"></div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recently Played</h2>
          </div>
          <div className="w-20 sm:w-16 h-6 sm:h-8 bg-gray-200 rounded-full ml-auto sm:ml-0"></div>
        </div>

        {/* Horizontal Scroll Skeleton */}
        <div className="relative">
          <div className="flex gap-3 sm:gap-4 overflow-x-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40 sm:w-44 md:w-48 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg sm:rounded-xl mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no history
  if (!historyTracks || historyTracks.length === 0) return null;

  return (
    <div className="w-full group/recent">
      {/* Header with Apple Music styling - Responsive */}
      <div className="flex flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-1 h-4 sm:h-5 bg-[#FA2E6E] rounded-full"></div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recently Played</h2>
          {/* <span className="text-xs text-gray-400">
            {historyTracks.length} {historyTracks.length === 1 ? 'song' : 'songs'}
          </span> */}
        </div>

        <div className=" sm:mr-2">
          {/* Clear All Button - Responsive */}
          {historyTracks.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className={`ml-0 sm:ml-2 text-xs text-gray-500/80 hover:text-white transition-colors px-2 py-1 rounded-md bg-slate-100 hover:bg-[#FA2E6E] whitespace-nowrap ${clearing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {clearing ? 'Removing...' : 'Remove History'}
            </button>
          )}
        </div>

        {/* History indicator - Responsive */}
        {/* <div className="flex items-center gap-1 text-xs text-gray-400">
          <HistoryIcon fontSize="small" className="text-gray-300" />
          <span>{isMobile ? 'History' : 'From your history'}</span>
        </div> */}
      </div>

      {/* Horizontal Scroll Container with Navigation Buttons */}
      <div className="relative">
        {/* Left Navigation Button */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/recent:opacity-100 transition-opacity duration-200 hover:bg-gray-50 -ml-3"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="text-gray-600" fontSize="small" />
          </button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex w-[160px] sm:w-[180px] gap-2 sm:gap-4 cursor-pointer" style={{ minWidth: 'min-content' }}>
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
          </div>
        </div>

        {/* Right Navigation Button */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/recent:opacity-100 transition-opacity duration-200 hover:bg-gray-50 -mr-3"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="text-gray-600" fontSize="small" />
          </button>
        )}
      </div>

      {/* Gradient fade indicators */}
      <div className="absolute left-0 mt-2 w-8 h-32 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
      <div className="absolute right-0 mt-2 w-8 h-32 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>

      {/* View all link for mobile (if more than 6 items) */}
      {historyTracks.length > 6 && isMobile && (
        <div className="mt-4 text-center">
          <button className="text-xs text-gray-400 hover:text-[#FA2E6E] transition-colors">
            View all {historyTracks.length} songs
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentlyPlayed;
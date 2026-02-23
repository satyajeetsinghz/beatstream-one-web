import { useAuth } from "@/features/auth/hooks/useAuth";
import { useHistory } from "../hooks/useHistory";
import SongCard from "@/features/songs/components/SongCard";
import HistoryIcon from '@mui/icons-material/History';
import { clearHistory } from "../services/historyService";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import { useState } from "react";

const RecentlyPlayed = () => {
  const { user } = useAuth();
  const { historyTracks, loading, refresh } = useHistory(user?.uid || "");
  const [clearing, setClearing] = useState(false);
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

        {/* Grid Skeleton - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg sm:rounded-xl mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Don't render if no history
  if (!historyTracks || historyTracks.length === 0) return null;

  return (
    <div className="w-full">
      {/* Header with Apple Music styling - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-1 h-4 sm:h-5 bg-[#FA2E6E] rounded-full"></div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recently Played</h2>
          <span className="text-xs text-gray-400">
            {historyTracks.length} {historyTracks.length === 1 ? 'song' : 'songs'}
          </span>

          {/* Clear All Button - Responsive */}
          {historyTracks.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className={`ml-0 sm:ml-2 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-full hover:bg-red-50 whitespace-nowrap ${
                clearing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>

        {/* History indicator - Responsive */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <HistoryIcon fontSize="small" className="text-gray-300" />
          <span>{isMobile ? 'History' : 'From your history'}</span>
        </div>
      </div>

      {/* Grid Layout - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {historyTracks.map((track, index) => (
          <div key={track.id} className="relative group">
            {/* Recent badge for first item - Responsive positioning */}
            {/* {index === 0 && (
              <div className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 z-10">
                <div className="relative">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#FA2E6E] rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-[#FA2E6E] rounded-full animate-ping opacity-20"></div>
                </div>
              </div>
            )} */}

            {/* Optional: Show index number on hover for desktop */}
            {/* {!isMobile && index < 3 && (
              <div className="absolute -top-2 -left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 bg-[#FA2E6E] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                  {index + 1}
                </div>
              </div>
            )} */}

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
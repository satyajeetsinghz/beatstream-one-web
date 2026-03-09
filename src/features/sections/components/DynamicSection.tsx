import { useMemo, useRef, useState } from "react";
import { useSongs } from "@/features/songs/hooks/useSongs";
import { ISection } from "../types";
import SongCard from "@/features/songs/components/SongCard";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface Props {
  section: ISection;
}

export const DynamicSection = ({ section }: Props) => {
  const { songs, loading } = useSongs();
  const { isMobile } = useResponsive();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sectionSongs = useMemo(() => {
    return songs.filter((song) =>
      song.sectionIds?.includes(section.id)
    );
  }, [songs, section.id]);

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

  // Don't render inactive sections
  if (!section.isActive) return null;

  // Loading State - Show skeleton
  if (loading) {
    return (
      <div className="mb-8 sm:mb-10 md:mb-12">
        {/* Section Header Skeleton - Responsive */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 sm:h-5 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-5 sm:h-6 w-28 sm:w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-16 h-6 sm:w-20 sm:h-8 bg-gray-200 rounded-full animate-pulse"></div>
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

  // Don't render if no songs
  if (!sectionSongs.length) return null;

  return (
    <div className="mb-8 sm:mb-10 md:mb-12 group/section">
      {/* Section Header with Apple Music styling - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 sm:h-5 bg-[#FA2E6E] rounded-full"></div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {section.title}
          </h2>
          <span className="text-xs text-gray-400 ml-1">
            {sectionSongs.length} {sectionSongs.length === 1 ? 'song' : 'songs'}
          </span>
        </div>

        {/* View All Link - Responsive */}
        {sectionSongs.length > 8 && (
          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#FA2E6E] transition-colors self-start sm:self-auto group">
            <span className="font-medium">View All</span>
            <ChevronRightIcon 
              fontSize="small" 
              className="text-gray-400 group-hover:text-[#FA2E6E] transition-colors" 
              sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
            />
          </button>
        )}
      </div>

      {/* Horizontal Scroll Container with Navigation Buttons */}
      <div className="relative">
        {/* Left Navigation Button */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity duration-200 hover:bg-gray-50 -ml-3"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="text-gray-600" fontSize="small" />
          </button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ minWidth: 'min-content' }}>
            {sectionSongs.slice(0, 12).map((song, index) => (
              <div key={song.id} className="w-40 sm:w-44 md:w-48 flex-shrink-0">
                <SongCard
                  track={song}
                  songs={sectionSongs}
                  variant="default"
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Navigation Button */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity duration-200 hover:bg-gray-50 -mr-3"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="text-gray-600" fontSize="small" />
          </button>
        )}
      </div>

      {/* Gradient fade indicators */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>

      {/* Show More Indicator - Only shows if there are more songs beyond what's shown */}
      {sectionSongs.length > 12 && (
        <div className="text-center mt-4">
          <button className="text-xs text-gray-400 hover:text-[#FA2E6E] transition-colors group flex items-center justify-center gap-1 mx-auto">
            <span>+ {sectionSongs.length - 12} more songs</span>
            <ChevronRightIcon 
              fontSize="small" 
              className="text-gray-400 group-hover:text-[#FA2E6E] transition-colors" 
              sx={{ fontSize: '1rem' }}
            />
          </button>
        </div>
      )}

      {/* Browse all link for larger sections */}
      {!isMobile && sectionSongs.length > 16 && (
        <div className="mt-4 text-right">
          <button className="text-xs text-gray-400 hover:text-[#FA2E6E] transition-colors">
            Browse all {sectionSongs.length} songs
          </button>
        </div>
      )}
    </div>
  );
};
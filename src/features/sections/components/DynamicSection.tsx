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

  if (!section.isActive) return null;

  if (loading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-gray-200 rounded-full"></div>
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-[180px] flex-shrink-0">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!sectionSongs.length) return null;

  return (
    <div className="mb-10 group/section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#fa243c] rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900">
            {section.title}
          </h2>
          {/* <span className="text-xs text-gray-400 ml-1">
            {sectionSongs.length} {sectionSongs.length === 1 ? 'song' : 'songs'}
          </span> */}
        </div>

        {sectionSongs.length > 8 && (
          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#fa243c] transition-colors">
            <span className="font-medium">View All</span>
            <ChevronRightIcon fontSize="small" />
          </button>
        )}
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
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
          className="overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-2 sm:gap-4" style={{ minWidth: 'min-content' }}>
            {sectionSongs.slice(0, 12).map((song, index) => (
              <div key={song.id} className="w-[140px] sm:w-[172px] flex-shrink-0">
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

        {/* Right Arrow */}
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
        <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>

      {/* Show More Indicator */}
      {sectionSongs.length > 12 && (
        <div className="text-center mt-3">
          <button className="text-xs text-gray-400 hover:text-[#fa243c] transition-colors group flex items-center justify-center gap-1 mx-auto">
            <span>+ {sectionSongs.length - 12} more songs</span>
            <ChevronRightIcon fontSize="small" className="text-gray-400 group-hover:text-[#fa243c]" />
          </button>
        </div>
      )}

      {/* Browse all link for desktop */}
      {!isMobile && sectionSongs.length > 16 && (
        <div className="text-right mt-2">
          <button className="text-xs text-gray-400 hover:text-[#fa243c] transition-colors">
            Browse all {sectionSongs.length} songs
          </button>
        </div>
      )}
    </div>
  );
};
import { useMemo } from "react";
import { useSongs } from "@/features/songs/hooks/useSongs";
import { ISection } from "../types";
import SongCard from "@/features/songs/components/SongCard";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface Props {
  section: ISection;
}

export const DynamicSection = ({ section }: Props) => {
  const { songs, loading } = useSongs();
  const { isMobile } = useResponsive();

  const sectionSongs = useMemo(() => {
    return songs.filter((song) =>
      song.sectionIds?.includes(section.id)
    );
  }, [songs, section.id]);

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

        {/* Grid Skeleton - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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

  // Don't render if no songs
  if (!sectionSongs.length) return null;

  return (
    <div className="mb-8 sm:mb-10 md:mb-12">
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
        {sectionSongs.length > 6 && (
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

      {/* Songs Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {sectionSongs.slice(0, isMobile ? 4 : 6).map((song, index) => (
          <SongCard
            key={song.id}
            track={song}
            songs={sectionSongs}
            variant="default"
            index={index}
          />
        ))}
      </div>

      {/* Show More Indicator - Responsive */}
      {sectionSongs.length > (isMobile ? 4 : 6) && (
        <div className="text-center mt-3 sm:mt-4">
          <button className="text-xs text-gray-400 hover:text-[#FA2E6E] transition-colors group flex items-center justify-center gap-1 mx-auto">
            <span>+ {sectionSongs.length - (isMobile ? 4 : 6)} more songs</span>
            <ChevronRightIcon 
              fontSize="small" 
              className="text-gray-400 group-hover:text-[#FA2E6E] transition-colors" 
              sx={{ fontSize: '1rem' }}
            />
          </button>
        </div>
      )}

      {/* Optional: Show all songs on desktop with horizontal scroll for larger sections */}
      {!isMobile && sectionSongs.length > 10 && (
        <div className="mt-4 text-right">
          <button className="text-xs text-gray-400 hover:text-[#FA2E6E] transition-colors">
            Browse all {sectionSongs.length} songs
          </button>
        </div>
      )}
    </div>
  );
};
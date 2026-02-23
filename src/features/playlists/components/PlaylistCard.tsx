import { useNavigate } from "react-router-dom";
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useState } from "react";
import { useResponsive } from "@/components/layout/hooks/useResponsive";

interface Props {
  playlist: any;
  variant?: 'default' | 'compact';
}

const PlaylistCard = ({ playlist, variant = 'default' }: Props) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { isMobile } = useResponsive();

  // Generate a gradient based on playlist name for consistent coloring
  const getGradient = (name: string) => {
    const gradients = [
      'from-[#FA2E6E] to-purple-500',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-500',
      'from-orange-400 to-pink-500',
      'from-indigo-400 to-purple-400',
      'from-yellow-400 to-orange-400',
    ];
    
    const index = name?.length % gradients.length || 0;
    return gradients[index];
  };

  // Compact variant for sidebars or lists
  if (variant === 'compact') {
    return (
      <div
        onClick={() => navigate(`/playlist/${playlist.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        {/* Playlist Cover */}
        <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
          {playlist.coverUrl ? (
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getGradient(playlist.name)} flex items-center justify-center`}>
              <LibraryMusicIcon className="text-white opacity-70" fontSize="small" />
            </div>
          )}

          {/* Hover Play Button */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <PlayCircleIcon className="text-white" sx={{ fontSize: '1.5rem' }} />
          </div>
        </div>

        {/* Playlist Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
            {playlist.name}
          </h4>
          {playlist.songCount > 0 && (
            <p className="text-[10px] sm:text-xs text-gray-400">
              {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
            </p>
          )}
        </div>

        {/* More Options Button */}
        <button 
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizIcon fontSize="small" className="text-gray-400" />
        </button>
      </div>
    );
  }

  // Default variant (grid view)
  return (
    <div
      onClick={() => navigate(`/playlist/${playlist.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer w-full max-w-[180px] xs:max-w-[200px] sm:max-w-full mx-auto"
    >
      {/* Playlist Cover */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(playlist.name)} flex items-center justify-center`}>
            <LibraryMusicIcon 
              className="text-white opacity-50" 
              sx={{ fontSize: { xs: 36, sm: 48, md: 56 } }}
            />
          </div>
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Play Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Handle play playlist
              console.log('Play playlist:', playlist.id);
            }}
            className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center justify-center transition-all duration-200"
          >
            <PlayCircleIcon 
              className="text-white group-hover:text-[#FA2E6E] transition-colors duration-200" 
              sx={{ fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem' } }}
            />
          </button>

          {/* More Options */}
          <button 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <MoreHorizIcon className="text-white" sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }} />
          </button>
        </div>

        {/* Song Count Badge */}
        {playlist.songCount > 0 && (
          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
          </div>
        )}
      </div>

      {/* Playlist Info */}
      <div className="p-2 sm:p-3">
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm truncate group-hover:text-[#FA2E6E] transition-colors">
          {playlist.name}
        </h3>
        
        {/* Optional metadata */}
        {(playlist.owner || playlist.description) && (
          <p className="text-[10px] sm:text-xs text-gray-400 truncate mt-0.5">
            {playlist.owner || playlist.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlaylistCard;
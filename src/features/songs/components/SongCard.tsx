import { ISong } from "../types";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useLike } from "@/features/likes/hooks/useLike";
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useRef, useState } from "react";
import { addSongToPlaylist } from "@/features/playlists/services/playlistService";
import { usePlaylists } from "@/features/playlists/hooks/usePlaylists";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useResponsive } from "@/components/layout/hooks/useResponsive";

interface Props {
    track: ISong;
    songs: ISong[];
    variant?: 'default' | 'compact' | 'playlist';
    index?: number;
    disableLike?: boolean;
}

const SongCard = ({ track, songs, variant = 'default', index, disableLike = false }: Props) => {
    const { playTrack } = usePlayer();
    const { isLiked, toggleLike } = useLike(track.id);
    const [isHovered, setIsHovered] = useState(false);
    const [isPlayHovered, setIsPlayHovered] = useState(false);
    const { playlists } = usePlaylists();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<'main' | 'playlists'>('main');
    const menuRef = useRef<HTMLDivElement>(null);
    const { isMobile } = useResponsive();

    const handlePlay = () => {
        playTrack(track, songs);
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        try {
            await addSongToPlaylist(playlistId, track);
            setIsMenuOpen(false);
            setActiveMenu('main');
        } catch (error) {
            console.error("Failed to add song to playlist:", error);
        }
    };

    // Default Variant (Grid View) - Apple Music Style - Responsive
    if (variant === 'default') {
        return (
            <div
                className="group relative bg-white rounded-lg overflow-visible transition-all duration-300 w-full max-w-[180px] xs:max-w-[200px] sm:max-w-full mx-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Album Art Container */}
                <div className="relative aspect-square">
                    <img
                        src={track.coverUrl || '/default-album.jpg'}
                        alt={track.title}
                        className="w-full h-full object-cover rounded-lg"
                    />

                    {/* Hover Overlay - Responsive button sizes */}
                    <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 rounded-lg ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        {/* Play Button - Responsive */}
                        <button
                            onClick={handlePlay}
                            onMouseEnter={() => setIsPlayHovered(true)}
                            onMouseLeave={() => setIsPlayHovered(false)}
                            className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center justify-center transition-all duration-200"
                        >
                            {isPlayHovered ? (
                                <PlayCircleRoundedIcon
                                    className="text-[#FA2E6E] transition-colors duration-200"
                                    sx={{ fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem' } }}
                                />
                            ) : (
                                <PlayCircleRoundedIcon
                                    className="text-white transition-colors duration-200"
                                    sx={{ fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem' } }}
                                />
                            )}
                        </button>

                        {/* Like Button - Responsive */}
                        {!disableLike && (
                            <button
                                onClick={toggleLike}
                                className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                {isLiked ? (
                                    <FavoriteIcon className="text-red-500" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }} />
                                ) : (
                                    <FavoriteBorderIcon className="text-gray-900" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }} />
                                )}
                            </button>
                        )}

                        {/* Three Dots Button - Responsive */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                                setActiveMenu('main');
                            }}
                            className="absolute top-2 sm:top-3 right-2 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/90 backdrop-blur-sm rounded-full 
                                     flex items-center justify-center hover:scale-105 active:scale-95 
                                     transition-all duration-200 shadow-sm hover:shadow-md z-10"
                        >
                            <MoreHorizIcon
                                fontSize="small"
                                className={`text-gray-700 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}
                                sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
                            />
                        </button>
                    </div>
                </div>

                {/* Song Info - Responsive text */}
                <div className="pt-2 pb-1">
                    <h3 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{track.title}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{track.artist}</p>
                </div>

                {/* Apple-style Menu Modal - Responsive */}
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-50"
                            onClick={() => {
                                setIsMenuOpen(false);
                                setActiveMenu('main');
                            }}
                        />

                        {/* Menu Card - Responsive */}
                        <div
                            ref={menuRef}
                            className="fixed z-50 w-[90vw] sm:w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 
                                      overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                maxHeight: '80vh'
                            }}
                        >
                            {/* Header - Responsive */}
                            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                                    {activeMenu === 'main' ? 'Song Options' : 'Add to Playlist'}
                                </h3>
                            </div>

                            {/* Content */}
                            <div className="max-h-96 overflow-y-auto">
                                {activeMenu === 'main' ? (
                                    /* Main Menu */
                                    <div className="py-1">
                                        <button
                                            onClick={() => setActiveMenu('playlists')}
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 
                                                     flex items-center justify-between transition-colors"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <PlaylistAddIcon className="text-gray-500" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                                <span className="font-medium">Add to Playlist</span>
                                            </div>
                                            <ChevronRightIcon className="text-gray-400" sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                        </button>

                                        {!disableLike && (
                                            <button
                                                onClick={() => {
                                                    toggleLike();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 
                                                         flex items-center gap-2 sm:gap-3 transition-colors"
                                            >
                                                {isLiked ? (
                                                    <>
                                                        <FavoriteIcon className="text-red-500" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                                        <span className="font-medium">Remove from Likes</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FavoriteBorderIcon className="text-gray-500" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                                        <span className="font-medium">Add to Likes</span>
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 
                                                     flex items-center gap-2 sm:gap-3 transition-colors"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                            </svg>
                                            <span className="font-medium">Share</span>
                                        </button>
                                    </div>
                                ) : (
                                    /* Playlists Menu */
                                    <div className="py-1">
                                        {/* Back button */}
                                        <button
                                            onClick={() => setActiveMenu('main')}
                                            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#FA2E6E] hover:bg-gray-50 
                                                     flex items-center gap-2 transition-colors border-b border-gray-100"
                                        >
                                            <ChevronRightIcon className="rotate-180" sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                            <span className="font-medium">Back</span>
                                        </button>

                                        {/* Playlist list */}
                                        {playlists.length === 0 ? (
                                            <div className="px-3 sm:px-4 py-6 sm:py-8 text-center">
                                                <LibraryMusicIcon className="text-gray-300 mb-2" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                                <p className="text-xs text-gray-400">No playlists yet</p>
                                            </div>
                                        ) : (
                                            playlists.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleAddToPlaylist(p.id)}
                                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 
                                                             flex items-center gap-2 sm:gap-3 transition-colors"
                                                >
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-to-br from-[#FA2E6E]/10 to-purple-500/10 
                                                                  flex items-center justify-center flex-shrink-0">
                                                        <LibraryMusicIcon className="text-[#FA2E6E]" sx={{ fontSize: { xs: 12, sm: 14 } }} />
                                                    </div>
                                                    <span className="flex-1 text-left font-medium truncate text-xs sm:text-sm">{p.name}</span>
                                                    <span className="text-[10px] sm:text-xs text-gray-400">{p.songCount || 0}</span>
                                                </button>
                                            ))
                                        )}

                                        {/* Create new playlist */}
                                        <div className="border-t border-gray-100 mt-1">
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setActiveMenu('main');
                                                }}
                                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#FA2E6E] font-medium 
                                                         hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                            >
                                                <span className="text-lg sm:text-xl leading-none">+</span>
                                                New Playlist
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Compact Variant - Responsive
    if (variant === 'compact') {
        return (
            <div
                className="group flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Album Art - Responsive */}
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md overflow-hidden flex-shrink-0">
                    <img
                        src={track.coverUrl || '/default-album.jpg'}
                        alt={track.title}
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <button onClick={handlePlay}>
                            <PlayCircleIcon className="text-white" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} />
                        </button>
                    </div>
                </div>

                {/* Song Info - Responsive */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{track.title}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{track.artist}</p>
                </div>

                {/* Like Button - Responsive */}
                {!disableLike && (
                    <button
                        onClick={toggleLike}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                        {isLiked ? (
                            <FavoriteIcon className="text-red-500" sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }} />
                        ) : (
                            <FavoriteBorderIcon className="text-gray-400" sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }} />
                        )}
                    </button>
                )}
            </div>
        );
    }

    // Playlist Variant - Responsive
    if (variant === 'playlist') {
        return (
            <div
                className="group grid grid-cols-12 gap-1 sm:gap-2 md:gap-4 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Index/Play Button */}
                <div className="col-span-1 flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-400 group-hover:hidden">{index || '•'}</span>
                    <button onClick={handlePlay} className="hidden group-hover:block">
                        <PlayCircleIcon className="text-gray-600" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </button>
                </div>

                {/* Title & Cover */}
                <div className="col-span-5 flex items-center gap-1 sm:gap-2 md:gap-3">
                    <img 
                        src={track.coverUrl || '/default-album.jpg'} 
                        alt={track.title} 
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded object-cover flex-shrink-0" 
                    />
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{track.title}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate hidden xs:block">{track.artist}</p>
                    </div>
                </div>

                {/* Artist - Hidden on mobile */}
                <div className="col-span-3 hidden sm:flex items-center">
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{track.artist}</p>
                </div>

                {/* Album - Hidden on tablet and below */}
                <div className="col-span-2 hidden md:flex items-center">
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{track.album || '—'}</p>
                </div>

                {/* Duration & Actions */}
                <div className="col-span-1 flex items-center justify-end sm:justify-between gap-1">
                    <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">{track.duration || '3:45'}</span>
                    {!disableLike && (
                        <button 
                            onClick={toggleLike} 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {isLiked ? 
                                <FavoriteIcon className="text-red-500" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} /> : 
                                <FavoriteBorderIcon className="text-gray-400" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
                            }
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default SongCard;
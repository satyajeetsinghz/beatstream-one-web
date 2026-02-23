import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { subscribeToLikedSongs } from "@/features/likes/services/getLikedSongs";
import { ISong } from "@/features/songs/types";
import SongCard from "@/features/songs/components/SongCard";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import DownloadIcon from '@mui/icons-material/Download';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { useResponsive } from "@/components/layout/hooks/useResponsive";

const LikedSongs = () => {
    const { user } = useAuth();
    const [songs, setSongs] = useState<ISong[]>([]);
    const [loading, setLoading] = useState(true);
    const { playTrack } = usePlayer();
    const { isMobile, isTablet } = useResponsive();

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToLikedSongs(user.uid, (data) => {
            setSongs(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handlePlayAll = () => {
        if (songs.length > 0) {
            playTrack(songs[0], songs);
        }
    };

    const handleShufflePlay = () => {
        if (songs.length > 0) {
            const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
            playTrack(shuffledSongs[0], shuffledSongs);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#fea1be] border-t-[#FA2E6E] rounded-full animate-spin"></div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Loading your liked songs...</p>
                </div>
            </div>
        );
    }

    // Empty State
    if (!songs.length) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                    {/* Header with gradient background - Responsive */}
                    <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 border border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-pink-400 to-red-500 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0">
                                <FavoriteIcon className="text-white" style={{ fontSize: 'clamp(32px, 6vw, 48px)' }} />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Playlist</p>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Liked Songs</h1>
                                <p className="text-sm sm:text-base text-gray-500">Your favorite tracks, all in one place</p>
                            </div>
                        </div>
                    </div>

                    {/* Empty State Content - Responsive */}
                    <div className="text-center py-8 sm:py-12 md:py-16">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <MusicNoteIcon className="text-gray-400" style={{ fontSize: 'clamp(28px, 5vw, 40px)' }} />
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">No liked songs yet</h3>
                        <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Start adding songs you love</p>
                        <button className="bg-[#FA2E6E] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium hover:bg-[#E01E5A] transition-colors inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                            <PlayCircleIcon fontSize="small" />
                            <span>Discover Music</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Content
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                {/* Header with Playlist Info - Responsive */}
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
                    {/* Playlist Cover - Responsive */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 bg-gradient-to-br from-pink-400 to-red-500 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                        <FavoriteIcon className="text-white" style={{ fontSize: 'clamp(28px, 6vw, 64px)' }} />
                    </div>

                    {/* Playlist Details - Responsive */}
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Playlist</p>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Liked Songs</h1>

                        {/* Stats - Responsive */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                            <span className="flex items-center gap-1">
                                <PersonIcon fontSize="small" className="text-gray-400" />
                                <span className="truncate max-w-[80px] sm:max-w-none">{user?.name || 'User'}</span>
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
                        </div>

                        {/* Action Buttons - Responsive */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                            <button
                                onClick={handlePlayAll}
                                className="bg-[#FA2E6E] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium hover:bg-[#E01E5A] transition-colors flex items-center gap-1 sm:gap-2 shadow-md hover:shadow-lg"
                            >
                                <PlayCircleIcon fontSize="small" />
                                <span>Play</span>
                            </button>

                            <button
                                onClick={handleShufflePlay}
                                className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1 sm:gap-2"
                            >
                                <ShuffleIcon fontSize="small" />
                                <span>Shuffle</span>
                            </button>

                            <button className="p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                <DownloadIcon fontSize="small" />
                            </button>
                            <button className="p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                <MoreHorizIcon fontSize="small" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Songs Table Header - Hidden on mobile/tablet */}
                {!isMobile && (
                    <div className="border-b border-gray-200 pb-3 mb-4">
                        <div className={`grid ${isTablet ? 'grid-cols-8' : 'grid-cols-12'} gap-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider`}>
                            <div className={`${isTablet ? 'col-span-1' : 'col-span-1'}`}>#</div>
                            <div className={`${isTablet ? 'col-span-4' : 'col-span-5'}`}>Title</div>
                            <div className={`${isTablet ? 'col-span-2' : 'col-span-3'}`}>Artist</div>
                            {!isTablet && <div className="col-span-2">Album</div>}
                            <div className={`${isTablet ? 'col-span-1' : 'col-span-1'}`}>
                                <AccessTimeIcon fontSize="small" className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Songs List */}
                <div className="space-y-1">
                    {songs.map((song, index) => (
                        <SongCard
                            key={song.id}
                            track={song}
                            songs={songs}
                            variant="playlist"
                            index={index + 1}
                        />
                    ))}
                </div>

                {/* Footer Stats - Responsive */}
                <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400 border-t border-gray-200 pt-4">
                    <p className="text-center sm:text-left">
                        {songs.length} songs • Updated just now
                    </p>
                </div>

                {/* Mobile Quick Actions */}
                {isMobile && (
                    <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-40">
                        <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full border border-gray-200 px-4 py-2 flex items-center gap-4">
                            <button onClick={handlePlayAll} className="flex items-center gap-2 text-sm text-gray-700">
                                <PlayCircleIcon fontSize="small" className="text-[#FA2E6E]" />
                                <span>Play</span>
                            </button>
                            <div className="w-px h-4 bg-gray-200"></div>
                            <button onClick={handleShufflePlay} className="flex items-center gap-2 text-sm text-gray-700">
                                <ShuffleIcon fontSize="small" className="text-gray-500" />
                                <span>Shuffle</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LikedSongs;
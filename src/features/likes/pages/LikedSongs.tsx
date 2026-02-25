import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { subscribeToLikedSongs } from "@/features/likes/services/getLikedSongs";
import { ISong } from "@/features/songs/types";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShuffleIcon from '@mui/icons-material/Shuffle';
// import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ExplicitIcon from '@mui/icons-material/Explicit';
import { ChevronLeftRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
// import { useResponsive } from "@/components/layout/hooks/useResponsive";

const LikedSongs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [songs, setSongs] = useState<ISong[]>([]);
    const [loading, setLoading] = useState(true);
    const { playTrack } = usePlayer();
    // const { isMobile } = useResponsive();

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

    const formatDuration = (duration?: string | number) => {
        if (!duration) return "0:00";
        if (typeof duration === 'string' && duration.includes(':')) {
            return duration;
        }
        const seconds = typeof duration === 'string' ? parseInt(duration, 10) : duration;
        if (isNaN(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Calculate total duration
    const totalMinutes = songs.reduce((acc, song) => {
        const duration = song.duration;
        if (!duration) return acc;
        if (typeof duration === 'string' && duration.includes(':')) {
            const [minutes, seconds] = duration.split(':').map(Number);
            return acc + (minutes * 60 + (seconds || 0));
        }
        const seconds = typeof duration === 'string' ? parseInt(duration, 10) : duration;
        return acc + (isNaN(seconds) ? 0 : seconds);
    }, 0);

    const totalMinutesFormatted = Math.floor(totalMinutes / 60);

    // Loading State - Light mode
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FA2E6E] rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-400">Loading your liked songs...</p>
                </div>
            </div>
        );
    }

    // Empty State - Light mode
    if (!songs.length) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="max-w-md mx-auto px-6 py-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FA2E6E] to-purple-400 rounded-full flex items-center justify-center shadow-md">
                        <FavoriteIcon className="text-white" sx={{ fontSize: 36 }} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Liked Songs</h1>
                    <p className="text-sm text-gray-500 mb-8">Songs you like will appear here.</p>
                    <button className="bg-[#FA2E6E] hover:bg-[#E01E5A] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-sm">
                        <PlayArrowIcon fontSize="small" />
                        <span>Discover Music</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 px-4 sm:px-6 md:px-8 py-6 md:py-10">


            <div className="flex justify-between items-center mb-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-[#FA2E6E] transition-colors group"
                >
                    <div className="">
                        <ChevronLeftRounded fontSize="large" className="text-[#FA2E6E] group-hover:text-[#FA2E6E]" />
                    </div>
                    {/* <span className="text-xs">Back</span> */}
                </button>
            </div>

            {/* Top Section - Responsive */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                {/* Album Cover - Centered on mobile */}
                <div className="relative w-40 h-40 sm:w-56 sm:h-56 mx-auto md:mx-0 bg-gradient-to-br from-[#FA2E6E] to-purple-400 rounded-md shadow-xl overflow-hidden flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center">
                        <FavoriteIcon className="text-white" sx={{ fontSize: { xs: 60, md: 80, lg: 100 } }} />
                    </div>
                </div>

                {/* Album Info - Fixed height matching cover */}
                <div className="flex-1 flex flex-col h-40 sm:h-56 md:h-auto">
                    {/* Top section - Pushed to top */}
                    <div className="flex flex-col justify-start">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-700">Liked Songs</h1>
                            <ExplicitIcon className="text-gray-400" fontSize="small" />
                        </div>

                        <h2 className="text-[#FA2E6E] text-xl sm:text-2xl mt-0.5 font-medium text-center md:text-left">
                            {user?.name || 'Your Name'}
                        </h2>

                        <div className="text-xs font-semibold text-neutral-400 mt-2 flex flex-wrap items-center justify-center md:justify-start gap-1">
                            <span>Various Artists</span>
                            <span className="w-1 h-1 rounded-full bg-gray-400" />
                            <span>{new Date().getFullYear()}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-400" />
                            <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-400" />
                            <span>{totalMinutesFormatted} min</span>
                        </div>
                    </div>

                    {/* Spacer - Pushes buttons to bottom */}
                    <div className="flex-1"></div>

                    {/* Buttons - Fixed at bottom */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                        <button
                            onClick={handlePlayAll}
                            className="w-[35%] md:w-auto bg-[#FA2E6E] hover:bg-[#E01E5A] text-white transition px-3 py-2 md:py-1.5 rounded-full sm:rounded-md font-medium flex items-center justify-center gap-1 text-sm shadow-sm"
                        >
                            <PlayArrowIcon fontSize="small" /> <span className="text-sm">Play</span>
                        </button>

                        <button
                            onClick={handleShufflePlay}
                            className="w-[35%] md:w-auto bg-[#FA2E6E] hover:bg-[#E01E5A] text-white transition px-3 py-2 md:py-1.5 rounded-full sm:rounded-md font-medium flex items-center justify-center gap-1 text-sm shadow-sm"
                        >
                            <ShuffleIcon fontSize="small" /> <span className="text-sm">Shuffle</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Track List - With alternating row colors for light mode */}
            <div className="mt-8 md:mt-10">
                {songs.map((song, index) => {
                    // Alternate between light and lighter background for light mode
                    const rowColor = index % 2 === 0
                        ? 'bg-gray-200/60' // Slightly darker for even rows
                        : 'bg-gray-100/20'; // Pure white for odd rows

                    return (
                        <div
                            key={song.id}
                            className={`group flex items-center justify-between px-10 py-1 mb-1 rounded-md transition-all duration-200 cursor-pointer
                                ${rowColor} 
                                hover:bg-zinc-300/20`}
                            onClick={() => playTrack(song, songs)}
                        >
                            <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                                <span className="w-5 text-gray-400 text-sm">{index + 1}</span>

                                <div className="min-w-0 -space-y-0.5">
                                    <p className="font-medium text-sm text-neutral-700 max-w-36 sm:max-w-full truncate">
                                        {song.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 max-w-28 sm:max-w-80 truncate">
                                        {song.artist}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                                <span className="text-gray-400 text-xs font-semibold">
                                    {formatDuration(song.duration)}
                                </span>
                                <button
                                    className="opacity-0 group-hover:opacity-100 text-[#FA2E6E] hover:text-[#E01E5A] transition"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle more options
                                    }}
                                >
                                    <MoreHorizIcon fontSize="small" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Quick Actions - Light mode */}
            {/* {isMobile && (
                <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-40">
                    <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full border border-gray-200 px-4 py-2 flex items-center gap-4">
                        <button onClick={handlePlayAll} className="flex items-center gap-2 text-sm text-gray-700">
                            <PlayArrowIcon fontSize="small" className="text-[#FA2E6E]" />
                            <span>Play</span>
                        </button>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <button onClick={handleShufflePlay} className="flex items-center gap-2 text-sm text-gray-700">
                            <ShuffleIcon fontSize="small" className="text-gray-400" />
                            <span>Shuffle</span>
                        </button>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default LikedSongs;
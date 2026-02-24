import { usePlayer } from "../hooks/usePlayer";
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import FastRewindRoundedIcon from '@mui/icons-material/FastRewindRounded';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
// import QueueMusicIcon from '@mui/icons-material/QueueMusic';
// import DevicesIcon from '@mui/icons-material/Devices';
import { useState, useEffect, useRef } from "react";
import { useResponsive } from "@/components/layout/hooks/useResponsive";

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const PlayerBar = () => {
    const {
        currentTrack,
        isPlaying,
        togglePlay,
        currentTime,
        duration,
        seek,
        playNext,
        playPrevious,
        volume: playerVolume,
        setVolume: setPlayerVolume,
        toggleMute: playerToggleMute
    } = usePlayer();

    const { isMobile, isTablet } = useResponsive();

    // Local state for UI
    const [localVolume, setLocalVolume] = useState(playerVolume || 0.7);
    const [previousVolume, setPreviousVolume] = useState(playerVolume || 0.7);
    const [isVolumeHovered, setIsVolumeHovered] = useState(false);
    const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
    const volumeButtonRef = useRef<HTMLDivElement>(null);
    const volumeSliderRef = useRef<HTMLDivElement>(null);

    // Sync local volume with player volume
    useEffect(() => {
        if (playerVolume !== undefined) {
            setLocalVolume(playerVolume);
        }
    }, [playerVolume]);

    // Handle click outside to close volume slider on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                volumeSliderRef.current &&
                !volumeSliderRef.current.contains(event.target as Node) &&
                volumeButtonRef.current &&
                !volumeButtonRef.current.contains(event.target as Node)
            ) {
                setIsVolumeSliderVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setLocalVolume(newVolume);
        setPlayerVolume(newVolume);
    };

    const handleToggleMute = () => {
        if (localVolume > 0) {
            setPreviousVolume(localVolume);
            setLocalVolume(0);
            setPlayerVolume(0);
        } else {
            setLocalVolume(previousVolume);
            setPlayerVolume(previousVolume);
        }
        if (playerToggleMute) {
            playerToggleMute();
        }
    };

    const getVolumeIcon = () => {
        if (localVolume === 0) return <VolumeOffIcon fontSize="small" className="text-gray-400" />;
        if (localVolume < 0.3) return <VolumeMuteIcon fontSize="small" className="text-gray-400" />;
        if (localVolume < 0.7) return <VolumeDownIcon fontSize="small" className="text-gray-400" />;
        return <VolumeUpIcon fontSize="small" className="text-gray-400" />;
    };

    if (!currentTrack) return null;

    // Mobile version - seamless integration above mobile nav
    if (isMobile) {
        return (
            <div className="fixed bottom-[69px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
                {/* Main Player Bar - Apple Music style */}
                <div className="px-3 py-2 flex items-center gap-2">
                    {/* Album Art */}
                    <img
                        src={currentTrack.coverUrl || '/default-album.jpg'}
                        alt={currentTrack.title}
                        className="w-10 h-10 rounded-md shadow-sm object-cover flex-shrink-0"
                    />

                    {/* Track Info - Truncated */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-xs truncate">{currentTrack.title}</h3>
                        <p className="text-[10px] text-gray-500 truncate">{currentTrack.artist}</p>
                    </div>

                    {/* Play Controls - Apple Music layout */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={playPrevious}
                            className="text-gray-600 hover:text-[#FA2E6E] transition-colors"
                            aria-label="Previous track"
                        >
                            <FastRewindRoundedIcon sx={{ fontSize: '1.3rem' }} />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="flex items-center justify-center"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <PauseCircleRoundedIcon
                                    className="text-[#FA2E6E]"
                                    sx={{ fontSize: '2.2rem' }}
                                />
                            ) : (
                                <PlayCircleRoundedIcon
                                    className="text-[#FA2E6E]"
                                    sx={{ fontSize: '2.2rem' }}
                                />
                            )}
                        </button>

                        <button
                            onClick={playNext}
                            className="text-gray-600 hover:text-[#FA2E6E] transition-colors"
                            aria-label="Next track"
                        >
                            <FastForwardRoundedIcon sx={{ fontSize: '1.3rem' }} />
                        </button>
                    </div>

                    {/* Volume Button with Floating Slider */}
                    <div className="relative" ref={volumeButtonRef}>
                        <button
                            onClick={() => setIsVolumeSliderVisible(!isVolumeSliderVisible)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Volume control"
                        >
                            {getVolumeIcon()}
                        </button>

                        {/* Floating Volume Slider */}
                        {isVolumeSliderVisible && (
                            <div
                                ref={volumeSliderRef}
                                className="absolute bottom-full right-0 mb-2 p-3 bg-white rounded-xl shadow-xl border border-gray-200 animate-fadeIn"
                                style={{ minWidth: '200px' }}
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleToggleMute}
                                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                    >
                                        {getVolumeIcon()}
                                    </button>

                                    <div className="flex-1 relative group h-1">
                                        {/* Background track */}
                                        <div className="absolute w-full h-1 bg-gray-200 rounded-full"></div>

                                        {/* Volume fill */}
                                        <div
                                            className="absolute h-1 bg-[#FA2E6E] rounded-full"
                                            style={{ width: `${localVolume * 100}%` }}
                                        ></div>

                                        {/* Range input */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={localVolume}
                                            onChange={handleVolumeChange}
                                            className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer z-10"
                                            aria-label="Volume control"
                                        />

                                        {/* Thumb */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FA2E6E] rounded-full border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ left: `${localVolume * 100}%`, transform: 'translate(-50%, -50%)' }}
                                        ></div>
                                    </div>

                                    <span className="text-xs text-gray-400 w-8 text-right">
                                        {Math.round(localVolume * 100)}%
                                    </span>
                                </div>

                                {/* Arrow indicator */}
                                <div className="absolute -bottom-1 right-4 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar - Always visible like Apple Music */}
                <div className="px-3 pb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-8 text-right">
                            {formatTime(currentTime)}
                        </span>

                        <div className="flex-1 relative h-1">
                            {/* Background track */}
                            <div className="absolute w-full h-1 bg-gray-200 rounded-full"></div>

                            {/* Progress fill */}
                            <div
                                className="absolute h-1 bg-[#FA2E6E] rounded-full"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            ></div>

                            {/* Hidden input for seeking */}
                            <input
                                type="range"
                                min={0}
                                max={duration || 0}
                                value={currentTime}
                                onChange={(e) => seek(Number(e.target.value))}
                                className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
                                aria-label="Seek progress"
                            />
                        </div>

                        <span className="text-[10px] text-gray-400 w-8">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop/Tablet version
    return (
        <div className={`h-20 md:h-24 bg-white/95 backdrop-blur-md border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 shadow-lg ${isTablet ? 'px-3' : 'px-4 md:px-6'}`}>
            <div className="h-full flex items-center">
                {/* Now Playing Info - Left */}
                <div className="w-1/4 min-w-[140px] md:min-w-[180px] flex items-center gap-2 md:gap-3">
                    <img
                        src={currentTrack.coverUrl || '/default-album.jpg'}
                        alt={currentTrack.title}
                        className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-md shadow-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-xs md:text-sm truncate">{currentTrack.title}</h3>
                        <p className="text-[10px] md:text-xs text-gray-500 truncate">{currentTrack.artist}</p>
                    </div>

                    {/* Like button - Apple Music style */}
                    {/* <button className="hidden md:flex text-gray-400 hover:text-[#FA2E6E] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button> */}
                </div>

                {/* Player Controls - Center */}
                <div className="flex-1 max-w-2xl mx-auto flex flex-col items-center gap-1 md:gap-2">
                    {/* Control Buttons */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={playPrevious}
                            className="text-gray-600 hover:text-[#FA2E6E] transition-colors"
                            aria-label="Previous track"
                        >
                            <FastRewindRoundedIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' } }} />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="flex items-center justify-center transition-transform hover:scale-105"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <PauseCircleRoundedIcon
                                    className="text-[#FA2E6E]"
                                    sx={{ fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}
                                />
                            ) : (
                                <PlayCircleRoundedIcon
                                    className="text-[#FA2E6E]"
                                    sx={{ fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}
                                />
                            )}
                        </button>

                        <button
                            onClick={playNext}
                            className="text-gray-600 hover:text-[#FA2E6E] transition-colors"
                            aria-label="Next track"
                        >
                            <FastForwardRoundedIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' } }} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-2">
                        <span className="text-[10px] md:text-xs text-gray-400 w-8 md:w-10 text-right">
                            {formatTime(currentTime)}
                        </span>

                        <div className="flex-1 relative group h-1">
                            <div className="absolute w-full h-1 bg-gray-200 rounded-full"></div>
                            <div
                                className="absolute h-1 bg-[#FA2E6E] rounded-full transition-all duration-100"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            ></div>
                            <input
                                type="range"
                                min={0}
                                max={duration || 0}
                                value={currentTime}
                                onChange={(e) => seek(Number(e.target.value))}
                                className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer z-10"
                                aria-label="Seek progress"
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-[#FA2E6E] rounded-full border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                style={{ left: `${(currentTime / (duration || 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                            ></div>
                        </div>

                        <span className="text-[10px] md:text-xs text-gray-400 w-8 md:w-10">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Right Side - Volume & Additional Controls */}
                <div className="w-1/4 min-w-[100px] md:min-w-[140px] lg:min-w-[180px] flex items-center justify-end gap-2 md:gap-3">
                    {/* Volume Control */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleToggleMute}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={localVolume === 0 ? "Unmute" : "Mute"}
                        >
                            {getVolumeIcon()}
                        </button>

                        <div
                            className="relative group items-center hidden sm:flex"
                            onMouseEnter={() => setIsVolumeHovered(true)}
                            onMouseLeave={() => setIsVolumeHovered(false)}
                        >
                            <div className="relative w-12 md:w-16 h-1">
                                <div className="absolute w-full h-1 bg-gray-200 rounded-full"></div>
                                <div
                                    className="absolute h-1 bg-[#FA2E6E] rounded-full transition-all duration-100"
                                    style={{ width: `${localVolume * 100}%` }}
                                ></div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={localVolume}
                                    onChange={handleVolumeChange}
                                    className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer z-10"
                                    aria-label="Volume control"
                                />
                                <div
                                    className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-[#FA2E6E] rounded-full border-2 border-white shadow-lg transition-all duration-200 ${isVolumeHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                                        }`}
                                    style={{ left: `${localVolume * 100}%`, transform: 'translate(-50%, -50%)' }}
                                ></div>
                            </div>

                            <span className={`ml-1 text-[10px] md:text-xs text-gray-400 transition-opacity duration-200 ${isVolumeHovered ? 'opacity-100' : 'opacity-0'
                                }`}>
                                {Math.round(localVolume * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerBar;
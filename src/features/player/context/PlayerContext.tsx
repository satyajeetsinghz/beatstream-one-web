import { createContext, useEffect, useRef, useState } from "react";
import { IPlayerContext, ITrack } from "../types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { addToHistory } from "@/features/history/services/historyService";

export const PlayerContext = createContext<IPlayerContext>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    queue: [],
    currentIndex: 0,
    volume: 1,
    isMuted: false,
    playTrack: async () => { }, // Make this async
    togglePlay: () => { },
    seek: () => { },
    playNext: () => { },
    playPrevious: () => { },
    setVolume: () => { },
    toggleMute: () => { },
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
    const audioRef = useRef<HTMLAudioElement>(new Audio());

    const [currentTrack, setCurrentTrack] = useState<ITrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [queue, setQueue] = useState<ITrack[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const lastSavedTrackId = useRef<string | null>(null);
    const { user } = useAuth();

    // 🔊 PLAY TRACK - FIXED
    const playTrack = async (track: ITrack, trackList?: ITrack[]): Promise<void> => {
        const audio = audioRef.current;
        if (!audio) return; // This returns void, but we need to return Promise<void>

        // Fix: Check if audioUrl exists
        if (!track.audioUrl) {
            console.error('Cannot play track: No audio URL provided', track);
            return;
        }

        if (trackList) {
            setQueue(trackList);
            const index = trackList.findIndex(t => t.id === track.id);
            setCurrentIndex(index);
        } else if (queue.length > 0) {
            // If no trackList but we have a queue, try to find the track
            const index = queue.findIndex(t => t.id === track.id);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        }

        // Set the source and play
        audio.src = track.audioUrl; // Now safe - we checked it exists
        setCurrentTrack(track);
        
        try {
            await audio.play();
            setIsPlaying(true);
        } catch (error) {
            console.error('Failed to play track:', error);
            setIsPlaying(false);
            throw error; // Re-throw if you want callers to handle errors
        }
    };

    // ⏭ NEXT - FIXED
    const playNext = () => {
        if (queue.length === 0) return;
        
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;

            if (nextIndex < queue.length) {
                const nextTrack = queue[nextIndex];
                // Use playTrack but don't await it
                playTrack(nextTrack).catch(error => 
                    console.error('Failed to play next track:', error)
                );
                return nextIndex;
            }

            return prevIndex;
        });
    };

    // ⏮ PREVIOUS - FIXED
    const playPrevious = () => {
        if (queue.length === 0) return;
        
        setCurrentIndex((prevIndex) => {
            const prev = prevIndex - 1;

            if (prev >= 0) {
                const prevTrack = queue[prev];
                // Use playTrack but don't await it
                playTrack(prevTrack).catch(error => 
                    console.error('Failed to play previous track:', error)
                );
                return prev;
            }

            return prevIndex;
        });
    };

    // ▶️ TOGGLE PLAY - FIXED
    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            // Only try to play if we have a current track
            if (currentTrack) {
                audio.play()
                    .then(() => setIsPlaying(true))
                    .catch(error => console.error('Failed to play:', error));
            }
        }
    };

    // ⏩ SEEK
    const seek = (time: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        // Clamp time between 0 and duration
        const safeTime = Math.max(0, Math.min(time, duration));
        audio.currentTime = safeTime;
        setCurrentTime(safeTime);
    };

    // 🔊 VOLUME
    const handleSetVolume = (newVolume: number) => {
        // Clamp volume between 0 and 1
        const safeVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(safeVolume);
    };

    // 🔇 TOGGLE MUTE
    const toggleMute = () => {
        setIsMuted((prev) => !prev);
    };

    // 🎧 AUDIO EVENT LISTENERS
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const setMeta = () => setDuration(audio.duration);
        const handleError = (e: Event) => {
            console.error('Audio error:', e);
            setIsPlaying(false);
        };

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", setMeta);
        audio.addEventListener("error", handleError);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", setMeta);
            audio.removeEventListener("error", handleError);
        };
    }, []);

    // 🔊 AUTO NEXT WHEN SONG ENDS - FIXED
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            if (currentIndex < queue.length - 1) {
                const nextTrack = queue[currentIndex + 1];
                // Use playTrack but don't await it
                playTrack(nextTrack).catch(error => 
                    console.error('Failed to play next track:', error)
                );
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [currentIndex, queue]);

    // 📝 SAVE TO HISTORY WHEN TRACK CHANGES
    useEffect(() => {
        if (!currentTrack || !user) return;
        if (!currentTrack.id) return;

        // Prevent duplicate saves
        if (lastSavedTrackId.current === currentTrack.id) return;

        // Save to history
        const saveToHistory = async () => {
            try {
                await addToHistory(user.uid, currentTrack.id);
                lastSavedTrackId.current = currentTrack.id;
            } catch (error) {
                console.error("Failed to save to history:", error);
            }
        };

        saveToHistory();
    }, [currentTrack, user]);

    // 🔊 VOLUME SYNC
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume;
        audio.muted = isMuted;
    }, [volume, isMuted]);

    return (
        <PlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                currentTime,
                duration,
                queue,
                currentIndex,
                playTrack,
                togglePlay,
                seek,
                playNext,
                playPrevious,
                volume,
                setVolume: handleSetVolume,
                isMuted,
                toggleMute,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};
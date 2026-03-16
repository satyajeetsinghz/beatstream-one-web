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
    playTrack: async () => {},
    togglePlay: () => {},
    seek: () => {},
    playNext: () => {},
    playPrevious: () => {},
    setVolume: () => {},
    toggleMute: () => {},
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
    const audioRef = useRef<HTMLAudioElement>(new Audio());

    const [currentTrack, setCurrentTrack] = useState<ITrack | null>(null);
    const [isPlaying, setIsPlaying]       = useState(false);
    const [currentTime, setCurrentTime]   = useState(0);
    const [duration, setDuration]         = useState(0);
    const [queue, setQueue]               = useState<ITrack[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [volume, setVolume]             = useState(1);
    const [isMuted, setIsMuted]           = useState(false);

    const lastSavedTrackId = useRef<string | null>(null);
    const { user } = useAuth();

    // ✅ Derive suspended state directly from the user object.
    // isSuspended is true when status === "suspended" — used to gate
    // playTrack, togglePlay, playNext, playPrevious, and addToHistory.
    const isSuspended = user?.status === "suspended";

    // 🔊 PLAY TRACK
    const playTrack = async (track: ITrack, trackList?: ITrack[]): Promise<void> => {
        // ✅ Block playback for suspended users entirely
        if (isSuspended) return;

        const audio = audioRef.current;
        if (!audio) return;

        if (!track.audioUrl) {
            console.error("Cannot play track: No audio URL provided", track);
            return;
        }

        if (trackList) {
            setQueue(trackList);
            const index = trackList.findIndex(t => t.id === track.id);
            setCurrentIndex(index);
        } else if (queue.length > 0) {
            const index = queue.findIndex(t => t.id === track.id);
            if (index !== -1) setCurrentIndex(index);
        }

        audio.src = track.audioUrl;
        setCurrentTrack(track);

        try {
            await audio.play();
            setIsPlaying(true);
        } catch (error) {
            console.error("Failed to play track:", error);
            setIsPlaying(false);
            throw error;
        }
    };

    // ⏭ NEXT
    const playNext = () => {
        // ✅ Block for suspended users
        if (isSuspended) return;
        if (queue.length === 0) return;

        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            if (nextIndex < queue.length) {
                playTrack(queue[nextIndex]).catch(error =>
                    console.error("Failed to play next track:", error)
                );
                return nextIndex;
            }
            return prevIndex;
        });
    };

    // ⏮ PREVIOUS
    const playPrevious = () => {
        // ✅ Block for suspended users
        if (isSuspended) return;
        if (queue.length === 0) return;

        setCurrentIndex((prevIndex) => {
            const prev = prevIndex - 1;
            if (prev >= 0) {
                playTrack(queue[prev]).catch(error =>
                    console.error("Failed to play previous track:", error)
                );
                return prev;
            }
            return prevIndex;
        });
    };

    // ▶️ TOGGLE PLAY
    const togglePlay = () => {
        // ✅ Block resuming playback for suspended users
        if (isSuspended) return;

        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            if (currentTrack) {
                audio.play()
                    .then(() => setIsPlaying(true))
                    .catch(error => console.error("Failed to play:", error));
            }
        }
    };

    // ⏩ SEEK
    const seek = (time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        const safeTime = Math.max(0, Math.min(time, duration));
        audio.currentTime = safeTime;
        setCurrentTime(safeTime);
    };

    // 🔊 VOLUME
    const handleSetVolume = (newVolume: number) => {
        const safeVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(safeVolume);
    };

    // 🔇 TOGGLE MUTE
    const toggleMute = () => setIsMuted(prev => !prev);

    // 🎧 AUDIO EVENT LISTENERS
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime  = () => setCurrentTime(audio.currentTime);
        const setMeta     = () => setDuration(audio.duration);
        const handleError = (e: Event) => {
            console.error("Audio error:", e);
            setIsPlaying(false);
        };

        audio.addEventListener("timeupdate",     updateTime);
        audio.addEventListener("loadedmetadata", setMeta);
        audio.addEventListener("error",          handleError);

        return () => {
            audio.removeEventListener("timeupdate",     updateTime);
            audio.removeEventListener("loadedmetadata", setMeta);
            audio.removeEventListener("error",          handleError);
        };
    }, []);

    // 🔊 AUTO NEXT WHEN SONG ENDS
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            // ✅ Don't auto-advance for suspended users
            if (isSuspended) {
                setIsPlaying(false);
                return;
            }

            if (currentIndex < queue.length - 1) {
                playTrack(queue[currentIndex + 1]).catch(error =>
                    console.error("Failed to play next track:", error)
                );
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, [currentIndex, queue, isSuspended]);

    // ✅ Stop playback immediately when user becomes suspended mid-session.
    // This handles the case where an admin suspends a user while they are
    // actively listening — the audio stops without needing a page refresh.
    useEffect(() => {
        if (!isSuspended) return;

        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        setIsPlaying(false);
    }, [isSuspended]);

    // 📝 SAVE TO HISTORY WHEN TRACK CHANGES
    useEffect(() => {
        if (!currentTrack || !user) return;
        if (!currentTrack.id) return;
        if (lastSavedTrackId.current === currentTrack.id) return;

        // ✅ Skip history write for suspended users — Firestore rules block
        // this anyway, but skipping client-side prevents a noisy console error.
        if (isSuspended) return;

        const saveToHistory = async () => {
            try {
                await addToHistory(user.uid, currentTrack.id);
                lastSavedTrackId.current = currentTrack.id;
            } catch (error) {
                console.error("Failed to save to history:", error);
            }
        };

        saveToHistory();
    }, [currentTrack, user, isSuspended]);

    // 🔊 VOLUME SYNC
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
        audio.muted  = isMuted;
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
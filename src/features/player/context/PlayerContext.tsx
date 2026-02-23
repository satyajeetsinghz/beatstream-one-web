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
    playTrack: () => { },
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

    // 🔊 PLAY TRACK
    const playTrack = async (track: ITrack, trackList?: ITrack[]) => {
        const audio = audioRef.current;
        if (!audio) return;

        if (trackList) {
            setQueue(trackList);
            const index = trackList.findIndex(t => t.id === track.id);
            setCurrentIndex(index);
        }

        audio.src = track.audioUrl;
        setCurrentTrack(track);
        await audio.play();
        setIsPlaying(true);
    };

    // ⏭ NEXT
    const playNext = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;

            if (nextIndex < queue.length) {
                const nextTrack = queue[nextIndex];
                playTrack(nextTrack);
                return nextIndex;
            }

            return prevIndex;
        });
    };

    // ⏮ PREVIOUS
    const playPrevious = () => {
        setCurrentIndex((prevIndex) => {
            const prev = prevIndex - 1;

            if (prev >= 0) {
                const prevTrack = queue[prev];
                playTrack(prevTrack);
                return prev;
            }

            return prevIndex;
        });
    };

    // ▶️ TOGGLE PLAY
    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play();
            setIsPlaying(true);
        }
    };

    // ⏩ SEEK
    const seek = (time: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = time;
        setCurrentTime(time);
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

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", setMeta);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", setMeta);
        };
    }, []);

    // 🔊 AUTO NEXT WHEN SONG ENDS
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            if (currentIndex < queue.length - 1) {
                const nextTrack = queue[currentIndex + 1];
                playTrack(nextTrack);
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
                setVolume,
                isMuted,
                toggleMute,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};
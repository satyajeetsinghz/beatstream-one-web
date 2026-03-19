import { createContext, useEffect, useRef, useState, useCallback } from "react";
import { IPlayerContext, ITrack } from "../types";
import { useAuth }      from "@/features/auth/hooks/useAuth";
import { addToHistory } from "@/features/history/services/historyService";

// ── App branding for media notification ──────────────────────────────────────
// This is what makes "BeatStream" appear in the notification/lock screen
// instead of the browser name. The album field is repurposed for the app
// name when the track has no album, which is standard practice for music
// streaming apps (Spotify, Apple Music do the same thing).
const APP_NAME   = "BeatStream";
// Absolute URL to the app icon — used as fallback artwork when the track
// has no cover image, and also displayed alongside the app name on some
// platforms (e.g. Android notification shade shows the small icon).
const APP_ICON   = `${window.location.origin}/icons/icon-192x192.png`;

// ── Cloudinary URL optimisation ───────────────────────────────────────────────
// Transforms a raw Cloudinary URL to a pre-sized, pre-compressed version.
// e.g. .../upload/v1/image.jpg → .../upload/w_512,h_512,c_fill,q_auto,f_auto/v1/image.jpg
// Without this the OS fetches the full-resolution original (often 3–5 MB)
// for the lock screen artwork, which is slow and causes the "lag" before
// artwork appears. With the transformation it fetches a ~30KB thumbnail.
const cloudinaryResize = (url: string, size: number): string => {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace(
    /\/upload\//,
    `/upload/w_${size},h_${size},c_fill,q_auto,f_auto/`,
  );
};

// ── Build MediaImage artwork array ────────────────────────────────────────────
// Provides optimised thumbnails at the exact sizes each platform requests.
// Apple Music uses the same multi-size strategy — the OS picks the closest
// size and doesn't have to downscale a 3000×3000 original.
const buildArtwork = (coverSrc: string | undefined): MediaImage[] => {
  const src = coverSrc || APP_ICON;
  const sizes = [96, 128, 192, 256, 512] as const;
  return sizes.map((s) => ({
    src:   cloudinaryResize(src, s),
    sizes: `${s}x${s}`,
    type:  "image/jpeg",
  }));
};

// ─────────────────────────────────────────────────────────────────────────────

export const PlayerContext = createContext<IPlayerContext>({
  currentTrack:  null,
  isPlaying:     false,
  currentTime:   0,
  duration:      0,
  queue:         [],
  currentIndex:  0,
  volume:        1,
  isMuted:       false,
  playTrack:     async () => {},
  togglePlay:    () => {},
  seek:          () => {},
  playNext:      () => {},
  playPrevious:  () => {},
  setVolume:     () => {},
  toggleMute:    () => {},
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const [currentTrack, setCurrentTrack] = useState<ITrack | null>(null);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [queue,        setQueue]        = useState<ITrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume,       setVolume]       = useState(1);
  const [isMuted,      setIsMuted]      = useState(false);

  const lastSavedTrackId = useRef<string | null>(null);
  // Stable refs for seek handlers — avoids re-registering on every tick
  const currentTimeRef = useRef(0);
  const durationRef    = useRef(0);

  const { user } = useAuth();
  const isSuspended = user?.status === "suspended";

  // ── Play track ────────────────────────────────────────────────────────────
  const playTrack = useCallback(async (track: ITrack, trackList?: ITrack[]): Promise<void> => {
    if (isSuspended) return;

    const audio = audioRef.current;
    if (!audio || !track.audioUrl) {
      console.error("Cannot play track: No audio URL provided", track);
      return;
    }

    if (trackList) {
      setQueue(trackList);
      setCurrentIndex(trackList.findIndex((t) => t.id === track.id));
    } else if (queue.length > 0) {
      const idx = queue.findIndex((t) => t.id === track.id);
      if (idx !== -1) setCurrentIndex(idx);
    }

    // ── Step 1: Set metadata FIRST — before touching the audio element ────
    // The browser shows the page <title> ("beatstream-one-web") in the
    // media notification whenever navigator.mediaSession.metadata is null
    // or the audio element is in EMPTY/IDLE network state.
    // Setting metadata here — before pause()/src change — means the
    // notification always shows the new track name with zero gap.
    if ("mediaSession" in navigator) {
      const cover = (track as any).coverUrl || (track as any).imageUrl;
      navigator.mediaSession.metadata = new MediaMetadata({
        title:   track.title   ?? "Unknown Title",
        artist:  track.artist  ?? "Unknown Artist",
        // album = track album when present, otherwise app name.
        // This is how "BeatStream" appears — the same technique Spotify uses.
        album:   (track as any).album || APP_NAME,
        artwork: buildArtwork(cover),
      });
      // Zero the progress bar immediately on the new track
      if ("setPositionState" in navigator.mediaSession) {
        try { navigator.mediaSession.setPositionState({ duration: 0, position: 0, playbackRate: 1 }); }
        catch { /* ignore */ }
      }
      // Set to playing intent immediately — prevents the "paused" flash
      navigator.mediaSession.playbackState = "playing";
    }

    // ── Step 2: Reset position refs before src change ────────────────────
    currentTimeRef.current = 0;
    durationRef.current    = 0;
    setCurrentTime(0);
    setDuration(0);
    setCurrentTrack(track);

    // ── Step 3: pause() then set src — NO audio.load() ───────────────────
    // audio.load() was causing the "beatstream-one-web" flash:
    //   load() resets the element to EMPTY network state → browser briefly
    //   falls back to the page title in the notification while EMPTY.
    // pause() alone is sufficient to cancel a pending play() promise.
    // Setting src directly after pause() is the correct sequence per spec.
    audio.pause();
    audio.src = track.audioUrl;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error: any) {
      // AbortError is expected when tracks are skipped quickly — the browser
      // aborts the previous play() when src changes. It is harmless and the
      // next playTrack() call will succeed. All other errors are real.
      if (error?.name === "AbortError") {
        // Silently ignore — a subsequent playTrack() is already in flight
        return;
      }
      console.error("Failed to play track:", error);
      setIsPlaying(false);
    }
  }, [isSuspended, queue]);

  // ── Next / Previous ───────────────────────────────────────────────────────
  const playNext = useCallback(() => {
    if (isSuspended || queue.length === 0) return;
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next < queue.length) {
        playTrack(queue[next]).catch((e) => { if (e?.name !== "AbortError") console.error(e); });
        return next;
      }
      return prev;
    });
  }, [isSuspended, queue, playTrack]);

  const playPrevious = useCallback(() => {
    if (isSuspended || queue.length === 0) return;
    const audio = audioRef.current;
    // Restart current track if more than 3s in (standard media player UX)
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setCurrentIndex((prev) => {
      const prevIdx = prev - 1;
      if (prevIdx >= 0) {
        playTrack(queue[prevIdx]).catch((e) => { if (e?.name !== "AbortError") console.error(e); });
        return prevIdx;
      }
      return prev;
    });
  }, [isSuspended, queue, playTrack]);

  // ── Toggle play ───────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (isSuspended) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else if (currentTrack) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  }, [isSuspended, isPlaying, currentTrack]);

  // ── Seek ──────────────────────────────────────────────────────────────────
  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const safe = Math.max(0, Math.min(time, durationRef.current));
    audio.currentTime = safe;
    setCurrentTime(safe);
    currentTimeRef.current = safe;
  }, []);

  const handleSetVolume = useCallback((v: number) => setVolume(Math.max(0, Math.min(1, v))), []);
  const toggleMute      = useCallback(() => setIsMuted((v) => !v), []);

  // ── Audio event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      currentTimeRef.current = audio.currentTime;
    };
    const onMeta = () => {
      setDuration(audio.duration);
      durationRef.current = audio.duration;
    };
    const onError = (e: Event) => { console.error("Audio error:", e); setIsPlaying(false); };

    audio.addEventListener("timeupdate",     onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("error",          onError);

    return () => {
      audio.removeEventListener("timeupdate",     onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("error",          onError);
    };
  }, []);

  // ── Auto-advance when track ends ──────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (isSuspended) { setIsPlaying(false); return; }
      if (currentIndex < queue.length - 1) {
        playTrack(queue[currentIndex + 1]).catch((e) => { if (e?.name !== "AbortError") console.error(e); });
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [currentIndex, queue, isSuspended, playTrack]);

  // ── Pause on suspension ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isSuspended) return;
    audioRef.current?.pause();
    setIsPlaying(false);
  }, [isSuspended]);

  // ── Volume / mute sync ────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted  = isMuted;
  }, [volume, isMuted]);

  // ── History ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentTrack?.id || !user || isSuspended) return;
    if (lastSavedTrackId.current === currentTrack.id) return;
    addToHistory(user.uid, currentTrack.id)
      .then(() => { lastSavedTrackId.current = currentTrack.id; })
      .catch(console.error);
  }, [currentTrack, user, isSuspended]);

  // ── Media Session — playbackState sync ───────────────────────────────────
  // Kept separate from metadata so isPlaying changes don't re-set artwork.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // ── Media Session — action handlers ──────────────────────────────────────
  // ── FIX 2: Use refs for seek values instead of state in deps ─────────────
  // The old version had [currentTime, duration] in the dep array.
  // currentTime updates every ~250ms (timeupdate), so the effect was
  // re-running ~4 times/second — tearing down and re-registering all 8
  // handlers on every tick. This caused the ~250ms dead zone where
  // pressing next/prev/seek on the lock screen felt unresponsive.
  //
  // Fix: seekbackward/seekforward read from refs instead of captured state.
  // The dep array now only contains stable callbacks and isSuspended —
  // handlers are registered exactly once and stay registered.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const ms = navigator.mediaSession;

    ms.setActionHandler("play", () => {
      if (!isSuspended) {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    });

    ms.setActionHandler("pause", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });

    ms.setActionHandler("stop", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });

    ms.setActionHandler("nexttrack",     playNext);
    ms.setActionHandler("previoustrack", playPrevious);

    // ✅ Use refs — no stale closure, no re-registration every tick
    ms.setActionHandler("seekbackward", (d) => {
      const t = Math.max(0, currentTimeRef.current - (d.seekOffset ?? 10));
      if (audioRef.current) audioRef.current.currentTime = t;
      setCurrentTime(t);
      currentTimeRef.current = t;
    });

    ms.setActionHandler("seekforward", (d) => {
      const t = Math.min(durationRef.current, currentTimeRef.current + (d.seekOffset ?? 10));
      if (audioRef.current) audioRef.current.currentTime = t;
      setCurrentTime(t);
      currentTimeRef.current = t;
    });

    ms.setActionHandler("seekto", (d) => {
      if (d.seekTime == null) return;
      const t = Math.max(0, Math.min(d.seekTime, durationRef.current));
      if (audioRef.current) audioRef.current.currentTime = t;
      setCurrentTime(t);
      currentTimeRef.current = t;
    });

    return () => {
      (["play","pause","stop","nexttrack","previoustrack",
        "seekbackward","seekforward","seekto"] as MediaSessionAction[])
        .forEach((a) => { try { ms.setActionHandler(a, null); } catch {} });
    };
    // ✅ No currentTime/duration in deps — handled by refs above
  }, [playNext, playPrevious, isSuspended]);

  // ── Media Session — position state ───────────────────────────────────────
  // ── FIX 4: Throttle to every 500ms instead of every timeupdate (~250ms) ─
  // Calling setPositionState on every timeupdate is redundant — the OS
  // interpolates position between calls. Halving the call frequency reduces
  // main thread work during playback without any visible degradation.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (!("setPositionState" in navigator.mediaSession)) return;
    if (!duration || isNaN(duration) || duration <= 0) return;

    const interval = setInterval(() => {
      try {
        navigator.mediaSession.setPositionState({
          duration:     durationRef.current,
          playbackRate: audioRef.current?.playbackRate ?? 1,
          position:     Math.min(currentTimeRef.current, durationRef.current),
        });
      } catch { /* ignore — some browsers throw when paused */ }
    }, 500);

    return () => clearInterval(interval);
  }, [duration]); // only re-create when a new track loads (duration changes)

  // ─────────────────────────────────────────────────────────────────────────

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
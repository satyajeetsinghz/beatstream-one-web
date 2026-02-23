import { useEffect, useState, useMemo } from "react";
import { subscribeToHistory } from "../services/historyService";
import { useSongs } from "@/features/songs/hooks/useSongs";
import { ISong } from "@/features/songs/types";

interface UseHistoryReturn {
  historyTracks: ISong[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export const useHistory = (uid: string): UseHistoryReturn => {
  const { songs, loading: songsLoading } = useSongs();

  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    // Handle missing uid - but don't call setState directly in effect body
    if (!uid) {
      // Use a microtask to avoid synchronous setState
      const timer = setTimeout(() => {
        setHistoryIds([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    // Set initial loading state via microtask
    const loadingTimer = setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);

    let unsubscribe: (() => void) | undefined;

    // Subscribe to history
    const setupSubscription = () => {
      try {
        unsubscribe = subscribeToHistory(uid, (ids) => {
          // This callback is fine - it's responding to external changes
          setHistoryIds(ids);
          setLoading(false);
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch history'));
        setLoading(false);
      }
    };

    // Run subscription setup after loading state is set
    const subscriptionTimer = setTimeout(setupSubscription, 0);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(subscriptionTimer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [uid, refreshKey]);

  // 🔥 Correct derived join
  const historyTracks = useMemo(() => {
    if (!historyIds.length || !songs.length) return [];

    return historyIds
      .map((id) => songs.find((song) => song.id === id))
      .filter((song): song is ISong => Boolean(song));
  }, [historyIds, songs]);

  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return {
    historyTracks,
    loading: loading || songsLoading,
    error,
    refresh,
  };
};
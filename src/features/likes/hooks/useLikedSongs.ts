// features/likes/hooks/useLikedSongs.ts
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { subscribeToLikedSongs } from "@/features/likes/services/getLikedSongs";

export const useLikedSongs = () => {
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLikedSongs([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToLikedSongs(user.uid, (songs) => {
      setLikedSongs(songs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { likedSongs, loading };
};
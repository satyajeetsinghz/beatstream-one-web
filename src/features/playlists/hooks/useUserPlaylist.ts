import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Playlist } from "../services/playlistService";

interface UseUserPlaylistsReturn {
  playlists: Playlist[];
  loading: boolean;
  error: string | null;
}

export const useUserPlaylists = (): UseUserPlaylistsReturn => {
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPlaylists([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "playlists"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Playlist[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Playlist, "id">),
        }));

        setPlaylists(data);
        setLoading(false);
      },
      (err) => {
        console.error("Playlist listener error:", err);
        setError("Failed to load playlists");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]); // 🔥 important improvement

  return { playlists, loading, error };
};

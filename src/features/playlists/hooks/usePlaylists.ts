import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createPlaylist,
  getUserPlaylists,
} from "../services/playlistService";

export const usePlaylists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.uid) return;
      const data = await getUserPlaylists(user.uid);
      setPlaylists(data);
      setLoading(false);
    };

    fetch();
  }, [user?.uid]);

  const handleCreate = async (name: string) => {
    if (!user?.uid) return;
    await createPlaylist(user.uid, name);
    const updated = await getUserPlaylists(user.uid);
    setPlaylists(updated);
  };

  return { playlists, loading, handleCreate };
};

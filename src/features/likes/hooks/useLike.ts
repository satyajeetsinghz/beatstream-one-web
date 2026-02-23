import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toggleLikeTransaction } from "../services/likeService";

export const useLike = (songId: string) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const likeRef = doc(db, "users", user.uid, "likedSongs", songId);

    const unsubscribe = onSnapshot(likeRef, (docSnap) => {
      setIsLiked(docSnap.exists());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, songId]);

  const toggleLike = async () => {
    if (!user) return;
    await toggleLikeTransaction(user.uid, songId);
  };

  return { isLiked, toggleLike, loading };
};

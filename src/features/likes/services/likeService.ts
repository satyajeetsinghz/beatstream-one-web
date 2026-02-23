import {
  doc,
  runTransaction,
  increment,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";

export const toggleLikeTransaction = async (
  userId: string,
  songId: string
) => {
  const userLikeRef = doc(db, "users", userId, "likedSongs", songId);
  const songRef = doc(db, "songs", songId);

  await runTransaction(db, async (transaction) => {
    const likeDoc = await transaction.get(userLikeRef);

    if (likeDoc.exists()) {
      // Unlike
      transaction.delete(userLikeRef);
      transaction.update(songRef, {
        likeCount: increment(-1),
      });
    } else {
      // Like
      transaction.set(userLikeRef, {
        createdAt: new Date(),
      });
      transaction.update(songRef, {
        likeCount: increment(1),
      });
    }
  });
};

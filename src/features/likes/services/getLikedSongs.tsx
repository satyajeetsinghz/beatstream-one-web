import {
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { ISong } from "@/features/songs/types";

export const subscribeToLikedSongs = (
  userId: string,
  callback: (songs: ISong[]) => void
) => {
  const likedRef = collection(db, "users", userId, "likedSongs");

  return onSnapshot(likedRef, async (snapshot) => {
    const songs: ISong[] = [];

    for (const docSnap of snapshot.docs) {
      const songId = docSnap.id;

      const songDoc = await getDoc(doc(db, "songs", songId));

      if (songDoc.exists()) {
        songs.push({
          id: songDoc.id,
          ...(songDoc.data() as Omit<ISong, "id">),
        });
      }
    }

    callback(songs);
  });
};

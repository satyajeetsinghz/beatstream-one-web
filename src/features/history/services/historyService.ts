import {
  doc,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";

export const addToHistory = async (uid: string, trackId: string) => {
  const historyRef = doc(db, "users", uid, "history", trackId);

  await setDoc(historyRef, {
    trackId,
    lastPlayedAt: serverTimestamp(),
  });
};

export const subscribeToHistory = (
  uid: string,
  callback: (trackIds: string[]) => void
) => {
  const historyCollection = collection(db, "users", uid, "history");
  const q = query(historyCollection, orderBy("lastPlayedAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const trackIds = snapshot.docs.map(
      (doc) => doc.data().trackId as string
    );

    callback(trackIds);
  });
};

export const clearHistory = async (uid: string) => {
  const historyRef = collection(db, "users", uid, "history");
  const snapshot = await getDocs(historyRef);

  const deletePromises = snapshot.docs.map((document) =>
    deleteDoc(doc(db, "users", uid, "history", document.id))
  );

  await Promise.all(deletePromises);
};
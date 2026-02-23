import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { ISong } from "../types";

export const fetchSongs = async (): Promise<ISong[]> => {
  const snapshot = await getDocs(collection(db, "songs"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ISong, "id">),
  }));
};
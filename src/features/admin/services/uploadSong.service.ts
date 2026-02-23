import { db } from "@/services/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "./cloudinary.service";

export const uploadSong = async (
  title: string,
  artist: string,
  audioFile: File,
  coverFile: File,
  sectionIds: string[]
) => {
  // Upload audio
  const audioUrl = await uploadToCloudinary(audioFile);

  // Upload cover
  const coverUrl = await uploadToCloudinary(coverFile);

  // Save to Firestore
  await addDoc(collection(db, "songs"), {
    title,
    artist,
    audioUrl,
    coverUrl,
    sectionIds,
    likeCount: 0,
    createdAt: serverTimestamp(),
  });
};

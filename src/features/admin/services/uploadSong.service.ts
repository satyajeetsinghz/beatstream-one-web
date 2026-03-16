import { db } from "@/services/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "./cloudinary.service";

export const uploadSong = async (
  title: string,
  artist: string,
  audioFile: File,
  coverFile: File,
  sectionIds: string[],
  duration: string = "",   // e.g. "3:45" — pass from UploadSongForm
  album: string = "",      // e.g. "Album Name" — pass from UploadSongForm
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
    duration,   // ✅ always written, never undefined
    album,      // ✅ always written, never undefined
    createdAt: serverTimestamp(),
  });
};
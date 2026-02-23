import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  getDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";

/* -----------------------------
   Types
------------------------------ */

export interface Playlist {
  id: string;
  name: string;
  userId: string;
  coverURL?: string;
  isPublic: boolean;
  songCount: number;
  createdAt: any;
}

export interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  image?: string;
  audioUrl?: string;
  addedAt?: any;
}

/* -----------------------------
   Create Playlist
------------------------------ */

export const createPlaylist = async (
  userId: string,
  name: string,
  coverURL: string = ""
) => {
  return await addDoc(collection(db, "playlists"), {
    name,
    userId,
    coverURL,
    isPublic: false,
    songCount: 0,
    createdAt: serverTimestamp(),
  });
};

/* -----------------------------
   Real-Time User Playlists
------------------------------ */

export const subscribeToUserPlaylists = (
  userId: string,
  callback: (playlists: Playlist[]) => void
) => {
  const q = query(
    collection(db, "playlists"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const playlists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Playlist, "id">),
    }));

    callback(playlists);
  });
};

/* -----------------------------
   Add Song To Playlist
   (Prevents duplicates + Auto Cover + Count)
------------------------------ */

export const addSongToPlaylist = async (
  playlistId: string,
  song: PlaylistSong
) => {
  const songRef = doc(
    db,
    "playlists",
    playlistId,
    "songs",
    song.id
  );

  const existing = await getDoc(songRef);
  if (existing.exists()) return;

  const batch = writeBatch(db);

  batch.set(songRef, {
    ...song,
    addedAt: serverTimestamp(),
  });

  const playlistRef = doc(db, "playlists", playlistId);

  batch.update(playlistRef, {
    songCount: increment(1),
  });

  await batch.commit();

  /* Auto Cover */
  const playlistSnap = await getDoc(playlistRef);
  if (
    playlistSnap.exists() &&
    !playlistSnap.data().coverURL &&
    song.image
  ) {
    await updateDoc(playlistRef, {
      coverURL: song.image,
    });
  }
};

/* -----------------------------
   Remove Song
   (Updates count + optional cover reset)
------------------------------ */

export const removeSongFromPlaylist = async (
  playlistId: string,
  songId: string
) => {
  const songRef = doc(
    db,
    "playlists",
    playlistId,
    "songs",
    songId
  );

  const playlistRef = doc(db, "playlists", playlistId);

  const batch = writeBatch(db);

  batch.delete(songRef);
  batch.update(playlistRef, {
    songCount: increment(-1),
  });

  await batch.commit();
};

/* -----------------------------
   Subscribe To Playlist Songs
------------------------------ */

export const subscribeToPlaylistSongs = (
  playlistId: string,
  callback: (songs: PlaylistSong[]) => void
) => {
  const q = query(
    collection(db, "playlists", playlistId, "songs"),
    orderBy("addedAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const songs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PlaylistSong[];

    callback(songs);
  });
};

/* -----------------------------
   Get Single Playlist
------------------------------ */

export const getPlaylistById = async (
  id: string
): Promise<Playlist | null> => {
  const snap = await getDoc(doc(db, "playlists", id));
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Omit<Playlist, "id">),
  };
};

/* -----------------------------
   Update Playlist
------------------------------ */

export const updatePlaylist = async (
  playlistId: string,
  data: Partial<Playlist>
) => {
  await updateDoc(doc(db, "playlists", playlistId), data);
};

/* -----------------------------
   Delete Playlist
   (Batch delete songs safely)
------------------------------ */

export const deletePlaylist = async (
  playlistId: string
) => {
  const songsSnapshot = await getDocs(
    collection(db, "playlists", playlistId, "songs")
  );

  const batch = writeBatch(db);

  songsSnapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  batch.delete(doc(db, "playlists", playlistId));

  await batch.commit();
};

export const getUserPlaylists = async (
  userId: string
): Promise<Playlist[]> => {
  const q = query(
    collection(db, "playlists"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Playlist, "id">),
  }));
};

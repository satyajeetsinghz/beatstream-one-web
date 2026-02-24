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

// Import types from other features
import { ISong } from '@/features/songs/types';
import { ITrack } from '@/features/player/types';

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
  coverUrl?: string;
  audioUrl?: string;
  addedAt?: any;
  // Optional fields that might be needed for conversion
  duration?: string;
  album?: string;
}

/* -----------------------------
   Type Conversion Functions
------------------------------ */

/**
 * Convert PlaylistSong to ISong for SongCard component
 */
export const playlistSongToISong = (song: PlaylistSong): ISong => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  coverUrl: song.coverUrl || '/default-cover.jpg', // Map coverUrl to coverUrl with default
  duration: song.duration || '3:30',
  album: song.album || 'Unknown Album',
  audioUrl: song.audioUrl,
  sectionIds: [], // Default empty array for playlist songs
  likeCount: 0,   // Default like count
});

/**
 * Convert PlaylistSong to ITrack for Player component
 */
export const playlistSongToITrack = (song: PlaylistSong): ITrack => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  coverUrl: song.coverUrl || '/default-cover.jpg',
  duration: song.duration || '3:30',
  audioUrl: song.audioUrl,
});

/**
 * Convert array of PlaylistSong to array of ISong
 */
export const playlistSongsToISongs = (songs: PlaylistSong[]): ISong[] => 
  songs.map(playlistSongToISong);

/**
 * Convert array of PlaylistSong to array of ITrack
 */
export const playlistSongsToITracks = (songs: PlaylistSong[]): ITrack[] => 
  songs.map(playlistSongToITrack);

/**
 * Convert ISong to PlaylistSong for adding to playlist
 */
export const iSongToPlaylistSong = (song: ISong): PlaylistSong => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  coverUrl: song.coverUrl,
  audioUrl: song.audioUrl,
  duration: song.duration,
  album: song.album,
});

/**
 * Convert ITrack to PlaylistSong for adding to playlist
 */
export const iTrackToPlaylistSong = (track: ITrack): PlaylistSong => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  coverUrl: track.coverUrl,
  audioUrl: track.audioUrl,
  duration: track.duration,
});

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
    song.coverUrl
  ) {
    await updateDoc(playlistRef, {
      coverURL: song.coverUrl,
    });
  }
};

/**
 * Overloaded version that accepts ISong
 */
export const addSongToPlaylistFromISong = async (
  playlistId: string,
  song: ISong
) => {
  return addSongToPlaylist(playlistId, iSongToPlaylistSong(song));
};

/**
 * Overloaded version that accepts ITrack
 */
export const addSongToPlaylistFromITrack = async (
  playlistId: string,
  track: ITrack
) => {
  return addSongToPlaylist(playlistId, iTrackToPlaylistSong(track));
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

/**
 * Subscribe and get songs as ISong[]
 */
export const subscribeToPlaylistSongsAsISongs = (
  playlistId: string,
  callback: (songs: ISong[]) => void
) => {
  return subscribeToPlaylistSongs(playlistId, (playlistSongs) => {
    callback(playlistSongsToISongs(playlistSongs));
  });
};

/**
 * Subscribe and get songs as ITrack[]
 */
export const subscribeToPlaylistSongsAsITracks = (
  playlistId: string,
  callback: (tracks: ITrack[]) => void
) => {
  return subscribeToPlaylistSongs(playlistId, (playlistSongs) => {
    callback(playlistSongsToITracks(playlistSongs));
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
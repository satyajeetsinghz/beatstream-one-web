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
import { ISong }   from "@/features/songs/types";
import { ITrack }  from "@/features/player/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

export interface Playlist {
  id:           string;
  name:         string;
  userId:       string;
  coverURL?:    string;
  isPublic:     boolean;
  songCount:    number;
  createdAt:    any;
  description?: string;
}

export interface PlaylistSong {
  id:        string;
  title:     string;
  artist:    string;
  coverUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  addedAt?:  any;
  duration?: string;
  album?:    string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Type conversion helpers
───────────────────────────────────────────────────────────────────────────── */

export const playlistSongToISong = (song: PlaylistSong): ISong => ({
  id:         song.id,
  title:      song.title,
  artist:     song.artist,
  coverUrl:   song.coverUrl || "/default-cover.jpg",
  duration:   song.duration || "3:30",
  album:      song.album    || "Unknown Album",
  audioUrl:   song.audioUrl,
  sectionIds: [],
  likeCount:  0,
});

export const playlistSongToITrack = (song: PlaylistSong): ITrack => ({
  id:       song.id,
  title:    song.title,
  artist:   song.artist,
  coverUrl: song.coverUrl || "/default-cover.jpg",
  duration: song.duration || "3:30",
  audioUrl: song.audioUrl,
});

export const playlistSongsToISongs  = (songs: PlaylistSong[]): ISong[]  => songs.map(playlistSongToISong);
export const playlistSongsToITracks = (songs: PlaylistSong[]): ITrack[] => songs.map(playlistSongToITrack);

export const iSongToPlaylistSong = (song: ISong): PlaylistSong => ({
  id:       song.id,
  title:    song.title,
  artist:   song.artist,
  coverUrl: song.coverUrl ?? "",
  ...(song.audioUrl != null && { audioUrl: song.audioUrl }),
  ...(song.duration != null && { duration: song.duration }),
  ...(song.album    != null && { album:    song.album    }),
});

export const iTrackToPlaylistSong = (track: ITrack): PlaylistSong => ({
  id:       track.id,
  title:    track.title,
  artist:   track.artist,
  coverUrl: track.coverUrl ?? "",
  ...(track.audioUrl != null && { audioUrl: track.audioUrl }),
  ...(track.duration != null && { duration: track.duration }),
});

/* ─────────────────────────────────────────────────────────────────────────────
   Create Playlist
   ✅ Now accepts description and isPublic from the modal form
───────────────────────────────────────────────────────────────────────────── */

export const createPlaylist = async (
  userId:      string,
  name:        string,
  coverURL:    string  = "",
  description: string  = "",   // ✅ new param
  isPublic:    boolean = false  // ✅ new param (was always hardcoded false)
) => {
  return await addDoc(collection(db, "playlists"), {
    name,
    userId,
    coverURL,
    isPublic,
    songCount: 0,
    createdAt: serverTimestamp(),
    // Only write description when non-empty — avoids writing empty string to Firestore
    ...(description.trim() && { description: description.trim() }),
  });
};

/* ─────────────────────────────────────────────────────────────────────────────
   Real-time user playlists subscription
───────────────────────────────────────────────────────────────────────────── */

export const subscribeToUserPlaylists = (
  userId:   string,
  callback: (playlists: Playlist[]) => void
) => {
  const q = query(
    collection(db, "playlists"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Playlist, "id">),
      }))
    );
  });
};

/* ─────────────────────────────────────────────────────────────────────────────
   Add song to playlist
───────────────────────────────────────────────────────────────────────────── */

export const addSongToPlaylist = async (playlistId: string, song: PlaylistSong) => {
  const songRef = doc(db, "playlists", playlistId, "songs", song.id);
  if ((await getDoc(songRef)).exists()) return;

  const batch       = writeBatch(db);
  const playlistRef = doc(db, "playlists", playlistId);

  batch.set(songRef, { ...song, addedAt: serverTimestamp() });
  batch.update(playlistRef, { songCount: increment(1) });
  await batch.commit();

  // Auto-set cover from first song if playlist has none
  const snap = await getDoc(playlistRef);
  if (snap.exists() && !snap.data().coverURL && song.coverUrl) {
    await updateDoc(playlistRef, { coverURL: song.coverUrl });
  }
};

export const addSongToPlaylistFromISong  = (playlistId: string, song: ISong)   =>
  addSongToPlaylist(playlistId, iSongToPlaylistSong(song));

export const addSongToPlaylistFromITrack = (playlistId: string, track: ITrack) =>
  addSongToPlaylist(playlistId, iTrackToPlaylistSong(track));

/* ─────────────────────────────────────────────────────────────────────────────
   Remove song from playlist
───────────────────────────────────────────────────────────────────────────── */

export const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, "playlists", playlistId, "songs", songId));
  batch.update(doc(db, "playlists", playlistId), { songCount: increment(-1) });
  await batch.commit();
};

/* ─────────────────────────────────────────────────────────────────────────────
   Subscribe to playlist songs
───────────────────────────────────────────────────────────────────────────── */

export const subscribeToPlaylistSongs = (
  playlistId: string,
  callback:   (songs: PlaylistSong[]) => void
) => {
  const q = query(
    collection(db, "playlists", playlistId, "songs"),
    orderBy("addedAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as PlaylistSong[]);
  });
};

export const subscribeToPlaylistSongsAsISongs = (
  playlistId: string,
  callback:   (songs: ISong[]) => void
) => subscribeToPlaylistSongs(playlistId, (s) => callback(playlistSongsToISongs(s)));

export const subscribeToPlaylistSongsAsITracks = (
  playlistId: string,
  callback:   (tracks: ITrack[]) => void
) => subscribeToPlaylistSongs(playlistId, (s) => callback(playlistSongsToITracks(s)));

/* ─────────────────────────────────────────────────────────────────────────────
   Get / Update / Delete playlist
───────────────────────────────────────────────────────────────────────────── */

export const getPlaylistById = async (id: string): Promise<Playlist | null> => {
  const snap = await getDoc(doc(db, "playlists", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Playlist, "id">) };
};

export const updatePlaylist = async (playlistId: string, data: Partial<Playlist>) =>
  updateDoc(doc(db, "playlists", playlistId), data);

export const deletePlaylist = async (playlistId: string) => {
  const songsSnapshot = await getDocs(collection(db, "playlists", playlistId, "songs"));
  const batch         = writeBatch(db);
  songsSnapshot.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "playlists", playlistId));
  await batch.commit();
};

export const getUserPlaylists = async (userId: string): Promise<Playlist[]> => {
  const snapshot = await getDocs(
    query(collection(db, "playlists"), where("userId", "==", userId))
  );
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Playlist, "id">),
  }));
};
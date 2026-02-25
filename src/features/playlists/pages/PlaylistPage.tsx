import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPlaylistById,
  subscribeToPlaylistSongs,
  updatePlaylist,
  deletePlaylist,
  Playlist,
  PlaylistSong,
  // playlistSongToISong,
  // playlistSongsToISongs,
  playlistSongsToITracks,
} from "../services/playlistService";
// import SongCard from "@/features/songs/components/SongCard";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import AddIcon from '@mui/icons-material/Add';
import ExplicitIcon from '@mui/icons-material/Explicit';
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useClickOutside } from "@/features/playlists/hooks/useClickOutside";
import { ChevronLeftRounded } from "@mui/icons-material";
// import { useResponsive } from "@/components/layout/hooks/useResponsive";

const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { user } = useAuth();
  // const { isMobile } = useResponsive();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<PlaylistSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef as React.RefObject<HTMLElement>, () => setMenuOpen(false));

  /* -----------------------------
     Load Playlist + Subscribe Songs
  ------------------------------ */

  useEffect(() => {
    if (!id) return;

    const loadPlaylist = async () => {
      const data = await getPlaylistById(id);
      setPlaylist(data);
      setLoading(false);
    };

    loadPlaylist();

    const unsubscribe = subscribeToPlaylistSongs(id, (data) => {
      setSongs(data);
    });

    return () => unsubscribe();
  }, [id]);

  /* -----------------------------
     Actions
  ------------------------------ */

  const handlePlayAll = () => {
    if (songs.length > 0) {
      const tracks = playlistSongsToITracks(songs);
      playTrack(tracks[0], tracks);
    }
  };

  const handleShufflePlay = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      const tracks = playlistSongsToITracks(shuffled);
      playTrack(tracks[0], tracks);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    await deletePlaylist(id);
    navigate("/library");
  };

  const togglePublic = async () => {
    if (!id || !playlist) return;

    await updatePlaylist(id, {
      isPublic: !playlist.isPublic,
    });

    setPlaylist({
      ...playlist,
      isPublic: !playlist.isPublic,
    });
  };

  const formatDuration = (duration?: string | number) => {
    if (!duration) return "0:00";
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    const seconds = typeof duration === 'string' ? parseInt(duration, 10) : duration;
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate total duration
  const totalMinutes = songs.reduce((acc, song) => {
    const duration = song.duration;
    if (!duration) return acc;
    if (typeof duration === 'string' && duration.includes(':')) {
      const [minutes, seconds] = duration.split(':').map(Number);
      return acc + (minutes * 60 + (seconds || 0));
    }
    const seconds = typeof duration === 'string' ? parseInt(duration, 10) : duration;
    return acc + (isNaN(seconds) ? 0 : seconds);
  }, 0);

  const totalMinutesFormatted = Math.floor(totalMinutes / 60);

  /* -----------------------------
     States
  ------------------------------ */

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FA2E6E] rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) return null;

  const isOwner = user?.uid === playlist.userId;

  const createdDate =
    playlist.createdAt?.toDate?.()?.toLocaleDateString() || "";

  return (
    <div className="min-h-screen bg-white text-gray-900 px-4 sm:px-6 md:px-8 py-6 md:py-10">

      <div className="flex justify-between items-center mb-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-[#FA2E6E] transition-colors group"
        >
          <div className="">
            <ChevronLeftRounded fontSize="large" className="text-[#FA2E6E] group-hover:text-[#FA2E6E]" />
          </div>
          {/* <span className="text-xs">Back</span> */}
        </button>

        {/* Three-dot menu for mobile - positioned absolutely */}
        {isOwner && (
          <div className="z-10 md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#FA2E6E] hover:text-[#E01E5A]"
            >
              <MoreHorizIcon fontSize="medium" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-0 w-48 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-50"
              >
                <button
                  onClick={togglePublic}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  {playlist.isPublic ? (
                    <LockIcon fontSize="small" className="text-gray-400" />
                  ) : (
                    <PublicIcon fontSize="small" className="text-gray-400" />
                  )}
                  <span>{playlist.isPublic ? "Make Private" : "Make Public"}</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Playlist</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Top Section - Playlist Info */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 relative">
        {/* Playlist Cover */}
        <div className="relative w-40 h-40 sm:w-56 sm:h-56 mx-auto md:mx-0 bg-gradient-to-br from-[#FA2E6E] to-purple-400 rounded-md shadow-xl overflow-hidden flex-shrink-0">
          {playlist.coverURL ? (
            <img
              src={playlist.coverURL}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <LibraryMusicIcon className="text-white" sx={{ fontSize: { xs: 60, md: 80, lg: 100 } }} />
            </div>
          )}
        </div>

        {/* Playlist Info - Fixed height matching cover */}
        <div className="flex-1 flex flex-col h-40 sm:h-56 md:h-auto">
          {/* Top section - Pushed to top */}
          <div className="flex flex-col justify-start">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-700">{playlist.name}</h1>
              <ExplicitIcon className="text-gray-400" fontSize="small" />
            </div>

            <h2 className="text-[#FA2E6E] text-xl sm:text-2xl mt-0.5 font-medium text-center md:text-left">
              {isOwner ? 'Your Playlist' : 'Playlist'}
            </h2>

            <div className="text-xs sm:text-sm text-gray-500 mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="flex items-center gap-1">
                {playlist.isPublic ? (
                  <PublicIcon fontSize="small" className="text-gray-400" />
                ) : (
                  <LockIcon fontSize="small" className="text-gray-400" />
                )}
                <span>{playlist.isPublic ? "Public" : "Private"}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{totalMinutesFormatted} min</span>
              {createdDate && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{createdDate}</span>
                </>
              )}
            </div>

            {/* Description - hidden on mobile to save space */}
            <p className="hidden md:block text-gray-500 text-xs sm:text-sm mt-4 max-w-xl leading-relaxed text-center md:text-left">
              {/* {playlist.description || `A collection of ${songs.length} songs curated by ${user?.name || 'you'}.`} */}
              {`A collection of ${songs.length} songs curated by ${user?.name || 'you'}.`}
            </p>
          </div>

          {/* Spacer - Pushes buttons to bottom */}
          <div className="flex-1"></div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
            <button
              onClick={handlePlayAll}
              className="w-[35%] md:w-auto bg-[#FA2E6E] hover:bg-[#E01E5A] text-white transition px-3 py-2 md:py-1.5 rounded-full sm:rounded-md font-medium flex items-center justify-center gap-1 text-sm shadow-sm"
            >
              <PlayArrowIcon fontSize="small" /> <span className="text-sm">Play</span>
            </button>

            <button
              onClick={handleShufflePlay}
              className="w-[35%] md:w-auto bg-[#FA2E6E] hover:bg-[#E01E5A] text-white transition px-3 py-2 md:py-1.5 rounded-full sm:rounded-md font-medium flex items-center justify-center gap-1 text-sm shadow-sm"
            >
              <ShuffleIcon fontSize="small" /> <span className="text-sm">Shuffle</span>
            </button>

            {/* Three-dot menu for mobile - positioned absolutely */}
            {isOwner && (
              <div className="hidden md:block md:static md:ml-auto">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-[#FA2E6E] hover:text-[#E01E5A]"
                >
                  <MoreHorizIcon fontSize="medium" />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-0 w-48 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-50"
                  >
                    <button
                      onClick={togglePublic}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      {playlist.isPublic ? (
                        <LockIcon fontSize="small" className="text-gray-400" />
                      ) : (
                        <PublicIcon fontSize="small" className="text-gray-400" />
                      )}
                      <span>{playlist.isPublic ? "Make Private" : "Make Public"}</span>
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Playlist</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Track List Section */}
      <div className="mt-8 md:mt-10">
        {/* <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#FA2E6E] rounded-full"></div>
          <h2 className="text-lg font-semibold text-neutral-700">Songs</h2>
          <span className="text-xs text-gray-400 ml-1">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
        </div> */}

        {songs.length > 0 ? (
          <div>
            {songs.map((song, index) => {
              // Alternate row colors
              const rowColor = index % 2 === 0
                ? 'bg-gray-200/60' // Slightly darker for even rows
                : 'bg-gray-100/20'; // Pure white for odd rows

              return (
                <div
                  key={song.id}
                  className={`group flex items-center justify-between px-10 py-1 mb-1 rounded-md transition-all duration-200 cursor-pointer ${rowColor} hover:bg-zinc-300/20`}
                  onClick={() => {
                    const tracks = playlistSongsToITracks(songs);
                    const trackIndex = songs.findIndex(s => s.id === song.id);
                    playTrack(tracks[trackIndex], tracks);
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                    <span className="w-5 text-gray-400 text-sm">{index + 1}</span>

                    <div className="min-w-0 -space-y-0.5">
                      <p className="font-medium text-sm text-neutral-700 max-w-36 sm:max-w-full truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-28 sm:max-w-80 truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                    <span className="text-gray-400 text-xs font-semibold">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      className="opacity-0 group-hover:opacity-100 text-[#FA2E6E] hover:text-[#E01E5A] transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(true);
                      }}
                    >
                      <MoreHorizIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 bg-gray-50 rounded-md">
            <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
              <LibraryMusicIcon className="text-gray-400" sx={{ fontSize: 28 }} />
            </div>
            <h3 className="text-sm font-medium text-neutral-700 mb-1">No songs yet</h3>
            <p className="text-xs text-gray-500 mb-4">Add songs to this playlist</p>
            <button className="px-4 py-2 bg-[#FA2E6E] text-white text-xs font-medium rounded-md hover:bg-[#E01E5A] transition-colors inline-flex items-center gap-1">
              <AddIcon fontSize="small" />
              <span>Browse Music</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Quick Actions */}
      {/* {isMobile && songs.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-40">
          <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full border border-gray-200 px-4 py-2 flex items-center gap-4">
            <button onClick={handlePlayAll} className="flex items-center gap-2 text-sm text-gray-700">
              <PlayArrowIcon fontSize="small" className="text-[#FA2E6E]" />
              <span>Play</span>
            </button>
            <div className="w-px h-4 bg-gray-200"></div>
            <button onClick={handleShufflePlay} className="flex items-center gap-2 text-sm text-gray-700">
              <ShuffleIcon fontSize="small" className="text-gray-400" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PlaylistPage;
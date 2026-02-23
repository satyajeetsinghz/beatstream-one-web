import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPlaylistById,
  subscribeToPlaylistSongs,
  updatePlaylist,
  deletePlaylist,
  Playlist,
  PlaylistSong,
} from "../services/playlistService";
import SongCard from "@/features/songs/components/SongCard";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useClickOutside } from "@/features/playlists/hooks/useClickOutside";
import { useRef } from "react";
import { useResponsive } from "@/components/layout/hooks/useResponsive";

const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { user } = useAuth();
  const { isMobile, isTablet } = useResponsive();

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
      playTrack(songs[0], songs);
    }
  };

  const handleShufflePlay = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
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

  /* -----------------------------
     States
  ------------------------------ */

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#FA2E6E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs sm:text-sm text-gray-400">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) return null;

  const isOwner = user?.uid === playlist.userId;

  const createdDate =
    playlist.createdAt?.toDate?.()?.toLocaleDateString() || "";

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-24">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Back Button - Responsive */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-[#FA2E6E] transition-colors mb-4 sm:mb-6 group"
          >
            <div className="p-1 sm:p-1.5 rounded-full bg-gray-100 group-hover:bg-[#FA2E6E]/10 transition-colors">
              <ArrowBackIcon fontSize="small" className="text-gray-600 group-hover:text-[#FA2E6E]" />
            </div>
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Playlist Info - Responsive */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 md:gap-8">
            
            {/* Playlist Cover - Responsive */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
              {playlist.coverURL ? (
                <img
                  src={playlist.coverURL}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FA2E6E] to-purple-500 flex items-center justify-center">
                  <LibraryMusicIcon
                    className="text-white"
                    style={{ fontSize: 'clamp(32px, 8vw, 64px)' }}
                  />
                </div>
              )}
            </div>

            {/* Playlist Details */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Playlist</p>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
                {playlist.name}
              </h1>

              {/* Stats - Responsive */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  {playlist.isPublic ? (
                    <PublicIcon fontSize="small" className="text-gray-400" />
                  ) : (
                    <LockIcon fontSize="small" className="text-gray-400" />
                  )}
                  <span>{playlist.isPublic ? "Public" : "Private"}</span>
                </span>
                <span className="hidden xs:inline">•</span>
                <span>{playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}</span>
                {createdDate && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{createdDate}</span>
                  </>
                )}
              </div>

              {/* Action Buttons - Responsive */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                <button
                  onClick={handlePlayAll}
                  className="bg-[#FA2E6E] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium hover:bg-[#E01E5A] transition-colors flex items-center gap-1 sm:gap-2 shadow-md hover:shadow-lg"
                >
                  <PlayCircleIcon fontSize="small" />
                  <span>Play</span>
                </button>

                <button
                  onClick={handleShufflePlay}
                  className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1 sm:gap-2"
                >
                  <ShuffleIcon fontSize="small" />
                  <span>Shuffle</span>
                </button>

                {/* Owner Controls */}
                {isOwner && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="p-2 sm:p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      aria-label="More options"
                    >
                      <MoreHorizIcon fontSize="small" />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                        <button
                          onClick={togglePublic}
                          className="w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
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
                          className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
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
        </div>
      </div>

      {/* Songs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 sm:h-5 bg-[#FA2E6E] rounded-full"></div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Songs</h2>
            <span className="text-xs text-gray-400 ml-1">
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </span>
          </div>
          
          {songs.length > 0 && (
            <button className="text-xs text-gray-400 hover:text-[#FA2E6E] transition-colors">
              Sort
            </button>
          )}
        </div>

        {/* Songs Grid */}
        {songs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {songs.map((song, index) => (
              <SongCard
                key={song.id}
                track={song}
                songs={songs}
                index={index}
                variant="default"
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-xl sm:rounded-2xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
              <LibraryMusicIcon
                className="text-gray-400"
                style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}
              />
            </div>
            <p className="text-sm sm:text-base text-gray-700 font-medium mb-1">No songs yet</p>
            <p className="text-xs sm:text-sm text-gray-400">Add songs to this playlist</p>
            
            {/* Quick action for empty state */}
            <button className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-2.5 bg-[#FA2E6E] text-white text-xs sm:text-sm rounded-full hover:bg-[#E01E5A] transition-colors">
              Browse Music
            </button>
          </div>
        )}
      </div>

      {/* Mobile Quick Actions */}
      {isMobile && songs.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-40">
          <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full border border-gray-200 px-4 py-2 flex items-center gap-4">
            <button onClick={handlePlayAll} className="flex items-center gap-2 text-sm text-gray-700">
              <PlayCircleIcon fontSize="small" className="text-[#FA2E6E]" />
              <span>Play</span>
            </button>
            <div className="w-px h-4 bg-gray-200"></div>
            <button onClick={handleShufflePlay} className="flex items-center gap-2 text-sm text-gray-700">
              <ShuffleIcon fontSize="small" className="text-gray-500" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
import { Link } from "react-router-dom";
import { useUserPlaylists } from "../hooks/useUserPlaylist";
import { deletePlaylist, updatePlaylist } from "../services/playlistService";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useState, useRef, useEffect } from "react";
import { useClickOutside } from "@/features/playlists/hooks/useClickOutside";
import { useResponsive } from "@/components/layout/hooks/useResponsive";

const PlaylistList = () => {
  const { playlists, loading } = useUserPlaylists();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useResponsive();

  useClickOutside(menuRef, () => {
    setOpenMenuId(null);
  });

  // Handle click outside for edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingId && editInputRef.current && !editInputRef.current.contains(event.target as Node)) {
        setEditingId(null);
        setEditName("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingId]);

  const handleRename = async (id: string) => {
    if (editName.trim()) {
      await updatePlaylist(id, { name: editName.trim() });

      setEditingId(null);
      setEditName("");
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      setDeletingId(id);
      await deletePlaylist(id);

      setDeletingId(null);
      setOpenMenuId(null);
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-4 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse">
            <div className="w-10 h-10 rounded-md bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
          <LibraryMusicIcon className="text-gray-400" fontSize="small" />
        </div>
        <p className="text-xs text-gray-500 mb-2">No playlists yet</p>
        <p className="text-[10px] text-gray-400">Create your first playlist</p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto scroll-smooth">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="relative group"
          onMouseEnter={() => setHoveredId(playlist.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {editingId === playlist.id ? (
            /* Edit Mode */
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                {playlist.coverURL ? (
                  <img
                    src={playlist.coverURL}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FA2E6E] to-purple-500 flex items-center justify-center">
                    <LibraryMusicIcon className="text-white opacity-70" fontSize="small" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(playlist.id);
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditName("");
                    }
                  }}
                  className="w-full px-2 py-1 text-sm border border-[#FA2E6E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20"
                  placeholder="Playlist name"
                  autoFocus
                />
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              <Link
                to={`/playlist/${playlist.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {/* Playlist Cover */}
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                  {playlist.coverURL ? (
                    <img
                      src={playlist.coverURL}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FA2E6E] to-purple-500 flex items-center justify-center">
                      <LibraryMusicIcon
                        className="text-white opacity-70"
                        fontSize="small"
                      />
                    </div>
                  )}

                  {/* Hover Play Button */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${hoveredId === playlist.id ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    <PlayArrowIcon
                      className="text-white"
                      fontSize={isMobile ? "small" : "medium"}
                    />
                  </div>
                </div>

                {/* Playlist Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                    {playlist.name}
                  </h4>
                  {playlist.songCount > 0 && (
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
                    </p>
                  )}
                </div>

                {/* More Options Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === playlist.id ? null : playlist.id);
                  }}
                  className={`p-1 rounded-full transition-all duration-200 ${hoveredId === playlist.id ? "opacity-100" : "opacity-0"
                    } hover:bg-gray-200`}
                  aria-label="More options"
                >
                  <MoreHorizIcon
                    className="text-gray-400"
                    fontSize="small"
                  />
                </button>
              </Link>

              {/* Dropdown Menu */}
              {openMenuId === playlist.id && (
                <div
                  ref={menuRef}
                  className="absolute right-2 top-10 sm:top-12 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 w-36 sm:w-40 animate-fadeIn"
                >
                  <button
                    onClick={() => {
                      setEditingId(playlist.id);
                      setEditName(playlist.name);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <EditIcon fontSize="small" className="text-gray-400" />
                    <span>Rename</span>
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => handleDelete(playlist.id)}
                    disabled={deletingId === playlist.id}
                    className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 ${deletingId === playlist.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {deletingId === playlist.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <DeleteOutlineIcon fontSize="small" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Create New Playlist Link */}
      <Link
        to="/playlist/new"
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700 mt-2"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-xs sm:text-sm font-medium">New Playlist</span>
      </Link>
    </div>
  );
};

export default PlaylistList;
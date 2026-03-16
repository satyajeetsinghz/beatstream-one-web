import { Link } from "react-router-dom";
import { useUserPlaylists } from "../hooks/useUserPlaylist";
import { deletePlaylist, updatePlaylist } from "../services/playlistService";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
// import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useState, useRef, useEffect } from "react";
import { useClickOutside } from "@/features/playlists/hooks/useClickOutside";
// import { useResponsive } from "@/components/layout/hooks/useResponsive";
import { PlayCircleFilledWhiteRounded } from "@mui/icons-material";

const PlaylistList = () => {
  const { playlists, loading } = useUserPlaylists();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  // const { isMobile } = useResponsive();

  useClickOutside(menuRef as React.RefObject<HTMLElement>, () => {
    setOpenMenuId(null);
    setMenuPosition(null);
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

  // Handle escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
        setMenuPosition(null);
        setEditingId(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleRename = async (id: string) => {
    if (editName.trim()) {
      await updatePlaylist(id, { name: editName.trim() });
      setEditingId(null);
      setEditName("");
      setOpenMenuId(null);
      setMenuPosition(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      setDeletingId(id);
      await deletePlaylist(id);
      setDeletingId(null);
      setOpenMenuId(null);
      setMenuPosition(null);
    }
  };

  const handleMenuClick = (e: React.MouseEvent, playlistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const button = buttonRefs.current.get(playlistId);
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX - 140, // Adjust based on menu width
      });
    }
    
    setOpenMenuId(openMenuId === playlistId ? null : playlistId);
  };

  if (loading) {
    return (
      <div className="px-3 py-4 space-y-2">
        {/* <span>Loading...</span> */}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-md flex items-center justify-center">
          <LibraryMusicIcon className="text-gray-400" fontSize="small" />
        </div>
        <p className="text-xs text-gray-500 mb-2">No playlists yet</p>
        <p className="text-[10px] text-gray-400">Create your first playlist</p>
      </div>
    );
  }

  return (
    <div className="h-[180px] overflow-y-auto scroll-smooth rounded-md relative pr-1 py-2">
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
                  <div className="w-full h-full bg-gradient-to-br from-[#fa243c] to-purple-500 flex items-center justify-center">
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
                  className="w-full px-2 py-1 text-sm border border-[#fa243c] rounded-md focus:outline-none"
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
                <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                  {playlist.coverURL ? (
                    <img
                      src={playlist.coverURL}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#fa243c] to-purple-500 flex items-center justify-center">
                      <LibraryMusicIcon
                        className="text-white opacity-70"
                        fontSize="small"
                      />
                    </div>
                  )}

                  {/* Hover Play Button */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
                      hoveredId === playlist.id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <PlayCircleFilledWhiteRounded
                      className="text-white"
                      fontSize={"medium"}
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
                  ref={(el) => {
                    if (el) buttonRefs.current.set(playlist.id, el);
                    else buttonRefs.current.delete(playlist.id);
                  }}
                  onClick={(e) => handleMenuClick(e, playlist.id)}
                  className={`py-0.5 px-2 rounded-md transition-all duration-200 ${
                    hoveredId === playlist.id ? "opacity-100" : "opacity-0"
                  } hover:bg-gray-200`}
                  aria-label="More options"
                >
                  <MoreHorizIcon
                    className="text-gray-400"
                    fontSize="small"
                  />
                </button>
              </Link>

              {/* Dropdown Menu - Fixed to viewport */}
              {openMenuId === playlist.id && menuPosition && (
                <div
                  ref={menuRef}
                  className="fixed ml-16 p-1 z-[100] bg-white rounded-xl shadow-xl border border-gray-200 py- w-36 sm:w-40"
                  style={{
                    top: menuPosition.top,
                    left: menuPosition.left,
                  }}
                >
                  <button
                    onClick={() => {
                      setEditingId(playlist.id);
                      setEditName(playlist.name);
                      setOpenMenuId(null);
                      setMenuPosition(null);
                    }}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    {/* <EditIcon fontSize="small" className="text-gray-400" /> */}
                    <span>Rename</span>
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => handleDelete(playlist.id)}
                    disabled={deletingId === playlist.id}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm text-[#fa243c] hover:bg-red-50 transition-colors flex items-center gap-2 ${
                      deletingId === playlist.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {deletingId === playlist.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-red-200 border-t-[#fa243c] rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        {/* <DeleteOutlineIcon fontSize="small" /> */}
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
    </div>
  );
};

export default PlaylistList;
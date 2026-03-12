import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserPlaylists } from "@/features/playlists/hooks/useUserPlaylist";
import { useLikedSongs } from "@/features/likes/hooks/useLikedSongs";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import CreatePlaylistModal from "@/features/playlists/components/CreatePlaylistModal";
// import PlaylistCard from "@/features/playlists/components/PlaylistCard";

// ─── MUI Icons ────────────────────────────────────────────────────────────────
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MusicNoteRoundedIcon from "@mui/icons-material/MusicNoteRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import LinearProgress from "@mui/material/LinearProgress";

// ─── Shared: Playlist Cover ───────────────────────────────────────────────────
const PlaylistCover = ({
  coverURL,
  name,
  className = "",
}: {
  coverURL?: string;
  name: string;
  className?: string;
}) => (
  <div className={`overflow-hidden rounded-lg shadow-sm shrink-0 ${className}`}>
    {coverURL ? (
      <img src={coverURL} alt={name} className="w-full h-full object-cover" />
    ) : (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #ff375f 0%, #bf5af2 100%)" }}
      >
        <MusicNoteRoundedIcon className="text-white/80" sx={{ fontSize: "40%" }} />
      </div>
    )}
  </div>
);

// ─── Shared: Skeleton ─────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-lg animate-pulse bg-gray-200 ${className}`} />
);

// ─── Shared: Section Header ───────────────────────────────────────────────────
const SectionHeader = ({
  title,
  count,
  right,
}: {
  title: string;
  count?: number;
  right?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2">
      <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
        {title}
      </h2>
      {count !== undefined && (
        <span className="text-xs text-gray-400 font-medium ml-1">{count}</span>
      )}
    </div>
    {right}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const LibraryPage = () => {
  const { playlists, loading: playlistsLoading } = useUserPlaylists();
  const { likedSongs, loading: likedLoading } = useLikedSongs();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const likedCount = likedSongs?.length ?? 0;
  const openModal = useCallback(() => setShowCreateModal(true), []);
  const closeModal = useCallback(() => setShowCreateModal(false), []);

  const formatDate = (createdAt: any) => {
    try {
      const date = createdAt?.toDate?.() ?? new Date(createdAt);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fadeUp 0.3s ease forwards; }
                .card-hover {
                    transition: transform 0.2s ease;
                }
                .card-hover:hover {
                    transform: scale(1.02);
                }
                .row-hover {
                    transition: background-color 0.2s ease;
                }
                .row-hover:hover {
                    background-color: #f5f5f7;
                }
            `}</style>

      {/* ── Nav bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-6 sm:py-10 bg-white/80 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-[#ff375f] hover:text-[#e01e5a] transition-colors"
        >
          <ChevronLeftRoundedIcon fontSize="large" />

          <span className="text-lg font-semibold">Library</span>
        </button>

        <button
          onClick={openModal}
          className="flex items-center gap-0.5 text-[#ff375f] hover:text-[#e01e5a] transition-colors"
        >
          <AddRoundedIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <span className="text-sm font-semibold">Add Playlist</span>
        </button>
      </div>

      <div className="px-4 sm:px-6 md:px-8 lg:px-10 pb-32">

        {/* ── Hero header ── */}
        <div className="pt-8 pb-8 fade-up">
          <div className={`flex relative ${isMobile ? "flex-col items-center text-center" : "flex-row items-center"} gap-6`}>

            {/* Big cover art */}
            <div
              className="shrink-0 rounded-md overflow-hidden shadow-xl"
              style={{
                width: isMobile ? 140 : 180,
                height: isMobile ? 140 : 180,
                background: "linear-gradient(135deg, #ff375f 0%, #bf5af2 100%)",
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <LibraryMusicIcon
                  className="text-white/80"
                  sx={{ fontSize: isMobile ? 56 : 72 }}
                />
              </div>
            </div>

            {/* Text */}
            <div className={isMobile ? "" : "mb-1"}>
              {/* <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Library
              </p> */}
              <div className={isMobile ? "" : "absolute top-5"}>
                <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight mb-2">
                  Your Library
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start ml-1 gap-2 text-sm text-gray-500">
                  <span>{playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{likedCount} liked {likedCount === 1 ? "song" : "songs"}</span>
                </div>
              </div>

              {/* CTA buttons */}
              {!isMobile && (
                <div className="flex items-center gap-3 mb-1 absolute bottom-0">
                  <button
                    onClick={openModal}
                    className="bg-[#FA2E6E] hover:bg-[#E01E5A] text-white transition px-3 py-1.5 rounded-md font-medium flex items-center gap-0.5 text-sm shadow-sm"
                  >
                    <AddRoundedIcon sx={{ fontSize: 18 }} />
                    New Playlist
                  </button>
                  {/* <Link
                    to="/liked"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FavoriteRoundedIcon sx={{ fontSize: 16 }} className="text-[#ff375f]" />
                    Liked Songs
                  </Link> */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Liked Songs pinned card ── */}
        <div className="fade-up mb-8">
          <Link
            to="/liked"
            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            {/* Gradient thumb */}
            <div
              className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center shadow-sm"
              style={{
                background: "linear-gradient(135deg, #ff375f 0%, #bf5af2 100%)",
              }}
            >
              <FavoriteRoundedIcon className="text-white" sx={{ fontSize: 24 }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                Liked Songs
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
  {likedLoading ? (
    <div className="w-16">
      <LinearProgress 
        sx={{ 
          height: 3, 
          borderRadius: 1.5,
          bgcolor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'rgba(0,0,0,0.3)',
          }
        }} 
      />
    </div>
  ) : (
    `${likedCount} ${likedCount === 1 ? "song" : "songs"}`
  )}
</p>
            </div>

            <ChevronRightRoundedIcon className="text-gray-400 shrink-0" sx={{ fontSize: 18 }} />
          </Link>
        </div>

        {/* ── Playlists section ── */}
        <div className="fade-up">
          <SectionHeader
            title="Your Playlists"
            // count={playlists.length}
            right={
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    }`}
                  aria-label="Grid view"
                >
                  <GridViewRoundedIcon
                    sx={{ fontSize: 18 }}
                    className={viewMode === "grid" ? "text-gray-700" : "text-gray-400"}
                  />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    }`}
                  aria-label="List view"
                >
                  <ViewListRoundedIcon
                    sx={{ fontSize: 18 }}
                    className={viewMode === "list" ? "text-gray-700" : "text-gray-400"}
                  />
                </button>
              </div>
            }
          />

          {/* ── Loading ── */}
          {playlistsLoading && (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ animationDelay: `${i * 40}ms` }} className="fade-up">
                    <Skeleton className="aspect-square w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <Skeleton className="w-10 h-10 shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-2/3 mb-1" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Empty state ── */}
          {!playlistsLoading && playlists.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <LibraryMusicIcon className="text-gray-400" sx={{ fontSize: 36 }} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No playlists yet</h3>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Create your first playlist to start organizing your music
              </p>
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#ff375f] hover:bg-[#e01e5a] transition-colors shadow-sm"
              >
                <AddRoundedIcon sx={{ fontSize: 18 }} />
                New Playlist
              </button>
            </div>
          )}

          {/* ── Grid view ── */}
          {!playlistsLoading && playlists.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlists.map((playlist, i) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="group card-hover fade-up"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <div className="relative">
                    <PlaylistCover
                      coverURL={playlist.coverURL}
                      name={playlist.name}
                      className="aspect-square w-full mb-2 shadow-sm transition-all duration-300 group-hover:backdrop-blur-sm group-hover:brightness-75"
                    />
                    {/* Optional: Add a dark overlay for more contrast */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg pointer-events-none" />
                  </div>

                  <p className="text-sm font-medium text-gray-900 truncate">
                    {playlist.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {playlist.songCount ?? 0} {playlist.songCount === 1 ? "song" : "songs"}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* ── List view ── */}
          {!playlistsLoading && playlists.length > 0 && viewMode === "list" && (
            <div className="space-y-1">
              {playlists.map((playlist, i) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg row-hover fade-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <PlaylistCover
                    coverURL={playlist.coverURL}
                    name={playlist.name}
                    className="w-10 h-10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {playlist.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>{playlist.songCount ?? 0} {playlist.songCount === 1 ? "song" : "songs"}</span>
                      {formatDate(playlist.createdAt) && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{formatDate(playlist.createdAt)}</span>
                        </>
                      )}
                      {playlist.isPublic === false && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRightRoundedIcon className="text-gray-400 shrink-0" sx={{ fontSize: 18 }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Mobile: fixed bottom bar ── */}
        {/* {isMobile && (
                    <div className="fixed bottom-20 left-0 right-0 z-40 p-4 bg-gradient-to-t from-white via-white to-transparent">
                        <button
                            onClick={openModal}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-white bg-[#ff375f] hover:bg-[#e01e5a] transition-colors shadow-md"
                        >
                            <AddRoundedIcon sx={{ fontSize: 20 }} />
                            New Playlist
                        </button>
                    </div>
                )} */}
      </div>

      <CreatePlaylistModal open={showCreateModal} onClose={closeModal} />
    </div>
  );
};

export default LibraryPage;
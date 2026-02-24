import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserPlaylists } from "@/features/playlists/hooks/useUserPlaylist";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLikedSongs } from "@/features/likes/hooks/useLikedSongs";
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreatePlaylistModal from "@/features/playlists/components/CreatePlaylistModal";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import PlaylistCard from "@/features/playlists/components/PlaylistCard";

const LibraryPage = () => {
  const { user } = useAuth();
  const { playlists, loading: playlistsLoading } = useUserPlaylists();
  const { likedSongs, loading: likedLoading } = useLikedSongs();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isMobile } = useResponsive();

  // Calculate total liked songs count
  const likedSongsCount = likedSongs?.length || 0;

  // Only render mobile version, otherwise show desktop version
  if (!isMobile) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Your Library</h1>
        {/* Desktop library view */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {/* Liked Songs Card */}
          <Link
            to="/liked"
            className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="relative aspect-square bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
              <FavoriteIcon className="text-white" sx={{ fontSize: 48 }} />
              {likedLoading ? (
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  Loading...
                </div>
              ) : (
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {likedSongsCount} {likedSongsCount === 1 ? 'song' : 'songs'}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm truncate">Liked Songs</h3>
              <p className="text-xs text-gray-400">Your favorite tracks</p>
            </div>
          </Link>

          {/* Playlist Cards */}
          {playlistsLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Library</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FA2E6E] text-white text-sm font-medium rounded-full hover:bg-[#E01E5A] transition-colors shadow-sm"
          >
            <AddIcon fontSize="small" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Quick Access Section */}
        <section>
          <div className="space-y-2">
            {/* Liked Songs - Real Data */}
            <Link
              to="/liked"
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-sm">
                <FavoriteIcon className="text-white" fontSize="small" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Liked Songs</h3>
                <p className="text-xs text-gray-500">
                  {likedLoading ? (
                    <span className="inline-block w-16 h-3 bg-gray-200 rounded animate-pulse"></span>
                  ) : (
                    `${likedSongsCount} ${likedSongsCount === 1 ? 'song' : 'songs'}`
                  )}
                </p>
              </div>
              <ChevronRightIcon className="text-gray-400" fontSize="small" />
            </Link>
          </div>
        </section>

        {/* Playlists Section */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-semibold text-gray-500 tracking-wider">
              Your Playlists
            </h2>
            <span className="text-xs text-gray-400">{playlists.length} total</span>
          </div>

          {playlistsLoading ? (
            // Loading Skeleton
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            // Empty State
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                <LibraryMusicIcon className="text-gray-400" fontSize="large" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No playlists yet</h3>
              <p className="text-xs text-gray-500 mb-4">Create your first playlist</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FA2E6E] text-white text-xs font-medium rounded-full hover:bg-[#E01E5A] transition-colors"
              >
                <AddIcon fontSize="small" />
                <span>Create Playlist</span>
              </button>
            </div>
          ) : (
            // Playlist List - Real Data
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* Playlist Cover - Real Image or Gradient */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
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

                  {/* Playlist Info - Real Data */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{playlist.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{playlist.songCount || 0} {playlist.songCount === 1 ? 'song' : 'songs'}</span>
                      {playlist.createdAt && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>
                            {new Date(
                              playlist.createdAt?.toDate?.() || playlist.createdAt
                            ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </>
                      )}
                      {!playlist.isPublic && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRightIcon className="text-gray-400" fontSize="small" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Create Playlist Modal */}
        <CreatePlaylistModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  );
};

export default LibraryPage;
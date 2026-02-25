import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserPlaylists } from "@/features/playlists/hooks/useUserPlaylist";
import { useLikedSongs } from "@/features/likes/hooks/useLikedSongs";
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreatePlaylistModal from "@/features/playlists/components/CreatePlaylistModal";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import PlaylistCard from "@/features/playlists/components/PlaylistCard";
import ExplicitIcon from '@mui/icons-material/Explicit';
import { ChevronLeftRounded } from "@mui/icons-material";

const LibraryPage = () => {
  const { playlists, loading: playlistsLoading } = useUserPlaylists();
  const { likedSongs, loading: likedLoading } = useLikedSongs();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isMobile } = useResponsive();
  const navigate = useNavigate();


  // Calculate total liked songs count
  const likedSongsCount = likedSongs?.length || 0;

  // Calculate total playlists count
  const totalPlaylists = playlists.length;

  // Only render mobile version, otherwise show desktop version
  if (!isMobile) {
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
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-8">
          {/* Library Cover */}
          <div className="relative w-40 h-40 sm:w-56 sm:h-56 mx-auto md:mx-0 bg-gradient-to-br from-[#FA2E6E] to-purple-400 rounded-md shadow-xl overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <LibraryMusicIcon className="text-white" sx={{ fontSize: { xs: 60, md: 80, lg: 100 } }} />
            </div>
          </div>

          {/* Library Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-700">Your Library</h1>
                <ExplicitIcon className="text-gray-400" fontSize="small" />
              </div>

              <h2 className="text-[#FA2E6E] text-xl sm:text-2xl mt-0.5 font-medium text-center md:text-left">
                {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
              </h2>

              <div className="text-xs sm:text-sm text-gray-500 mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span>{playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{likedSongsCount} liked {likedSongsCount === 1 ? 'song' : 'songs'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{new Date().getFullYear()}</span>
              </div>

              <p className="text-gray-500 text-xs sm:text-sm mt-4 max-w-xl leading-relaxed text-center md:text-left">
                Your personal music collection. Create playlists, save your favorite tracks,
                and organize your music library exactly how you want it.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-6 sm:mt-7">
                {/* <Link
                  to="/liked"
                  className="bg-[#FA2E6E] hover:bg-[#E01E5A] text-white transition px-3 py-1.5 rounded-md font-medium flex items-center gap-0.5 text-sm shadow-sm"
                >
                  <FavoriteIcon fontSize="small" /> <span className="text-sm">Liked Songs</span>
                </Link> */}

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#FA2E6E] hover:bg-[#E01E5A] text-white transition px-3 py-1.5 rounded-md font-medium flex items-center gap-0.5 text-sm shadow-sm"
                >
                  <AddIcon fontSize="small" /> <span className="text-sm">New Playlist</span>
                </button>

                {/* <button className="ml-auto hidden sm:block text-[#FA2E6E] hover:text-[#E01E5A] font-medium text-sm sm:text-base">
                  <AddIcon fontSize="small" className="inline mr-1" /> Add
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Playlists Grid */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-neutral-700">Your Playlists</h2>
            <span className="text-xs text-gray-400">{totalPlaylists} total</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Liked Songs Card - Matching style */}
            <Link
              to="/liked"
              className="group relative bg-white rounded-md overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="relative aspect-square bg-gradient-to-br from-[#FA2E6E] to-purple-400 flex items-center justify-center">
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
                <h3 className="font-medium text-neutral-700 text-sm truncate">Liked Songs</h3>
                <p className="text-xs text-gray-400">Your favorite tracks</p>
              </div>
            </Link>

            {/* Playlist Cards */}
            {playlistsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-md mb-2"></div>
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

        {/* Create Playlist Modal */}
        <CreatePlaylistModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    );
  }

  // Mobile Version
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header - Sticky */}
      {/* <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-700">Library</h1>
            <ExplicitIcon className="text-gray-400" fontSize="small" />
          </div>
          
        </div>
      </div> */}


      <div className="flex justify-between items-center mt-6 mb-4 px-4">
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex justify-center items-center gap-0.5 text-[#E01E5A] text-sm font-medium"
        >
          <AddIcon fontSize="small" />
          <span className="text-xs font-semibold">Create Playlist</span>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Library Cover - Mobile */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md mt-2">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FA2E6E] to-purple-400 rounded-md flex items-center justify-center shadow-sm">
            <LibraryMusicIcon className="text-white" fontSize="medium" />
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-neutral-700">Your Library</h2>
            <p className="text-xs text-gray-500">{playlists.length} playlists • {likedSongsCount} liked songs</p>
          </div>
        </div>

        {/* Quick Access Section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">Quick Access</h2>
          <div className="space-y-2">
            {/* Liked Songs */}
            <Link
              to="/liked"
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#FA2E6E] to-purple-400 flex items-center justify-center shadow-sm">
                <FavoriteIcon className="text-white" fontSize="small" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-neutral-700">Liked Songs</h3>
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
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-semibold text-gray-500">Your Playlists</h2>
            <span className="text-xs text-gray-400">{playlists.length} total</span>
          </div>

          {playlistsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                <LibraryMusicIcon className="text-gray-400" fontSize="large" />
              </div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">No playlists yet</h3>
              <p className="text-xs text-gray-500 mb-4">Create your first playlist</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FA2E6E] text-white text-xs font-medium rounded-md hover:bg-[#E01E5A] transition-colors"
              >
                <AddIcon fontSize="small" />
                <span>Create Playlist</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                    {playlist.coverURL ? (
                      <img
                        src={playlist.coverURL}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FA2E6E] to-purple-400 flex items-center justify-center">
                        <LibraryMusicIcon className="text-white opacity-70" fontSize="small" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-700 text-sm truncate">{playlist.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{playlist.songCount || 0} {playlist.songCount === 1 ? 'song' : 'songs'}</span>
                      {playlist.createdAt && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>
                            {new Date(
                              playlist.createdAt?.toDate?.() || playlist.createdAt
                            ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </>
                      )}
                      {!playlist.isPublic && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
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
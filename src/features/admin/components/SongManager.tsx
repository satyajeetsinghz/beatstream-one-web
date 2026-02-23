import { useState } from "react";
import { useSongs } from "@/features/songs/hooks/useSongs";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { format } from "date-fns";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SearchIcon from '@mui/icons-material/Search';

const SongManager = () => {
  const { songs, loading } = useSongs();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this song?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, "songs", id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete song");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter songs based on search term
  const filteredSongs = songs.filter((song) => 
    song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#fea1be] border-t-[#FA2E6E] rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400">Loading songs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MusicNoteIcon className="text-gray-400" fontSize="small" />
            <h2 className="text-lg font-semibold text-gray-900">Song Management</h2>
            <span className="text-xs text-gray-400 ml-1">
              {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E]"
            />
          </div>
        </div>
      </div>

      {/* Songs Table */}
      <div className="overflow-x-auto">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MusicNoteIcon className="text-gray-400" style={{ fontSize: 32 }} />
            </div>
            <p className="text-sm text-gray-500 mb-1">No songs found</p>
            <p className="text-xs text-gray-400">
              {searchTerm ? 'Try a different search term' : 'Upload your first song to get started'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Cover</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Sections</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Likes</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredSongs.map((song) => (
                <tr key={song.id} className="hover:bg-gray-50 transition-colors group">
                  {/* Cover */}
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                      {song.coverUrl ? (
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <MusicNoteIcon className="text-gray-400" fontSize="small" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{song.title}</span>
                  </td>

                  {/* Artist */}
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{song.artist}</span>
                  </td>

                  {/* Sections */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full min-w-[2rem]">
                      {song.sectionIds?.length || 0}
                    </span>
                  </td>

                  {/* Likes */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600">{song.likeCount || 0}</span>
                  </td>

                  {/* Created */}
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-xs">
                      {song.createdAt?.seconds
                        ? format(
                            new Date(song.createdAt.seconds * 1000),
                            "dd MMM yyyy"
                          )
                        : "-"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                        title="Edit song"
                      >
                        <EditIcon fontSize="small" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(song.id)}
                        disabled={deletingId === song.id}
                        className={`p-1.5 rounded-full transition-all ${
                          deletingId === song.id
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                        title="Delete song"
                      >
                        {deletingId === song.id ? (
                          <div className="w-5 h-5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <DeleteOutlineIcon fontSize="small" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
        <p className="text-xs text-gray-400">
          Total: {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
          {searchTerm && filteredSongs.length !== songs.length && ` (filtered from ${songs.length} total)`}
        </p>
      </div>
    </div>
  );
};

export default SongManager;
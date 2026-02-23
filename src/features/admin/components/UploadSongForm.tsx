import { useState } from "react";
import { uploadSong } from "../services/uploadSong.service";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import { BadgeOutlined } from "@mui/icons-material";
import { useSections } from "@/features/sections/hooks/useSections";

const UploadSongForm = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { sections } = useSections();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'audio' | 'cover'
  ) => {
    const file = e.target.files?.[0] || null;

    if (type === 'audio') {
      setAudioFile(file);
      if (file) {
        setAudioPreview(file.name);
      }
    } else {
      setCoverFile(file);
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setCoverPreview(previewUrl);
      }
    }
  };

  const clearFile = (type: 'audio' | 'cover') => {
    if (type === 'audio') {
      setAudioFile(null);
      setAudioPreview(null);
    } else {
      setCoverFile(null);
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !coverFile) return;

    setLoading(true);

    try {
      await uploadSong(
        title,
        artist,
        audioFile,
        coverFile,
        selectedSections
      );

      alert("Song uploaded successfully!");
      setTitle("");
      setArtist("");
      setAudioFile(null);
      setCoverFile(null);
      setAudioPreview(null);
      setSelectedSections([]);
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Upload New Song</h2>
          <p className="text-sm text-gray-500 mt-1">Add a new track to your music library</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <BadgeOutlined fontSize="small" className="text-gray-400" />
          <span>Fill all fields to upload</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Horizontal Grid Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Song Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Song Title
              </label>
              <input
                type="text"
                placeholder="e.g. Bohemian Rhapsody"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artist
              </label>
              <input
                type="text"
                placeholder="e.g. Queen"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre (Optional)
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors text-gray-900 bg-white">
                <option value="">Select genre</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="hiphop">Hip Hop</option>
                <option value="jazz">Jazz</option>
                <option value="classical">Classical</option>
              </select>
            </div>

            {/* Section Selection - Moved to Left Column */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add to Sections
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {sections.filter((section) => section.isActive).length > 0 ? (
                  sections
                    .filter((section) => section.isActive)
                    .map((section) => {
                      const isSelected = selectedSections.includes(section.id);
                      return (
                        <button
                          type="button"
                          key={section.id}
                          onClick={() => toggleSection(section.id)}
                          className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-[#FA2E6E] text-white border-[#FA2E6E]"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          {section.title}
                        </button>
                      );
                    })
                ) : (
                  <p className="text-xs text-gray-400 col-span-2 text-center py-2">
                    No active sections available
                  </p>
                )}
              </div>

              {selectedSections.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Optional: Select sections where this song should appear
                </p>
              )}
              
              {selectedSections.length > 0 && (
                <p className="text-xs text-[#FA2E6E] mt-2">
                  {selectedSections.length} {selectedSections.length === 1 ? 'section' : 'sections'} selected
                </p>
              )}
            </div>
          </div>

          {/* Right Column - File Uploads */}
          <div className="space-y-6">
            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              {!coverPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors h-40 flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'cover')}
                    className="hidden"
                    id="cover-upload"
                    required
                  />
                  <label
                    htmlFor="cover-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <ImageIcon className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600 font-medium text-center">Click to upload cover</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF</span>
                  </label>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 h-40">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => clearFile('cover')}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <CloseIcon fontSize="small" className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Audio File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio File
              </label>
              {!audioPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors h-40 flex items-center justify-center">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, 'audio')}
                    className="hidden"
                    id="audio-upload"
                    required
                  />
                  <label
                    htmlFor="audio-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <AudioFileIcon className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600 font-medium text-center">Click to upload audio</span>
                    <span className="text-xs text-gray-400 mt-1">MP3, WAV, FLAC</span>
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 h-40">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <AudioFileIcon className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{audioPreview}</p>
                      <p className="text-xs text-gray-500">
                        {(audioFile!.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => clearFile('audio')}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <CloseIcon fontSize="small" className="text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || !audioFile || !coverFile}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <CircularProgress size={20} className="text-white" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <CloudUploadIcon fontSize="small" />
                <span>Upload Song</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadSongForm;
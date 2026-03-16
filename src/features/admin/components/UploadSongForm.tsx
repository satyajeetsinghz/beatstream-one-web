import { useState, useCallback, useRef } from "react";
import { uploadSong } from "../services/uploadSong.service";
import { useSections } from "@/features/sections/hooks/useSections";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// ── Bugs fixed ────────────────────────────────────────────────────────────────
// 1. Object URL memory leak — previous coverPreview URL never revoked when
//    user uploads multiple covers. Fixed: always revoke before replacing.
// 2. alert() used for success/error — blocks the thread, broken on mobile.
//    Fixed: inline toast with auto-dismiss.
// 3. required attr on hidden <input type="file"> never fires browser validation.
//    Fixed: manual validation in handleSubmit with inline error hints.
// 4. No drag-and-drop on upload zones. Fixed: dragover/drop handlers added.
// 5. audioFile.size accessed without null guard (TypeScript !. assertion).
//    Fixed: null guards throughout.
// 6. MUI CircularProgress imported unnecessarily. Replaced with CSS spinner.
// 7. BadgeOutlined import was unused decorative chrome — removed.
// ─────────────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";

const UploadSongForm = () => {
  const { sections } = useSections();
  const activeSections = sections.filter((s) => s.isActive);

  const [title,    setTitle]    = useState("");
  const [artist,   setArtist]   = useState("");
  const [album,    setAlbum]    = useState("");
  const [duration, setDuration] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const [audioFile,    setAudioFile]    = useState<File | null>(null);
  const [coverFile,    setCoverFile]    = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState<{ message: string; type: ToastType } | null>(null);
  const [dragOver, setDragOver] = useState<"audio" | "cover" | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Cover file — always revoke before replacing ───────────────────────────
  const setCover = useCallback((file: File | null) => {
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setCoverFile(file);
    if (!file && coverInputRef.current) coverInputRef.current.value = "";
  }, []);

  // ── Audio file ────────────────────────────────────────────────────────────
  const clearAudio = useCallback(() => {
    setAudioFile(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
  }, []);

  // ── File input change ─────────────────────────────────────────────────────
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "audio" | "cover"
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (type === "audio") setAudioFile(file);
    else setCover(file);
  };

  // ── Drag + Drop ───────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent, type: "audio" | "cover") => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    if (type === "cover" && file.type.startsWith("image/")) setCover(file);
    if (type === "audio" && file.type.startsWith("audio/")) setAudioFile(file);
  };

  // ── Section toggle ────────────────────────────────────────────────────────
  const toggleSection = (id: string) =>
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle(""); setArtist(""); setAlbum(""); setDuration("");
    clearAudio(); setCover(null);
    setSelectedSections([]);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim())  return showToast("Song title is required",  "error");
    if (!artist.trim()) return showToast("Artist name is required", "error");
    if (!audioFile)     return showToast("Audio file is required",  "error");
    if (!coverFile)     return showToast("Cover image is required", "error");

    setLoading(true);
    try {
      await uploadSong(
        title.trim(), artist.trim(),
        audioFile, coverFile,
        selectedSections,
        duration.trim(), album.trim(),
      );
      showToast("Song uploaded successfully!", "success");
      resetForm();
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) =>
    bytes > 1_048_576
      ? `${(bytes / 1_048_576).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(0)} KB`;

  const canSubmit = !!(title.trim() && artist.trim() && audioFile && coverFile && !loading);

  // ── Upload zone shared classes ────────────────────────────────────────────
  const zoneBase = "h-[152px] rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all";
  const zoneIdle = "border-[#e5e5ea] bg-[#fafafa] hover:border-[#fa243c] hover:bg-[#fff8f9]";
  const zoneDrag = "border-[#fa243c] bg-[#fff0f3]";

  return (
    <div className="w-full bg-white rounded-[18px] border border-[#e5e5ea] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">

      {/* ── Header ── */}
      <div className="px-8 pt-7 pb-5 border-b border-[#f5f5f7] flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[clamp(22px,2.5vw,28px)] font-bold text-[#1d1d1f] tracking-[-0.6px] leading-[1.1] mb-1">
            Upload New Song
          </h2>
          <p className="text-[14px] text-[#6e6e73] m-0">
            Add a new track to your music library
          </p>
        </div>
        <span className="text-[12px] text-[#aeaeb2] whitespace-nowrap pb-0.5">* Required</span>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`mx-8 mt-5 flex items-center gap-3 px-4 py-3 rounded-[12px] border text-[13px] font-medium ${
          toast.type === "success"
            ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]"
            : "bg-[#fff0f3] border-[#ffd1d9] text-[#fa243c]"
        }`}>
          {toast.type === "success" ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M7 4v3.5M7 9.5v.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="p-8 grid grid-cols-2 gap-8">

          {/* Left: text fields + sections */}
          <div className="flex flex-col gap-5">

            <div>
              <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
                Song Title *
              </label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bohemian Rhapsody"
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5ea] rounded-[10px] text-[13px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
                Artist *
              </label>
              <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Queen"
                className="w-full px-4 py-2.5 bg-white border border-[#e5e5ea] rounded-[10px] text-[13px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">Album</label>
                <input type="text" value={album} onChange={(e) => setAlbum(e.target.value)}
                  placeholder="e.g. A Night at the Opera"
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e5ea] rounded-[10px] text-[13px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">Duration</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3:45"
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e5ea] rounded-[10px] text-[13px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#aeaeb2] focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
                Sections
                {selectedSections.length > 0 && (
                  <span className="ml-2 text-[#fa243c] normal-case tracking-normal">{selectedSections.length} selected</span>
                )}
              </label>
              {activeSections.length === 0 ? (
                <p className="text-[12px] text-[#aeaeb2]">No active sections available</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {activeSections.map((section) => {
                    const sel = selectedSections.includes(section.id);
                    return (
                      <button type="button" key={section.id} onClick={() => toggleSection(section.id)}
                        className={`px-3 py-1.5 rounded-[980px] text-[12px] font-semibold border transition-all ${
                          sel
                            ? "bg-[#fa243c] text-white border-[#fa243c]"
                            : "bg-white text-[#6e6e73] border-[#e5e5ea] hover:border-[#fa243c] hover:text-[#fa243c]"
                        }`}
                      >
                        {section.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: file uploads */}
          <div className="flex flex-col gap-5">

            {/* Cover */}
            <div>
              <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
                Cover Image *
              </label>
              {!coverPreview ? (
                <div
                  onDrop={(e) => handleDrop(e, "cover")}
                  onDragOver={(e) => { e.preventDefault(); setDragOver("cover"); }}
                  onDragLeave={() => setDragOver(null)}
                  onClick={() => coverInputRef.current?.click()}
                  className={`${zoneBase} ${dragOver === "cover" ? zoneDrag : zoneIdle}`}
                >
                  <input ref={coverInputRef} type="file" accept="image/*"
                    onChange={(e) => handleFileChange(e, "cover")} className="hidden" />
                  <div className="w-10 h-10 rounded-full bg-white border border-[#e5e5ea] flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <ImageIcon sx={{ fontSize: 18 }} className="text-[#aeaeb2]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-medium text-[#1d1d1f]">Drop or click to upload</p>
                    <p className="text-[11px] text-[#aeaeb2] mt-0.5">PNG, JPG, GIF</p>
                  </div>
                </div>
              ) : (
                <div className="h-[152px] rounded-[12px] overflow-hidden border border-[#e5e5ea] relative group">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                  <button type="button" onClick={() => setCover(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-[#6e6e73] hover:text-[#fa243c] transition-colors opacity-0 group-hover:opacity-100">
                    <CloseIcon sx={{ fontSize: 13 }} />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-[4px]">
                    Cover set ✓
                  </span>
                </div>
              )}
            </div>

            {/* Audio */}
            <div>
              <label className="block text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] mb-2">
                Audio File *
              </label>
              {!audioFile ? (
                <div
                  onDrop={(e) => handleDrop(e, "audio")}
                  onDragOver={(e) => { e.preventDefault(); setDragOver("audio"); }}
                  onDragLeave={() => setDragOver(null)}
                  onClick={() => audioInputRef.current?.click()}
                  className={`${zoneBase} ${dragOver === "audio" ? zoneDrag : zoneIdle}`}
                >
                  <input ref={audioInputRef} type="file" accept="audio/*"
                    onChange={(e) => handleFileChange(e, "audio")} className="hidden" />
                  <div className="w-10 h-10 rounded-full bg-white border border-[#e5e5ea] flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <AudioFileIcon sx={{ fontSize: 18 }} className="text-[#aeaeb2]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-medium text-[#1d1d1f]">Drop or click to upload</p>
                    <p className="text-[11px] text-[#aeaeb2] mt-0.5">MP3, WAV, FLAC, AAC</p>
                  </div>
                </div>
              ) : (
                <div className="h-[152px] rounded-[12px] border border-[#e5e5ea] bg-[#fafafa] flex flex-col items-center justify-center gap-3 px-5 relative">
                  <div className="w-10 h-10 rounded-full bg-[#fff0f3] border border-[#ffd1d9] flex items-center justify-center">
                    <AudioFileIcon sx={{ fontSize: 18 }} className="text-[#fa243c]" />
                  </div>
                  <div className="text-center min-w-0 w-full">
                    <p className="text-[13px] font-semibold text-[#1d1d1f] truncate px-8">{audioFile.name}</p>
                    <p className="text-[11px] text-[#aeaeb2] mt-0.5">{formatSize(audioFile.size)}</p>
                  </div>
                  <button type="button" onClick={clearAudio}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-[#e5e5ea] flex items-center justify-center text-[#aeaeb2] hover:text-[#fa243c] hover:border-[#ffd1d9] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="px-8 pb-8 pt-0">
          <div className="pt-6 border-t border-[#f5f5f7]">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[980px] bg-[#fa243c] text-white text-[15px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-[#fa243c] active:enabled:scale-[0.99]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 18 }} />
                  Upload Song
                </>
              )}
            </button>
            {/* Contextual hint below button */}
            {!canSubmit && !loading && (
              <p className="text-center text-[12px] text-[#aeaeb2] mt-3">
                {!title.trim() || !artist.trim()
                  ? "Fill in title and artist to continue"
                  : "Upload both audio and cover files to continue"}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadSongForm;
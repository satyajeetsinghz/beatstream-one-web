import { useState, useEffect, useCallback, useRef } from "react";
import {
  addDoc, updateDoc, deleteField,
  collection, doc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";
import CloseIcon          from "@mui/icons-material/Close";
import ImageIcon          from "@mui/icons-material/Image";
import VideoLibraryIcon   from "@mui/icons-material/VideoLibrary";
import TitleIcon          from "@mui/icons-material/Title";
import SubtitlesIcon      from "@mui/icons-material/Subtitles";
import SortIcon           from "@mui/icons-material/Sort";
import LinkIcon           from "@mui/icons-material/Link";
import PlayCircleIcon     from "@mui/icons-material/PlayCircle";
import { uploadToCloudinary } from "@/features/admin/services/cloudinary.service";
import { useSongs } from "@/features/songs/hooks/useSongs";
import { IBanner } from "../types";

type RedirectType = "song" | "playlist" | "artist" | "section";

interface Props {
  banner?: IBanner | null;
  onClose: () => void;
}

// Safe Firestore Timestamp / Date / ISO string / null -> "YYYY-MM-DDTHH:mm" (local time)
const toLocalInput = (value: any): string => {
  if (!value) return "";
  try {
    const date =
      typeof value?.toDate === "function" ? value.toDate() :
      value instanceof Date              ? value            :
                                           new Date(value);
    if (isNaN(date.getTime())) return "";
    const p = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
  } catch { return ""; }
};

const toTimestamp = (value: string): Timestamp | null => {
  if (!value.trim()) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : Timestamp.fromDate(d);
};

const BannerFormModal = ({ banner, onClose }: Props) => {
  const { songs } = useSongs();

  const [form, setForm] = useState({
    title:        banner?.title        ?? "",
    subtitle:     banner?.subtitle     ?? "",
    imageUrl:     banner?.imageUrl     ?? "",
    mediaUrl:     banner?.mediaUrl     ?? "",
    buttonText:   banner?.buttonText   ?? "Listen Now",
    redirectType: banner?.redirectType ?? "song",
    redirectId:   banner?.redirectId   ?? "",
    order:        banner?.order        ?? 1,
    mediaType:    banner?.mediaType    ?? "image",
    startDate:    toLocalInput(banner?.startDate),
    endDate:      toLocalInput(banner?.endDate),
  });

  const [loading,          setLoading]          = useState(false);
  const [uploading,        setUploading]        = useState({ image: false, video: false });
  const [imagePreview,     setImagePreview]     = useState(banner?.imageUrl ?? "");
  const [videoPreview,     setVideoPreview]     = useState(banner?.mediaUrl ?? "");
  const [activeMediaTab,   setActiveMediaTab]   = useState<"image" | "video">(
    banner?.mediaType === "video" ? "video" : "image"
  );
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);

  const imageObjUrl = useRef<string | null>(null);
  const videoObjUrl = useRef<string | null>(null);

  // Revoke all object URLs on unmount (memory leak fix)
  useEffect(() => {
    return () => {
      if (imageObjUrl.current) URL.revokeObjectURL(imageObjUrl.current);
      if (videoObjUrl.current) URL.revokeObjectURL(videoObjUrl.current);
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploadError(null);
    if (imageObjUrl.current) URL.revokeObjectURL(imageObjUrl.current);
    const objUrl = URL.createObjectURL(file);
    imageObjUrl.current = objUrl;
    setImagePreview(objUrl);
    setUploading((p) => ({ ...p, image: true }));
    try {
      const url = await uploadToCloudinary(file);
      setForm((p) => ({ ...p, imageUrl: url }));
    } catch (error) {
      console.error("Image upload error:", error);
      setImageUploadError("Failed to upload image. Please try again.");
      setImagePreview(form.imageUrl);
    } finally {
      setUploading((p) => ({ ...p, image: false }));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploadError(null);
    if (!file.type.startsWith("video/")) { setVideoUploadError("Please select a valid video file"); return; }
    if (file.size > 50 * 1024 * 1024)    { setVideoUploadError("Video size should be less than 50MB"); return; }
    if (videoObjUrl.current) URL.revokeObjectURL(videoObjUrl.current);
    const objUrl = URL.createObjectURL(file);
    videoObjUrl.current = objUrl;
    setVideoPreview(objUrl);
    setUploading((p) => ({ ...p, video: true }));
    try {
      const url = await uploadToCloudinary(file);
      setForm((p) => ({ ...p, mediaUrl: url, mediaType: "video" }));
    } catch (error) {
      console.error("Video upload error:", error);
      setVideoUploadError("Failed to upload video. Please try again.");
      setVideoPreview(form.mediaUrl);
    } finally {
      setUploading((p) => ({ ...p, video: false }));
    }
  };

  // Auto-clear stale endDate when startDate is moved past it
  const handleStartDateChange = (value: string) => {
    setForm((p) => ({
      ...p,
      startDate: value,
      endDate: p.endDate && value && p.endDate <= value ? "" : p.endDate,
    }));
  };

  // Silently reject endDate that is not after startDate
  const handleEndDateChange = (value: string) => {
    if (value && form.startDate && value <= form.startDate) return;
    setForm((p) => ({ ...p, endDate: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (!form.title || !form.imageUrl) { alert("Title and Image are required"); return; }
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      alert("End date must be after start date"); return;
    }

    setLoading(true);
    try {
      const startTs = toTimestamp(form.startDate);
      const endTs   = toTimestamp(form.endDate);

      const basePayload: Record<string, any> = {
        title:        form.title,
        subtitle:     form.subtitle,
        imageUrl:     form.imageUrl,
        mediaUrl:     form.mediaUrl,
        mediaType:    form.mediaType,
        buttonText:   form.buttonText,
        redirectType: form.redirectType,
        redirectId:   form.redirectId,
        order:        Math.max(1, Number(form.order) || 1),
        isActive:     banner?.isActive ?? true,
        ...(startTs && { startDate: startTs }),
        ...(endTs   && { endDate:   endTs   }),
      };

      if (banner) {
        // Use deleteField() when a previously-set date is now cleared —
        // omitting the key leaves the old value; writing null breaks rules
        if (!startTs && banner.startDate) basePayload.startDate = deleteField();
        if (!endTs   && banner.endDate)   basePayload.endDate   = deleteField();
        await updateDoc(doc(db, "banners", banner.id), basePayload);
      } else {
        await addDoc(collection(db, "banners"), { ...basePayload, createdAt: serverTimestamp() });
      }

      onClose();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert("Failed to save banner");
    } finally {
      setLoading(false);
    }
  }, [form, banner, onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {banner ? "Edit Banner" : "Create Banner"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="text-gray-500" fontSize="small" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button type="button"
              onClick={() => { setActiveMediaTab("image"); setForm((p) => ({ ...p, mediaType: "image" })); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeMediaTab === "image" ? "bg-white text-[#fa243c] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}>
              <ImageIcon fontSize="small" /> Image
            </button>
            <button type="button"
              onClick={() => { setActiveMediaTab("video"); setForm((p) => ({ ...p, mediaType: "video" })); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeMediaTab === "video" ? "bg-white text-[#fa243c] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}>
              <VideoLibraryIcon fontSize="small" /> Video
            </button>
          </div>

          {activeMediaTab === "image" && (
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative h-40 rounded-xl overflow-hidden border border-gray-200">
                  <img src={imagePreview} alt="Banner preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs text-white font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <ImageIcon sx={{ fontSize: 14 }} /> Image Preview
                  </span>
                  {form.imageUrl && (
                    <span className="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Uploaded ✓</span>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <div className="flex items-center gap-1"><ImageIcon fontSize="small" className="text-gray-400" /><span>Upload Banner Image</span></div>
                </label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="banner-image-upload" disabled={uploading.image} />
                <label htmlFor="banner-image-upload"
                  className={`flex-1 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#fa243c] hover:bg-gray-50 cursor-pointer transition-all text-center block ${uploading.image ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {uploading.image ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#fa243c] border-t-transparent rounded-full animate-spin" /> Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><ImageIcon fontSize="small" /> Click to upload image</span>
                  )}
                </label>
                {imageUploadError && <p className="text-xs text-#fa243c mt-1">{imageUploadError}</p>}
                <p className="text-xs text-gray-400 mt-1">Recommended: 1200x400px, JPG/PNG up to 5MB</p>
              </div>
            </div>
          )}

          {activeMediaTab === "video" && (
            <div className="space-y-4">
              {videoPreview && (
                <div className="relative h-40 rounded-xl overflow-hidden border border-gray-200 bg-black">
                  <video src={videoPreview} className="w-full h-full object-cover" controls />
                  <span className="absolute bottom-2 left-3 text-xs text-white font-medium bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <PlayCircleIcon sx={{ fontSize: 14 }} /> Video Preview
                  </span>
                  {form.mediaUrl && (
                    <span className="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Uploaded ✓</span>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <div className="flex items-center gap-1"><VideoLibraryIcon fontSize="small" className="text-gray-400" /><span>Upload Banner Video</span></div>
                </label>
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" id="banner-video-upload" disabled={uploading.video} />
                <label htmlFor="banner-video-upload"
                  className={`flex-1 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#fa243c] hover:bg-gray-50 cursor-pointer transition-all text-center block ${uploading.video ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {uploading.video ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#fa243c] border-t-transparent rounded-full animate-spin" /> Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><VideoLibraryIcon fontSize="small" /> Click to upload video</span>
                  )}
                </label>
                {videoUploadError && <p className="text-xs text-#fa243c mt-1">{videoUploadError}</p>}
                <p className="text-xs text-gray-400 mt-1">MP4, WebM up to 50MB. Recommended: 1200x400px</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-700 flex items-start gap-1.5">
                  <span className="text-blue-500 text-sm">ℹ️</span>
                  <span><strong className="font-medium">Note:</strong> Even with video, a fallback image is required for browsers that don't support video or slow connections.</span>
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <div className="flex items-center gap-1"><TitleIcon fontSize="small" className="text-gray-400" /><span>Title</span></div>
            </label>
            <input placeholder="e.g. New Album Release"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa243c]/20 focus:border-[#fa243c] transition-colors"
              value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <div className="flex items-center gap-1"><SubtitlesIcon fontSize="small" className="text-gray-400" /><span>Subtitle</span></div>
            </label>
            <input placeholder="e.g. The latest hits from your favorite artists"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa243c]/20 focus:border-[#fa243c] transition-colors"
              value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <div className="flex items-center gap-1"><span className="text-gray-400 text-sm">🔘</span><span>Button Text</span></div>
            </label>
            <input placeholder="Listen Now"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa243c]/20 focus:border-[#fa243c] transition-colors"
              value={form.buttonText} onChange={(e) => setForm((p) => ({ ...p, buttonText: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <div className="flex items-center gap-1"><LinkIcon fontSize="small" className="text-gray-400" /><span>Redirect Type</span></div>
            </label>
            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#fa243c]/20 focus:border-[#fa243c] transition-colors bg-white"
              value={form.redirectType}
              onChange={(e) => setForm((p) => ({ ...p, redirectType: e.target.value as RedirectType, redirectId: "" }))}>
              <option value="song">Song</option>
              <option value="artist">Artist</option>
              <option value="section">Section</option>
            </select>
          </div>

          {form.redirectType === "song" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Select Song</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#fa243c]/20 focus:border-[#fa243c] transition-colors bg-white"
                value={form.redirectId} onChange={(e) => setForm((p) => ({ ...p, redirectId: e.target.value }))}>
                <option value="">Select a song</option>
                {songs.map((song) => <option key={song.id} value={song.id}>{song.title} - {song.artist}</option>)}
              </select>
            </div>
          )}
          {form.redirectType === "artist" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Artist ID</label>
              <input placeholder="Enter artist ID"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa243c]/20 focus:border-[#fa243c] transition-colors"
                value={form.redirectId} onChange={(e) => setForm((p) => ({ ...p, redirectId: e.target.value }))} />
            </div>
          )}
          {form.redirectType === "section" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Section ID</label>
              <input placeholder="Enter section ID"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa243c]/20 focus:border-[#fa243c] transition-colors"
                value={form.redirectId} onChange={(e) => setForm((p) => ({ ...p, redirectId: e.target.value }))} />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <div className="flex items-center gap-1"><SortIcon fontSize="small" className="text-gray-400" /><span>Display Order</span></div>
            </label>
            <input type="number" min="1" placeholder="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa243c]/20 focus:border-[#fa243c] transition-colors"
              value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: Math.max(1, Number(e.target.value) || 1) }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input type="datetime-local"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
                value={form.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <input type="datetime-local"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
                min={form.startDate || undefined}
                value={form.endDate}
                onChange={(e) => handleEndDateChange(e.target.value)} />
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50/50">
          <button onClick={onClose} disabled={loading}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            disabled={loading || uploading.image || uploading.video || !form.title || !form.imageUrl || !form.redirectId}
            className="px-5 py-2 text-sm font-medium bg-[#fa243c] text-white rounded-full hover:bg-[#E01E5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] flex items-center justify-center">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : banner ? "Update" : "Create"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BannerFormModal;
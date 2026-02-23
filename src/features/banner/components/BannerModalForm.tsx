import { useState } from "react";
import {
    addDoc,
    updateDoc,
    collection,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import TitleIcon from '@mui/icons-material/Title';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import SortIcon from '@mui/icons-material/Sort';
import LinkIcon from '@mui/icons-material/Link';
import { uploadToCloudinary } from "@/features/admin/services/cloudinary.service";
import { useSongs } from "@/features/songs/hooks/useSongs";

interface Props {
    banner?: any;
    onClose: () => void;
}

const BannerFormModal = ({ banner, onClose }: Props) => {
    const [form, setForm] = useState({
        title: banner?.title || "",
        subtitle: banner?.subtitle || "",
        imageUrl: banner?.imageUrl || "",
        buttonText: banner?.buttonText || "Listen Now",
        redirectType: banner?.redirectType || "song",
        redirectId: banner?.redirectId || "",
        order: banner?.order || 1,
        mediaType: banner?.mediaType || "image",
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(banner?.imageUrl || "");
    const { songs } = useSongs();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadToCloudinary(file);
            
            // Create preview
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            
            setForm({
                ...form,
                imageUrl: url,
                mediaType: file.type.startsWith("video") ? "video" : "image",
            });
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title || !form.imageUrl) {
            alert("Title and Image are required");
            return;
        }

        try {
            setLoading(true);

            if (banner) {
                await updateDoc(doc(db, "banners", banner.id), {
                    ...form,
                });
            } else {
                await addDoc(collection(db, "banners"), {
                    ...form,
                    isActive: true,
                    createdAt: serverTimestamp(),
                });
            }

            onClose();
        } catch (error) {
            console.error("Error saving banner:", error);
            alert("Failed to save banner");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {banner ? "Edit Banner" : "Create Banner"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <CloseIcon className="text-gray-500" fontSize="small" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="relative h-32 rounded-xl overflow-hidden border border-gray-200">
                            <img
                                src={imagePreview}
                                alt="Banner preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <span className="absolute bottom-2 left-3 text-xs text-white font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                                Banner Preview
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            <div className="flex items-center gap-1">
                                <TitleIcon fontSize="small" className="text-gray-400" />
                                <span>Title</span>
                            </div>
                        </label>
                        <input
                            placeholder="e.g. New Album Release"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            <div className="flex items-center gap-1">
                                <SubtitlesIcon fontSize="small" className="text-gray-400" />
                                <span>Subtitle</span>
                            </div>
                        </label>
                        <input
                            placeholder="e.g. The latest hits from your favorite artists"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors"
                            value={form.subtitle}
                            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            <div className="flex items-center gap-1">
                                <ImageIcon fontSize="small" className="text-gray-400" />
                                <span>Upload Image</span>
                            </div>
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="banner-image-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="banner-image-upload"
                                className={`flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors ${
                                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {uploading ? 'Uploading...' : 'Choose file'}
                            </label>
                            {form.imageUrl && (
                                <span className="text-xs text-green-600">✓ Uploaded</span>
                            )}
                        </div>
                        {form.imageUrl && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                                {form.imageUrl}
                            </p>
                        )}
                    </div>

                    {/* Button Text */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400 text-sm">🔘</span>
                                <span>Button Text</span>
                            </div>
                        </label>
                        <input
                            placeholder="Listen Now"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors"
                            value={form.buttonText}
                            onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                        />
                    </div>

                    {/* Redirect Type */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            <div className="flex items-center gap-1">
                                <LinkIcon fontSize="small" className="text-gray-400" />
                                <span>Redirect Type</span>
                            </div>
                        </label>
                        <select
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors bg-white"
                            value={form.redirectType}
                            onChange={(e) =>
                                setForm({ ...form, redirectType: e.target.value, redirectId: "" })
                            }
                        >
                            <option value="song">Song</option>
                            <option value="artist">Artist</option>
                            <option value="section">Section</option>
                        </select>
                    </div>

                    {/* Redirect ID - Conditional based on type */}
                    {form.redirectType === "song" && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                <span>Select Song</span>
                            </label>
                            <select
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors bg-white"
                                value={form.redirectId}
                                onChange={(e) =>
                                    setForm({ ...form, redirectId: e.target.value })
                                }
                            >
                                <option value="">Select a song</option>
                                {songs.map((song) => (
                                    <option key={song.id} value={song.id}>
                                        {song.title} - {song.artist}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {form.redirectType === "artist" && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                <span>Artist ID</span>
                            </label>
                            <input
                                placeholder="Enter artist ID"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors"
                                value={form.redirectId}
                                onChange={(e) =>
                                    setForm({ ...form, redirectId: e.target.value })
                                }
                            />
                        </div>
                    )}

                    {form.redirectType === "section" && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                <span>Section ID</span>
                            </label>
                            <input
                                placeholder="Enter section ID"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors"
                                value={form.redirectId}
                                onChange={(e) =>
                                    setForm({ ...form, redirectId: e.target.value })
                                }
                            />
                        </div>
                    )}

                    {/* Order */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            <div className="flex items-center gap-1">
                                <SortIcon fontSize="small" className="text-gray-400" />
                                <span>Display Order</span>
                            </div>
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="1"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors"
                            value={form.order}
                            onChange={(e) =>
                                setForm({ ...form, order: Number(e.target.value) })
                            }
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || uploading || !form.title || !form.imageUrl || !form.redirectId}
                        className="px-5 py-2 text-sm font-medium bg-[#FA2E6E] text-white rounded-full hover:bg-[#E01E5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : banner ? (
                            "Update"
                        ) : (
                            "Create"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannerFormModal;
import { useEffect, useRef, useState } from "react";
import { createPlaylist } from "../services/playlistService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import CloseIcon from "@mui/icons-material/Close";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { useResponsive } from "@/components/layout/hooks/useResponsive";

interface Props {
    open: boolean;
    onClose: () => void;
}

const CreatePlaylistModal = ({ open, onClose }: Props) => {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { isMobile } = useResponsive();

    /* ---------------- CLOSE HANDLERS ---------------- */

    const handleClose = () => {
        if (loading) return;
        setName("");
        onClose();
    };

    // Click outside to close
    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target as Node)
            ) {
                handleClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, handleClose]);

    // Escape key to close
    useEffect(() => {
        if (!open) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, [open, handleClose]);

    // Focus input when modal opens
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    // Early return AFTER all hooks
    if (!open) return null;

    /* ---------------- CREATE ---------------- */

    const handleCreate = async () => {
        if (!user || !name.trim() || loading) return;

        try {
            setLoading(true);
            await createPlaylist(user.uid, name.trim());
            setName("");
            onClose();
        } catch (error) {
            console.error("Failed to create playlist:", error);
        } finally {
            setLoading(false);
        }
    };

    /* Submit on Enter */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleCreate();
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95%] xs:max-w-sm sm:max-w-md mx-auto overflow-hidden animate-fadeIn"
                style={{ maxHeight: '90vh' }}
            >
                {/* Header - Responsive */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#FA2E6E]/10 rounded-full flex items-center justify-center">
                            <PlaylistAddIcon className="text-[#FA2E6E]" fontSize="small" />
                        </div>
                        <h2 className="text-base sm:text-xl font-semibold text-gray-900">
                            Create Playlist
                        </h2>
                    </div>

                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        aria-label="Close"
                    >
                        <CloseIcon className="text-gray-500" fontSize={isMobile ? "small" : "medium"} />
                    </button>
                </div>

                {/* Content - Responsive */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                    {/* Icon Preview - Responsive */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#FA2E6E] to-purple-500 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center">
                            <LibraryMusicIcon 
                                className="text-white" 
                                sx={{ fontSize: { xs: 28, sm: 32, md: 40 } }}
                            />
                        </div>
                    </div>

                    {/* Input Section */}
                    <div>
                        <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-2">
                            Playlist Name
                        </label>

                        <div className="relative">
                            <input
                                ref={inputRef}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g., My Favorite Songs"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors"
                                maxLength={50}
                                disabled={loading}
                            />
                            
                            {/* Character count indicator */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <span className="text-[10px] sm:text-xs text-gray-400">
                                    {name.length}/50
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info Cards - Responsive Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2">
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                            <p className="text-[10px] sm:text-xs text-gray-500">Privacy</p>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">Private</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                            <p className="text-[10px] sm:text-xs text-gray-500">Tracks</p>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">0 songs</p>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-[8px] sm:text-[10px] font-bold">i</span>
                        </span>
                        <p className="text-[10px] sm:text-xs text-blue-700">
                            Your playlist will be private until you share it with others
                        </p>
                    </div>
                </div>

                {/* Footer - Responsive */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50/50">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreate}
                        disabled={!name.trim() || loading}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-[#FA2E6E] text-white rounded-full hover:bg-[#E01E5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <PlaylistAddIcon fontSize="small" />
                                <span>Create Playlist</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePlaylistModal;
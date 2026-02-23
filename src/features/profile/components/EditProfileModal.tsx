import { useState, useRef, useEffect } from "react";
import { uploadProfileImage } from "../services/cloudinaryService";
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import { useResponsive } from "@/components/layout/hooks/useResponsive";

interface Props {
    profile: any;
    onClose: () => void;
    onSave: (data: any) => void;
}

const EditProfileModal = ({ profile, onClose, onSave }: Props) => {
    const [name, setName] = useState(profile?.name || "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(profile?.photoURL || null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const modalRef = useRef<HTMLDivElement>(null);
    const { isMobile } = useResponsive();

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            // Simulate upload progress
            setUploadProgress(0);
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 100);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            let photoURL = profile?.photoURL;

            if (imageFile) {
                photoURL = await uploadProfileImage(imageFile);
            }

            await onSave({
                displayName: name,
                photoURL,
            });

            onClose();
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div 
                ref={modalRef}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-md md:max-w-lg overflow-hidden animate-fadeIn"
            >
                {/* Header - Responsive */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <CloseIcon className="text-gray-500" fontSize={isMobile ? "small" : "medium"} />
                    </button>
                </div>

                {/* Content - Responsive */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-xl transition-transform group-hover:scale-105">
                                <img
                                    src={imagePreview || "/default-avatar.png"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <label className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#FA2E6E] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#E01E5A] transition-colors hover:scale-110">
                                <PhotoCameraIcon className="text-white" fontSize="small" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        
                        {/* Upload Progress */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-32 sm:w-40 mt-2">
                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-[#FA2E6E] transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 text-center mt-1">
                                    Uploading... {uploadProgress}%
                                </p>
                            </div>
                        )}
                        
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                            Tap camera to change photo
                        </p>
                    </div>

                    {/* Name Input with Icon */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 sm:mb-2">
                            <div className="flex items-center gap-1">
                                <PersonIcon fontSize="small" className="text-gray-400" />
                                <span>Display Name</span>
                            </div>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:border-[#FA2E6E] transition-colors"
                        />
                    </div>

                    {/* Email (read-only) with Icon */}
                    {profile?.email && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 sm:mb-2">
                                <div className="flex items-center gap-1">
                                    <EmailIcon fontSize="small" className="text-gray-400" />
                                    <span>Email</span>
                                </div>
                            </label>
                            <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                                <EmailIcon className="text-gray-400" fontSize="small" />
                                <p className="text-xs sm:text-sm text-gray-700 break-all">
                                    {profile.email}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Additional Info - Optional */}
                    <div className="bg-gray-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            <span className="font-medium">Member since:</span>{' '}
                            {new Date().toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                            })}
                        </p>
                    </div>
                </div>

                {/* Footer - Responsive */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-full hover:bg-gray-100"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-[#FA2E6E] text-white rounded-full hover:bg-[#E01E5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { uploadProfileImage } from "../services/cloudinaryService";
import { CameraAltRounded } from "@mui/icons-material";

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
    const [error, setError] = useState<string | null>(null);

    const backdropRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Body scroll lock ──────────────────────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    // ── Escape to close ───────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading) onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose, loading]);

    // ── Backdrop click ────────────────────────────────────────────────────────
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === backdropRef.current && !loading) onClose();
        },
        [onClose, loading]
    );

    // ── File change ───────────────────────────────────────────────────────────
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setUploadProgress(0);

        // Simulate upload progress indicator
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) { clearInterval(interval); return 100; }
                return prev + 10;
            });
        }, 80);
    }, []);

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        if (!name.trim() || loading) return;
        setError(null);
        setLoading(true);

        try {
            let photoURL = profile?.photoURL;
            if (imageFile) photoURL = await uploadProfileImage(imageFile);

            await onSave({ displayName: name.trim(), photoURL });
            onClose();
        } catch (err) {
            console.error("[EditProfileModal]", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    }, [name, loading, imageFile, profile?.photoURL, onSave, onClose]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleSubmit();
        },
        [handleSubmit]
    );

    // Derived
    const initials = (profile?.name || "U")
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const isValid = name.trim().length > 0;

    return createPortal(
        <>
            <style>{`
                @keyframes sheetUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes backdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .ep-toggle {
                    position: relative;
                    width: 51px;
                    height: 31px;
                    border-radius: 999px;
                    transition: background 0.2s;
                    flex-shrink: 0;
                    cursor: pointer;
                    border: none;
                    outline: none;
                }
                .ep-toggle-thumb {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 27px;
                    height: 27px;
                    border-radius: 50%;
                    background: #fff;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.22);
                    transition: transform 0.22s cubic-bezier(0.34,1.3,0.64,1);
                }
                .ep-input {
                    width: 100%;
                    background: #fff;
                    border: 1px solid #d1d1d6;
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 15px;
                    color: #1c1c1e;
                    font-family: -apple-system, 'SF Pro Text', sans-serif;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .ep-input:focus { border-color: #fa243c; }
                .ep-input::placeholder { color: #aeaeb2; }
            `}</style>

            {/* Backdrop - centered content with flex */}
            <div
                ref={backdropRef}
                onClick={handleBackdropClick}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    animation: "backdropIn 0.18s ease",
                }}
            >
                {/* ── Sheet - height auto, centered ── */}
                <div
                    className="relative w-full max-w-[400px] md:max-w-[420px] lg:max-w-[440px] rounded-[20px] overflow-hidden mx-auto"
                    style={{
                        background: "#f2f2f7",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)",
                        animation: "sheetUp 0.28s cubic-bezier(0.34,1.3,0.64,1)",
                        // fontFamily: "-apple-system,'SF Pro Text',sans-serif",
                        maxHeight: "calc(100vh - 32px)",
                        overflowY: "auto",
                    }}
                >
                    {/* Drag handle — visible only on mobile */}
                    <div className="flex justify-center pt-2.5 pb-0 sm:hidden">
                        <div className="w-10 h-1 rounded-full bg-black/15" />
                    </div>

                    {/* ── Title ── */}
                    <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
                        <h2
                            className="font-semibold text-xl sm:text-2xl text-neutral-700"
                            style={{ letterSpacing: "-0.5px" }}
                        >
                            Edit Profile
                        </h2>
                    </div>

                    {/* ── Avatar row + Name/Username fields ── */}
                    <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-1 flex flex-col sm:flex-row items-start gap-4">
                        {/* Avatar + camera */}
                        <div className="relative self-center sm:self-start">
                            <div
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center"
                                style={{
                                    background: imagePreview ? "transparent" : "#c7c7cc",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                }}
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                ) : (
                                    <span
                                        className="font-semibold select-none text-2xl sm:text-3xl"
                                        style={{ color: "#3a3a3c"}}
                                    >
                                        {initials}
                                    </span>
                                )}
                            </div>

                            {/* Camera icon badge */}
                            <label
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center cursor-pointer"
                                // style={{
                                //     background: "rgba(60,60,67,0.22)",
                                //     backdropFilter: "blur(4px)",
                                // }}
                                aria-label="Change photo"
                            >
                                <CameraAltRounded
                                    sx={{ fontSize: { xs: 15, sm: 17 } }}
                                    style={{ color: "#fff" }}
                                />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {/* Upload progress */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="absolute -bottom-5 left-0 right-0">
                                    <div className="h-[3px] rounded-full bg-black/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-150"
                                            style={{ width: `${uploadProgress}%`, background: "#fa243c" }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Name + Username fields */}
                        <div className="flex-1 w-full space-y-3">
                            {/* Name */}
                            <div>
                                <p className="mb-1 text-xs sm:text-sm" style={{ color: "#3a3a3c", fontWeight: 500 }}>
                                    Name
                                </p>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(null); }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Your name"
                                    maxLength={50}
                                    disabled={loading}
                                    className="ep-input disabled:opacity-50 text-sm"
                                    style={{ caretColor: "#fa243c" }}
                                />
                            </div>

                            {/* Username */}
                            {profile?.email && (
                                <div>
                                    <p className="mb-1 text-xs sm:text-sm" style={{ color: "#3a3a3c", fontWeight: 500 }}>
                                        Username
                                    </p>
                                    <input
                                        type="text"
                                        value={
                                            profile?.username
                                                ? `@${profile.username}`
                                                : `@${profile.email.split("@")[0]}`
                                        }
                                        readOnly
                                        className="ep-input text-sm"
                                        style={{ color: "#8e8e93", cursor: "default" }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hint text */}
                    <p className="px-4 sm:px-5 pt-2 text-xs sm:text-sm" style={{ color: "#8e8e93", lineHeight: 1.4 }}>
                        Your photo, name and username will be public so people can find and follow you.
                    </p>

                    {/* Error */}
                    {error && (
                        <p className="px-4 sm:px-5 pt-2 text-xs text-center" style={{ color: "#ff3b30" }}>
                            {error}
                        </p>
                    )}

                    {/* ── Divider ── */}
                    <div className="mx-4 sm:mx-5 my-4" style={{ height: 1, background: "#c6c6c8" }} />

                    {/* ── Who can follow ── */}
                    {/* <div className="px-4 sm:px-5">
                        <p className="font-bold text-base sm:text-lg mb-3" style={{ color: "#1c1c1e", letterSpacing: "-0.2px" }}>
                            Choose Who Can Follow Your Activity
                        </p>

                        Everyone row
                        <div className="flex items-start justify-between gap-2 mb-4">
                            <div className="flex-1 pr-2">
                                <p className="text-sm font-medium" style={{ color: "#1c1c1e" }}>Everyone</p>
                                <p className="text-xs sm:text-sm" style={{ color: "#8e8e93", marginTop: 2 }}>
                                    Anyone can follow and see your music.
                                </p>
                            </div>
                            <button className="ep-toggle flex-shrink-0" style={{ background: "#fa243c" }} aria-label="Everyone toggle">
                                <div className="ep-toggle-thumb" style={{ transform: "translateX(20px)" }} />
                            </button>
                        </div>

                        People you approve row
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 pr-2">
                                <p className="text-sm font-medium" style={{ color: "#1c1c1e" }}>People you approve</p>
                                <p className="text-xs sm:text-sm" style={{ color: "#8e8e93", marginTop: 2 }}>
                                    Only people you approve can follow and see your music.
                                </p>
                            </div>
                            <button className="ep-toggle flex-shrink-0" style={{ background: "#e5e5ea" }} aria-label="People you approve toggle">
                                <div className="ep-toggle-thumb" style={{ transform: "translateX(0)" }} />
                            </button>
                        </div>
                    </div> */}

                    {/* ── Show on Profile ── */}
                    {/* <div className="px-4 sm:px-5 mb-4">
                        <p className="font-bold text-base sm:text-lg mb-1" style={{ color: "#1c1c1e", letterSpacing: "-0.2px" }}>
                            Show on Profile
                        </p>
                    </div> */}

                    {/* ── Footer buttons ── */}
                    <div className="px-4 sm:px-5 pb-6 flex gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={!isValid || loading}
                            className="flex-1 py-2 sm:py-1.5 rounded-full sm:rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                            style={{
                                background: "#fa243c",
                                color: "#fff",
                                opacity: !isValid || loading ? 0.45 : 1,
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                    Saving
                                </>
                            ) : "Save"}
                        </button>

                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2 sm:py-1.5 rounded-full sm:rounded-md text-sm font-semibold transition-opacity disabled:opacity-50"
                            style={{ background: "#e5e5ea", color: "#3a3a3c" }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default EditProfileModal;
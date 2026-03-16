import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { createPlaylist } from "../services/playlistService";
import { useAuth } from "@/features/auth/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
    open: boolean;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const CreatePlaylistModal = ({ open, onClose }: Props) => {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const backdropRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ── Reset state on open/close ─────────────────────────────────────────────
    useEffect(() => {
        // Early return if modal is closed
        if (!open) return;

        let isMounted = true;

        // Reset form state when modal opens
        const resetForm = () => {
            setName("");
            setError(null);
        };

        resetForm();

        // Focus input after animation completes
        const focusTimeout = setTimeout(() => {
            // Check if component is still mounted and input exists
            if (isMounted && inputRef.current) {
                inputRef.current.focus();
            }
        }, 120);

        // Cleanup function
        return () => {
            isMounted = false;
            clearTimeout(focusTimeout);
        };
    }, [open, setName, setError]);

    // ── Escape key ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading) handleClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, loading]);

    // ── Body scroll lock ──────────────────────────────────────────────────────
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleClose = useCallback(() => {
        if (loading) return;
        onClose();
    }, [loading, onClose]);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === backdropRef.current) handleClose();
        },
        [handleClose]
    );

    const handleCreate = useCallback(async () => {
        const trimmed = name.trim();
        if (!user || !trimmed || loading) return;

        setError(null);
        setLoading(true);

        try {
            await createPlaylist(user.uid, trimmed);
            onClose();
        } catch (err) {
            console.error("[CreatePlaylistModal] Failed to create playlist:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [user, name, loading, onClose]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleCreate();
        },
        [handleCreate]
    );

    // ── Don't render ──────────────────────────────────────────────────────────
    if (!open) return null;

    const isValid = name.trim().length > 0;

    // ── Portal ────────────────────────────────────────────────────────────────
    return createPortal(
        <>
            <style>{`
                @keyframes backdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes sheetUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)    scale(1); }
                }
            `}</style>

            {/* Backdrop */}
            <div
                ref={backdropRef}
                onClick={handleBackdropClick}
                className="fixed inset-0 z-[9999] flex items-center justify-center sm:p-4"
                style={{
                    background: "rgba(0, 0, 0, 0.5)", // Almost solid white
                    animation: "backdropIn 0.2s ease",
                }}
            >
                {/* Sheet */}
                <div
                    className="relative w-[280px] sm:max-w-sm rounded-lg overflow-hidden"
                    style={{
                        background: "rgba(255, 255, 255, 1)",
                        backdropFilter: "blur(48px) saturate(180%)",
                        WebkitBackdropFilter: "blur(48px) saturate(180%)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)",
                        animation: "sheetUp 0.28s cubic-bezier(0.34,1.3,0.64,1)",
                    }}
                >
                    {/* ── Drag handle — mobile only ── */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-9 h-[5px] rounded-full bg-black/20" />
                    </div>

                    {/* ── Header ── */}
                    <div className="px-5 pt-5 sm:pt-6 pb-4 text-start border-b border-black/[0.06]">
                        {/* Icon */}
                        {/* <div className="mx-auto mb-3.5 w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #fa243c 0%, #bf5af2 100%)",
                                boxShadow: "0 8px 24px rgba(255,55,95,0.25)",
                            }}
                        >
                            <MusicNoteIcon sx={{ fontSize: 26 }} className="text-white" />
                        </div> */}

                        <h2
                            className="text-lg font-semibold tracking-normal text-neutral-800"
                        >
                            New Playlist
                        </h2>
                        <p className="text-[12.5px] text-neutral-900/40 mt-0.5 tracking-[-0.1px]">

                        </p>
                    </div>

                    {/* ── Input ── */}
                    <div className="px-5 py-2.5">
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Playlist Title"
                            maxLength={50}
                            disabled={loading}
                            className="w-full bg-neutral-50 rounded-md px-4 py-2 text-sm tracking-wide font-medium text-neutral-800/70 placeholder-neutral-800/70 outline-none transition-all duration-200 disabled:opacity-50"
                            style={{
                                letterSpacing: "-0.1px",
                                border: error
                                    ? "1.5px solid rgba(255,59,48,0.5)"
                                    : isValid
                                        ? "1.5px solid rgba(255,55,95,0.4)"
                                        : "1.5px solid rgba(0,0,0,0.06)",
                                caretColor: "#fa243c",
                            }}
                            aria-label="Playlist Title"
                        />

                        {/* Error or char count */}
                        <div className="flex justify-between mt-2 px-0.5 h-4">
                            {error ? (
                                <p className="text-[11px] text-[#fa243c]">{error}</p>
                            ) : (
                                <span />
                            )}
                            <p
                                className="text-[11px] ml-auto"
                                style={{ color: name.length > 42 ? "#ff9f0a" : "rgba(0,0,0,0.25)" }}
                            >
                                {name.length}/50
                            </p>
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div
                        className="flex p-4 gap-2 bg-neutral-100/90"
                    >
                        {/* Cancel */}
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="w-full text-sm py-1 rounded-md text-neutral-700 hover:text-neutral-500 bg-white font-medium active:bg-black/[0.04] transition-colors duration-100 disabled:opacity-40"
                        >
                            Cancel
                        </button>

                        {/* Divider */}
                        {/* <div className="bg-black/[0.06]" /> */}

                        {/* Create */}
                        <button
                            onClick={handleCreate}
                            disabled={!isValid || loading}
                            className="w-full text-sm py-1 rounded-md text-neutral-50 hover:text-neutral-50 bg-[#fa243c] hover:bg-[#fa243c] font-medium transition-colors duration-100 disabled:opacity-40"
                            style={{
                                color: isValid && !loading ? "#fff" : "fff",
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span
                                        className="w-4 h-4 rounded-full border-2 border-[#fa243c]/20 border-t-[#fa243c] animate-spin inline-block"
                                    />
                                    Creating
                                </span>
                            ) : (
                                "Create"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default CreatePlaylistModal;
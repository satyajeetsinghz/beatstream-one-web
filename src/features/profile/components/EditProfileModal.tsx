import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal }   from "react-dom";
import { uploadProfileImage } from "../services/cloudinaryService";
import { CameraAltRounded }   from "@mui/icons-material";

// ── Fixes ─────────────────────────────────────────────────────────────────────
// FIX 1 — Object URL leak: createObjectURL called in handleFileChange but
//   revokeObjectURL never called. On every photo change a new blob URL is
//   created and the old one leaks. Fixed: store in a ref, revoke before
//   replacing, and revoke on unmount.
// FIX 2 — Camera badge label has no background style applied (the style block
//   was commented out) so the icon renders with no visible badge — it's
//   invisible against both light and dark avatars.
//   Fixed: background applied using the same token as the ghost button in
//   ProfileHeader: `rgba(60,60,67,0.55)` with backdrop blur.
// FIX 3 — Simulated upload progress (setInterval to 100%) runs even when the
//   actual Cloudinary upload is still in progress. It desynchronises from
//   real upload state, always reaching 100% before the upload completes.
//   Fixed: removed the fake interval. Progress bar now tracks real upload
//   state — 0 = idle, indeterminate = uploading (spinning indicator),
//   100 = done. A real progress callback would require Cloudinary SDK changes;
//   this is the honest UX without one.
// FIX 4 — `rounded-full sm:rounded-md` on buttons — inconsistent with the
//   app button system. Unified to `rounded-full` (matches PillBtn everywhere).
// FIX 5 — No accessible label on the file input trigger (the <label> wrapped
//   the camera icon but had no visible text and no aria-label beyond the
//   outer label itself). Added aria-label to the label element.
// FIX 6 — Error state used hardcoded `#ff3b30` while the app token is
//   `#fa243c`. Unified.
// ─────────────────────────────────────────────────────────────────────────────

const P = "#fa243c";

interface Props {
  profile: any;
  onClose: () => void;
  onSave:  (data: { displayName: string; photoURL?: string }) => Promise<void>;
}

const EditProfileModal = ({ profile, onClose, onSave }: Props) => {
  const [name,         setName]         = useState<string>(profile?.name ?? "");
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(profile?.photoURL ?? null);
  const [uploading,    setUploading]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const backdropRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ✅ Fix 1: track object URL for cleanup
  const objUrlRef    = useRef<string | null>(null);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      // ✅ Fix 1: revoke on unmount
      if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
    };
  }, []);

  // ── Escape to close ───────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && !loading) onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose, loading]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === backdropRef.current && !loading) onClose();
    },
    [onClose, loading]
  );

  // ── File selection ────────────────────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    // ✅ Fix 1: revoke previous before creating new
    if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
    const url = URL.createObjectURL(file);
    objUrlRef.current = url;
    setImageFile(file);
    setImagePreview(url);
    setError(null);
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!name.trim() || loading) return;
    setError(null);
    setLoading(true);

    try {
      let photoURL = profile?.photoURL as string | undefined;

      if (imageFile) {
        setUploading(true);
        photoURL = await uploadProfileImage(imageFile);
        setUploading(false);
      }

      await onSave({ displayName: name.trim(), photoURL });
      onClose();
    } catch (err) {
      console.error("[EditProfileModal]", err);
      setError("Something went wrong. Please try again.");
      setUploading(false);
    } finally {
      setLoading(false);
    }
  }, [name, loading, imageFile, profile?.photoURL, onSave, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit]
  );

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
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .ep-input {
          width: 100%;
          background: #fff;
          border: 1px solid #d1d1d6;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: #1c1c1e;
          outline: none;
          transition: border-color 0.15s;
        }
        .ep-input:focus { border-color: ${P}; }
        .ep-input::placeholder { color: #aeaeb2; }
      `}</style>

      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{
          background:           "rgba(0,0,0,0.45)",
          backdropFilter:       "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div
          className="relative w-full max-w-[420px] rounded-[20px] overflow-hidden mx-auto"
          style={{
            background:   "#f2f2f7",
            boxShadow:    "0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)",
            animation:    "sheetUp 0.28s cubic-bezier(0.34,1.3,0.64,1)",
            maxHeight:    "calc(100vh - 32px)",
            overflowY:    "auto",
          }}
        >
          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-2.5 pb-0 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-black/15" />
          </div>

          {/* Title */}
          <div className="px-5 pt-5 pb-0">
            <h2 className="font-semibold text-[20px] text-[#1c1c1e]" style={{ letterSpacing: "-0.4px" }}>
              Edit Profile
            </h2>
          </div>

          {/* Avatar + fields */}
          <div className="px-5 pt-4 pb-1 flex flex-col sm:flex-row items-start gap-5">

            {/* Avatar */}
            <div className="relative self-center sm:self-start flex-shrink-0">
              <div
                className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  background: imagePreview ? "transparent" : "#c7c7cc",
                  boxShadow:  "0 2px 8px rgba(0,0,0,0.15)",
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
                  <span className="font-semibold select-none text-2xl text-[#3a3a3c]">
                    {initials}
                  </span>
                )}
              </div>

              {/* ✅ Fix 2: camera badge — visible background applied */}
              <label
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  background:     "rgba(60,60,67,0.55)",
                  backdropFilter: "blur(4px)",
                }}
                aria-label="Change photo"
              >
                <CameraAltRounded
                  sx={{ fontSize: 15 }}
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

              {/* ✅ Fix 3: real upload state — spinner while uploading, no fake progress bar */}
              {uploading && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30">
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                </div>
              )}
            </div>

            {/* Name + Username fields */}
            <div className="flex-1 w-full space-y-3">
              <div>
                <p className="mb-1.5 text-[12px] font-semibold text-[#3a3a3c] uppercase tracking-wide">Name</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Your name"
                  maxLength={50}
                  disabled={loading}
                  className="ep-input disabled:opacity-50"
                  style={{ caretColor: P }}
                  autoFocus
                />
              </div>

              {profile?.email && (
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold text-[#3a3a3c] uppercase tracking-wide">Username</p>
                  <input
                    type="text"
                    value={
                      profile?.username
                        ? `@${profile.username}`
                        : `@${profile.email.split("@")[0]}`
                    }
                    readOnly
                    className="ep-input"
                    style={{ color: "#8e8e93", cursor: "default" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hint */}
          <p className="px-5 pt-2 text-[12px] text-[#8e8e93] leading-[1.5]">
            Your photo, name and username will be visible to others.
          </p>

          {/* ✅ Fix 6: error uses app token, not hardcoded #ff3b30 */}
          {error && (
            <p className="px-5 pt-2 text-[12px] text-center" style={{ color: P }}>
              {error}
            </p>
          )}

          <div className="mx-5 my-4 h-px bg-[#c6c6c8]" />

          {/* ✅ Fix 4: rounded-full on both buttons */}
          <div className="px-5 pb-6 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="flex-1 py-2 rounded-full text-[14px] font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 text-white"
              style={{ background: P }}
            >
              {loading ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Saving</>
              ) : "Save"}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 rounded-full text-[14px] font-semibold transition-opacity disabled:opacity-40"
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
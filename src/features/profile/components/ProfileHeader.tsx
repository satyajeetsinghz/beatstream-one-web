import { useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

// ── Fixes ─────────────────────────────────────────────────────────────────────
// FIX 1 — Blurred cover layer had `backgroundImage` commented out — the cover
//   bg was never applied so the blur div was a transparent overlay doing nothing.
//   Uncommented and wired to profile.photoURL.
// FIX 2 — height: 220 hardcoded inline style while COVER_H = 220 is the
//   established token across PlaylistPage/LibraryPage. Unified via the const.
// FIX 3 — `rounded-md` on the root div while the rest of the UI uses
//   `rounded-2xl`. Removed (ProfilePage's parent card clips it anyway).
// FIX 4 — Edit button: `rounded-full sm:rounded-md` mixed — inconsistent.
//   Unified to `rounded-full` matching the app button system.
// FIX 5 — ··· button is the same red as Edit, making it look like a second
//   primary CTA. Changed to a ghost button with a subtle bg matching the
//   app's secondary button pattern.
// FIX 6 — `profile: any` prop type — added a minimal interface so callers
//   get type hints without breaking the existing contract.
// ─────────────────────────────────────────────────────────────────────────────

const P  = "#fa243c";
const COVER_H = 220;

interface ProfileData {
  name?:     string;
  username?: string;
  email?:    string;
  photoURL?: string;
  [key: string]: any;
}

interface Props {
  profile: ProfileData | null;
  onEdit:  () => void;
}

const ProfileHeader = ({ profile, onEdit }: Props) => {
  const [moreOpen, setMoreOpen] = useState(false);

  const displayName = profile?.name || "User";
  const username    =
    profile?.username
      ? `@${profile.username}`
      : profile?.email?.split("@")[0]
      ? `@${profile.email.split("@")[0]}`
      : "";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: COVER_H, background: "#f5f5f7" }}
    >
      {/* ✅ Fix 1: blurred cover — backgroundImage actually applied */}
      {profile?.photoURL && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:    `url(${profile.photoURL})`,
            backgroundSize:     "cover",
            backgroundPosition: "center",
            filter:             "blur(28px) brightness(0.82) saturate(1.2)",
            transform:          "scale(1.14)",
          }}
        />
      )}

      {/* Gradient overlay — subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: profile?.photoURL
            ? "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.14) 100%)"
            : "radial-gradient(ellipse at 50% 0%, rgba(250,36,60,0.06) 0%, rgba(250,36,60,0.02) 100%)",
        }}
      />

      {/* Avatar — centred, top-biased */}
      <div className="absolute left-1/2 -translate-x-1/2 top-7">
        <div
          className="w-[108px] h-[108px] rounded-full overflow-hidden flex items-center justify-center"
          style={{
            background: profile?.photoURL ? "transparent" : "#e5e5ea",
            boxShadow:  "0 4px 24px rgba(0,0,0,0.18), 0 0 0 3px rgba(255,255,255,0.22)",
          }}
        >
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt={displayName}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <span
              className="text-[#636366] font-semibold"
              style={{ fontSize: 36, letterSpacing: "-0.5px" }}
            >
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* Bottom row: name/username · Edit + ··· */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-5 pb-4">

        {/* Name + username */}
        <div>
          <p
            className="font-bold leading-tight"
            style={{
              fontSize:      18,
              // ✅ Fix 1 side-effect: text needs contrast against the blurred bg
              color:         profile?.photoURL ? "#ffffff" : "#1c1c1e",
              letterSpacing: "-0.3px",
              textShadow:    profile?.photoURL ? "0 1px 4px rgba(0,0,0,0.35)" : "none",
            }}
          >
            {displayName}
          </p>
          {username && (
            <p
              style={{
                fontSize:   13,
                color:      profile?.photoURL ? "rgba(255,255,255,0.78)" : "#636366",
                marginTop:  2,
                textShadow: profile?.photoURL ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
              }}
            >
              {username}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pb-0.5">
          {/* Edit — red pill, primary CTA */}
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-full font-semibold transition-opacity hover:opacity-85 active:opacity-60 text-[14px] text-white"
            style={{ background: P, letterSpacing: "0.02em" }}
          >
            Edit
          </button>

          {/* ✅ Fix 5: ghost button — not a second red CTA */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-85 active:opacity-60"
              style={{
                background: profile?.photoURL ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
                color:      profile?.photoURL ? "#ffffff" : "#636366",
                backdropFilter: "blur(4px)",
              }}
              aria-label="More options"
            >
              <MoreHorizIcon sx={{ fontSize: 18 }} />
            </button>

            {/* Simple more-options dropdown */}
            {moreOpen && (
              <div
                className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-xl border border-black/[0.08] shadow-xl py-1.5 z-50"
                onMouseLeave={() => setMoreOpen(false)}
              >
                <button
                  onClick={() => { setMoreOpen(false); onEdit(); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                >
                  Edit Profile
                </button>
                <div className="h-px bg-[#f2f2f7] my-1" />
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors"
                >
                  Share Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
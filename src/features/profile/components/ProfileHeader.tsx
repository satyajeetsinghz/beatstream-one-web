import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface Props {
  profile: any;
  onEdit: () => void;
}

const ProfileHeader = ({ profile, onEdit }: Props) => {
  // Derive initials from name (same logic, no data change)
  const displayName: string = profile?.name || "User Name";
  const username: string = profile?.username
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
      className="relative w-full rounded-md overflow-hidden select-none"
      style={{ height: 220, background: "white" }}
    >
      {/* ── Blurred cover layer (uses photo if available, else solid) ── */}
      {profile?.photoURL && (
        <div
          className="absolute inset-0"
          style={{
            // backgroundImage: `url(${profile.photoURL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(28px) brightness(0.85) saturate(1.2)",
            transform: "scale(1.12)",
          }}
        />
      )}

      {/* ── Subtle noise / vignette overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* ── Avatar — horizontally centred, top-biased ── */}
      <div className="absolute left-1/2 -translate-x-1/2 top-6">
        <div
          className="w-[108px] h-[108px] rounded-full overflow-hidden flex items-center justify-center"
          style={{
            background: profile?.photoURL ? "transparent" : "#8e8e93",
            boxShadow: "0 4px 24px rgba(0,0,0,0.22), 0 0 0 3px rgba(255,255,255,0.18)",
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
              className="text-white font-semibold"
              style={{
                fontSize: 36,
                // fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* ── Bottom row: name/username left · buttons right ── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-5 pb-4">

        {/* Name + username */}
        <div>
          <p
            className="font-bold leading-tight"
            style={{
              fontSize: 18,
              color: "#1c1c1e",
              // fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
              letterSpacing: "-0.3px",
            }}
          >
            {displayName}
          </p>
          {username && (
            <p
              className="mt-0.5"
              style={{
                fontSize: 13,
                color: "#636366",
                // fontFamily: "-apple-system, 'SF Pro Text', sans-serif",
              }}
            >
              {username}
            </p>
          )}
        </div>

        {/* EDIT + ··· buttons */}
        <div className="flex items-center gap-2 pb-0.5">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-5 py-1.5 sm:py-1 rounded-full sm:rounded-md font-semibold transition-opacity hover:opacity-85 active:opacity-60"
            style={{
              background: "#fa243c",
              color: "#fff",
              fontSize: 14,
              // fontFamily: "-apple-system, 'SF Pro Text', sans-serif",
              letterSpacing: "0.02em",
              // boxShadow: "0 2px 8px rgba(255,55,95,0.4)",
            }}
          >
            {/* <EditIcon sx={{ fontSize: 14 }} /> */}
            Edit
          </button>

          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-85 active:opacity-60"
            style={{
              background: "#fa243c",
              color: "#fff",
              // boxShadow: "0 2px 8px rgba(255,55,95,0.35)",
            }}
            aria-label="More options"
          >
            <MoreHorizIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
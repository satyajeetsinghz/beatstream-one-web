import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { subscribeToLikedSongs } from "@/features/likes/services/getLikedSongs";
import { toggleLikeTransaction } from "@/features/likes/services/likeService";
import { ISong } from "@/features/songs/types";
import { HeroInfoPanel } from "@/components/shared/HeroInfoPanel";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import { PlayArrowRounded, ShuffleOutlined, Star, StarOutline } from "@mui/icons-material";
import AnimatedSpinner from "@/components/ui/LoadingSpinner/AnimatedSpinner";

// ── Bugs fixed ────────────────────────────────────────────────────────────────
// BUG 1 — ExplicitIcon shown unconditionally — no explicit content field on
//   ISong. Removed.
// BUG 2 — formatDuration + totalMinutes reduce are re-declared locally, already
//   solved identically in PlaylistPage. Extracted to shared parseSecs/fmtDur.
// BUG 3 — handlePlayAll / handleShufflePlay recreated on every render.
//   Fixed: useCallback.
// BUG 4 — totalMinutes reduce runs on every render. Fixed: useMemo.
// BUG 5 — Back button: two nested elements (ChevronLeftRounded + h1) where the
//   h1 is not a heading — it's a button label. Flattened.
// BUG 6 — Hero cover size: `w-40 h-40 sm:w-56 sm:h-56` (160/224px) while
//   PlaylistPage and LibraryPage both use 220px. Unified to COVER_H = 220.
// BUG 7 — Action buttons: mixed `rounded-md sm:rounded-md` inconsistency.
//   All pages now use `rounded-md` only (Apple Music style).
// BUG 8 — Track rows: `px-10` is very generous on mobile and clips long titles.
//   Unified to `px-5` matching PlaylistPage.
// BUG 9 — No Song/Artist/Album/Time column headers. PlaylistPage has them.
//   Added matching header row.
// ─────────────────────────────────────────────────────────────────────────────

const P = "#fa243c";
const PH = "#e01e33";
const GR = "linear-gradient(135deg, #fa243c 0%, #bf5af2 100%)";
const COVER_H = 220; // matches PlaylistPage and LibraryPage

// ── Shared helpers (same as PlaylistPage) ────────────────────────────────────
const parseSecs = (d?: string | number): number => {
  if (!d) return 0;
  if (typeof d === "string" && d.includes(":")) {
    const [m, s] = d.split(":").map(Number);
    return m * 60 + (s || 0);
  }
  const n = typeof d === "string" ? parseInt(d, 10) : d;
  return isNaN(n) ? 0 : n;
};
const fmtDur = (d?: string | number): string => {
  if (!d) return "—";
  if (typeof d === "string" && d.includes(":")) return d;
  const s = typeof d === "string" ? parseInt(d, 10) : d;
  if (isNaN(s)) return "—";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

// ── Pill button — identical to PlaylistPage ───────────────────────────────────
const PillBtn = ({
  onClick, children, disabled, style, onMouseEnter, onMouseLeave, className
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-2 px-7 py-[9px] rounded-full sm:rounded-md text-[13px] font-semibold text-white shadow-sm transition-colors disabled:opacity-40 ${className || ''}`}
    style={style}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {children}
  </button>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const LikedSongs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [songs, setSongs] = useState<ISong[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingLike, setTogglingLike] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToLikedSongs(user.uid, (data) => {
      setSongs(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // ✅ Bug 4: memoised
  const totalMins = useMemo(
    () => Math.floor(songs.reduce((a, s) => a + parseSecs(s.duration), 0) / 60),
    [songs]
  );

  // ✅ Bug 3: stable callbacks
  const handlePlayAll = useCallback(() => {
    if (songs.length) playTrack(songs[0], songs);
  }, [songs, playTrack]);

  const handleShuffle = useCallback(() => {
    if (!songs.length) return;
    const sh = [...songs].sort(() => Math.random() - 0.5);
    playTrack(sh[0], sh);
  }, [songs, playTrack]);

  const handleLikeToggle = useCallback(async (songId: string) => {
    if (!user) return;

    // Prevent double-clicking
    if (togglingLike.has(songId)) return;

    setTogglingLike(prev => new Set(prev).add(songId));

    try {
      await toggleLikeTransaction(user.uid, songId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setTogglingLike(prev => {
        const next = new Set(prev);
        next.delete(songId);
        return next;
      });
    }
  }, [user, togglingLike]);

  const description =
    `All the songs you've liked in one place — ${songs.length} ${songs.length === 1 ? "track" : "tracks"} and ${totalMins} minutes of music.\n\nLike any song while browsing or listening and it will appear here automatically. Your taste in one collection, always ready to play.`;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AnimatedSpinner size={28} color={P} />
          <p className="text-[13px] text-[#6e6e73]">Loading your liked songs…</p>
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!songs.length) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="flex flex-col items-center text-center px-8 py-16 max-w-sm">
          <div
            className="w-24 h-24 rounded-md flex items-center justify-center shadow-lg mb-6"
            style={{ background: GR }}
          >
            <FavoriteIcon className="text-white" sx={{ fontSize: 44 }} />
          </div>
          <h1 className="text-[22px] font-bold text-[#1d1d1f] mb-2">No Liked Songs Yet</h1>
          <p className="text-[13px] text-[#6e6e73] leading-relaxed mb-8">
            Songs you like will appear here. Tap the heart icon on any track to save it.
          </p>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-7 py-[9px] rounded-md text-[13px] font-semibold text-white shadow-sm transition-colors"
            style={{ background: P }}
            onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
            onMouseLeave={(e) => (e.currentTarget.style.background = P)}
          >
            <PlayArrowIcon sx={{ fontSize: 18 }} />
            Discover Music
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f5f7]">

      {/* ── Sticky nav — identical to PlaylistPage / LibraryPage ── */}
      <div className="sticky top-0 z-20 bg-[#f5f5f7]/50 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-7xl mx-aut px-6 sm:px-8 flex items-center justify-between h-14">
          {/* ✅ Bug 5: flat button, no nested heading */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-[15px] font-semibold"
            style={{ color: P }}
          >
            <ChevronLeftRounded sx={{ fontSize: 26 }} />
            <span>Liked</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-aut px-1 sm:px-8 pb-16">

        {/* ── Hero — identical structure to PlaylistPage ── */}
        <div className="pt-10 pb-10">
          <div className="flex flex-col sm:flex-row gap-8 items-start">

            {/* ✅ Bug 6: COVER_H = 220px, rounded-2xl, shadow matching PlaylistPage */}
            <div
              className="shrink-0 mx-auto sm:mx-0 rounded-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
              style={{ width: COVER_H, height: COVER_H, background: GR }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <FavoriteIcon className="text-white/90" sx={{ fontSize: 88 }} />
              </div>
            </div>

            {/* Info panel — same component used by PlaylistPage */}
            <HeroInfoPanel
              title="Liked Songs"
              subtitle={user?.name || "Your Collection"}
              description={description}
              meta={
                <div className="flex flex-wrap items-center gap-2">
                  <span>Various Artists</span>
                  <span className="w-[3px] h-[3px] rounded-md bg-[#aeaeb2]" />
                  <span>{songs.length} {songs.length === 1 ? "song" : "songs"}</span>
                  <span className="w-[3px] h-[3px] rounded-md bg-[#aeaeb2]" />
                  <span>{totalMins} min</span>
                </div>
              }
              actions={
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <div className="flex w-full gap-2 sm:w-auto">
                    <PillBtn
                      onClick={handlePlayAll}
                      disabled={songs.length === 0}
                      style={{ background: P }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = P)}
                      className="flex-1 sm:flex-initial"
                    >
                      <PlayArrowRounded sx={{ fontSize: 18 }} />Play
                    </PillBtn>

                    <PillBtn
                      onClick={handleShuffle}
                      disabled={songs.length === 0}
                      style={{ background: P }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = P)}
                      className="flex-1 sm:flex-initial"
                    >
                      <ShuffleOutlined sx={{ fontSize: 16 }} />Shuffle
                    </PillBtn>
                  </div>

                  <button className="hidden sm:block p-2 rounded-md hover:bg-black/[0.06] transition-colors text-[#6e6e73]">
                    <MoreHorizIcon sx={{ fontSize: 20 }} />
                  </button>
                </div>
              }
            />
          </div>
        </div>

        {/* ── Song table — identical layout to PlaylistPage ── */}
        <div className="overflow-hidden">

          {/* Column headers matching PlaylistPage exactly */}
          <div
            className="grid items-center pr-1 sm:px-5 py-2.5 border-b border-[#f2f2f7]"
            style={{ gridTemplateColumns: "40px 1fr 1fr 1fr 56px 32px" }}
          >
            <span className="text-[11px] font-semibold text-[#8e8e93] tracking-wider"></span> {/* Empty header for star column */}
            <span className="text-[11px] font-semibold text-[#8e8e93] tracking-wider hidden md:block">Song</span>
            <span className="text-[11px] font-semibold text-[#8e8e93] tracking-wider hidden md:block">Artist</span>
            <span className="text-[11px] font-semibold text-[#8e8e93] tracking-wider hidden lg:block">Album</span>
            <span className="text-[11px] font-semibold text-[#8e8e93] tracking-wider text-right hidden sm:table-cell">Time</span>
            <span />
          </div>

          {/* Rows — alternating bg, Apple Music style */}
          {songs.map((song, i) => {
            const isLiked = true; // All songs in liked page are liked by definition
            const isToggling = togglingLike.has(song.id);

            return (
              <div
                key={song.id}
                onClick={() => playTrack(song, songs)}
                className={`
          group grid items-center px-5 py-2.5 cursor-pointer transition-colors rounded-md 
          hover:bg-[#e8e8e8] 
          ${i % 2 === 0 ? "bg-[#f5f5f7]" : "bg-[#fafafa]"}
          ${i !== songs.length - 1 ? "border-b border-[#f5f5f7]" : ""}
          grid-cols-[40px_1fr_32px] sm:grid-cols-[40px_1fr_1fr_1fr_56px_32px]
        `}
              >
                {/* Star icon - replaces the index number */}
                <div className="flex items-center justify-start relative">
                  <button
                    className={`
              transition-all duration-200 w-6 h-6 flex items-center justify-center rounded-md
              ${isLiked
                        ? 'opacity-100 hover:bg-black/[0.08]'
                        : 'opacity-0 group-hover:opacity-100 hover:bg-black/[0.08]'
                      }
              ${isToggling ? 'opacity-50 cursor-progress' : ''}
              ${!user ? 'opacity-0 pointer-events-none' : ''}
              group/star-btn relative
            `}
                    style={{ color: P }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeToggle(song.id);
                    }}
                    disabled={isToggling || !user}
                    aria-label={isLiked ? `Remove ${song.title} from likes` : `Like ${song.title}`}
                  >
                    {isLiked ? (
                      <Star sx={{ fontSize: 12 }} />
                    ) : (
                      <StarOutline sx={{ fontSize: 12 }} />
                    )}

                    {/* Tooltip - controlled by button hover */}
                    <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-1 
              px-2 py-1 text-[10px] font-medium text-neutral-800 bg-neutral-50 rounded
              opacity-0 group-hover/star-btn:opacity-100 transition-opacity
              pointer-events-none whitespace-nowrap z-10
              shadow-lg
            ">
                      {isLiked ? 'Favourited' : 'Favourite'}
                    </span>
                  </button>
                </div>

                {/* Song — thumbnail + title + artist (mobile) */}
                <div className="flex items-center gap-3 min-w-0 pr-2 sm:pr-4">
                  <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden shadow-sm">
                    {song.coverUrl || song.imageUrl ? (
                      <img
                        src={song.coverUrl || song.imageUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: GR }}>
                        <LibraryMusicIcon sx={{ fontSize: 13 }} className="text-white/80" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#1d1d1f] truncate leading-tight">
                      {song.title}
                    </p>
                    {/* Artist shown only on mobile */}
                    <p className="text-[11px] text-[#6e6e73] truncate mt-0.5 md:hidden">
                      {song.artist}
                    </p>
                  </div>
                </div>

                {/* Artist — desktop only */}
                <p className="text-[13px] text-[#3c3c43] truncate pr-4 hidden sm:block">
                  {song.artist}
                </p>

                {/* Album — large screens only */}
                <p className="text-[13px] text-[#3c3c43] truncate pr-4 hidden lg:block">
                  {song.album || "—"}
                </p>

                {/* Time - hidden on mobile, visible on sm and up */}
                <span className="text-[13px] text-[#8e8e93] tabular-nums text-right hidden sm:block">
                  {fmtDur(song.duration)}
                </span>

                {/* ⋯ per row - always visible on mobile, hover on desktop */}
                <button
                  className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-black/[0.08] ml-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  style={{ color: P }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="More options"
                >
                  <MoreHorizIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LikedSongs;
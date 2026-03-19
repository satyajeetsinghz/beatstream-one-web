import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPlaylistById, subscribeToPlaylistSongs,
  updatePlaylist, deletePlaylist,
  Playlist, PlaylistSong, playlistSongsToITracks,
} from "../services/playlistService";
import { HeroInfoPanel } from "@/components/shared/HeroInfoPanel";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import AnimatedSpinner from "@/components/ui/LoadingSpinner/AnimatedSpinner";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useClickOutside } from "@/features/playlists/hooks/useClickOutside";
import { useLikedSongs } from "@/features/likes/hooks/useLikedSongs";
import { toggleLikeTransaction } from "@/features/likes/services/likeService";
import { PlayArrowRounded, ShuffleOutlined, Star, StarOutline } from "@mui/icons-material";

const P = "#fa243c";
const PH = "#e01e33";
const GR = "linear-gradient(135deg, #fa243c 0%, #bf5af2 100%)";
const COVER_H = 220;

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

const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { user } = useAuth();
  const { likedSongs } = useLikedSongs();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<PlaylistSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [togglingLike, setTogglingLike] = useState<Set<string>>(new Set());

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef as React.RefObject<HTMLElement>, () => {
    setMenuOpen(false);
    setConfirmDelete(false);
  });

  useEffect(() => {
    if (!id) return;
    getPlaylistById(id).then((d) => { setPlaylist(d); setLoading(false); });
    return subscribeToPlaylistSongs(id, setSongs);
  }, [id]);

  // Create a Set of liked song IDs for quick lookup
  const likedSongIds = useMemo(() => {
    return new Set(likedSongs.map(song => song.id));
  }, [likedSongs]);

  const tracks = useMemo(() => playlistSongsToITracks(songs), [songs]);
  const totalMins = useMemo(() => Math.floor(songs.reduce((a, s) => a + parseSecs(s.duration), 0) / 60), [songs]);

  const handlePlayAll = useCallback(() => { if (tracks.length) playTrack(tracks[0], tracks); }, [tracks, playTrack]);
  const handleShuffle = useCallback(() => {
    if (!songs.length) return;
    const sh = playlistSongsToITracks([...songs].sort(() => Math.random() - 0.5));
    playTrack(sh[0], sh);
  }, [songs, playTrack]);
  const handleDelete = useCallback(async () => { if (!id) return; await deletePlaylist(id); navigate("/library"); }, [id, navigate]);
  const togglePublic = useCallback(async () => {
    if (!id || !playlist) return;
    await updatePlaylist(id, { isPublic: !playlist.isPublic });
    setPlaylist((p) => p ? { ...p, isPublic: !p.isPublic } : p);
    setMenuOpen(false);
  }, [id, playlist]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AnimatedSpinner size={28} color={P} />
          <p className="text-[13px] text-[#6e6e73]">Loading playlist…</p>
        </div>
      </div>
    );
  }
  if (!playlist) return null;

  const isOwner = user?.uid === playlist.userId;
  const createdDate = playlist.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }) ?? "";

  // Full description — uses playlist.description if set, else auto-generated
  const description = playlist.description ||
    `A collection of ${songs.length} ${songs.length === 1 ? "song" : "songs"}${user?.name ? ` curated by ${user.name}` : ""}.\n\nBuild this playlist by adding songs from your library and discover new music to keep it fresh. Play all tracks in order or shuffle for a different experience every time.`;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">

      {/* Sticky nav */}
      <div className="sticky top-0 z-20 bg-[#f5f5f7]/50 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-7xl mx-aut px-6 sm:px-8 flex items-center justify-between h-14">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-[15px] font-semibold"
            style={{ color: P }}>
            <ChevronLeftRounded sx={{ fontSize: 26 }} />
            <span>Playlist</span>
          </button>

          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-md hover:bg-black/[0.06] transition-colors"
                style={{ color: P }}>
                <MoreHorizIcon sx={{ fontSize: 22 }} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-black/[0.08] py-1.5 z-50 overflow-hidden">
                  <button onClick={togglePublic}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors text-left">
                    {playlist.isPublic
                      ? <><span>Make Private</span></>
                      : <><span>Make Public</span></>}
                  </button>
                  <div className="h-px bg-[#f2f2f7] my-1" />
                  {confirmDelete ? (
                    <div className="px-4 py-2.5 flex items-center gap-2">
                      <span className="text-[12px] font-medium flex-1" style={{ color: P }}>Delete?</span>
                      <button onClick={handleDelete}
                        className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-md"
                        style={{ background: P }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = P)}>Yes</button>
                      <button onClick={() => setConfirmDelete(false)}
                        className="text-[11px] font-semibold text-[#6e6e73] hover:text-[#1d1d1f]">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] hover:bg-red-50 text-left"
                      style={{ color: P }}>Delete Playlist</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-aut px-1 sm:px-8 pb-16">

        {/* ── Hero ── */}
        <div className="pt-10 pb-10">
          <div className="flex flex-col sm:flex-row gap-8 items-start">

            {/* Cover — fixed 220×220 */}
            <div
              className="shrink-0 mx-auto sm:mx-0 rounded-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
              style={{ width: COVER_H, height: COVER_H, background: GR }}
            >
              {playlist.coverURL ? (
                <img src={playlist.coverURL} alt={playlist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <LibraryMusicIcon className="text-white/80" sx={{ fontSize: 84 }} />
                </div>
              )}
            </div>

            {/* Info panel — height locked to COVER_H on desktop */}
            <HeroInfoPanel
              title={playlist.name}
              subtitle={isOwner ? "Your Playlist" : "Playlist"}
              description={description}
              meta={
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1">
                    {playlist.isPublic
                      ? <PublicIcon sx={{ fontSize: 12 }} className="text-[#aeaeb2]" />
                      : <LockIcon sx={{ fontSize: 12 }} className="text-[#aeaeb2]" />}
                    {playlist.isPublic ? "Public" : "Private"}
                  </span>
                  <span className="w-[3px] h-[3px] rounded-md bg-[#aeaeb2]" />
                  <span>{songs.length} {songs.length === 1 ? "song" : "songs"}</span>
                  <span className="w-[3px] h-[3px] rounded-md bg-[#aeaeb2]" />
                  <span>{totalMins} min</span>
                  {createdDate && (
                    <><span className="w-[3px] h-[3px] rounded-md bg-[#aeaeb2]" /><span>{createdDate}</span></>
                  )}
                </div>
              }
              actions={
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <div className="flex w-full gap-2 sm:w-auto">
                    <PillBtn
                      onClick={handlePlayAll}
                      disabled={songs.length === 0}
                      style={{ background: P }}
                      onMouseEnter={(e) => { if (songs.length > 0) e.currentTarget.style.background = PH; }}
                      onMouseLeave={(e) => (e.currentTarget.style.background = P)}
                      className="flex-1 sm:flex-initial"
                    >
                      <PlayArrowRounded sx={{ fontSize: 18 }} />Play
                    </PillBtn>

                    <PillBtn
                      onClick={handleShuffle}
                      disabled={songs.length === 0}
                      style={{ background: P }}
                      onMouseEnter={(e) => { if (songs.length > 0) e.currentTarget.style.background = PH; }}
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

        {/* ── Song table — Apple Music columns: Song / Artist / Album / Time ── */}
        {songs.length > 0 ? (
          <div className="overflow-hidden">

            {/* Column headers */}
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
              const isLiked = likedSongIds.has(song.id);
              const isToggling = togglingLike.has(song.id);

              return (
                <div
                  key={song.id}
                  onClick={() => playTrack(tracks[i], tracks)}
                  className={`
    group grid items-center pr-1 sm:px-5 py-2.5 cursor-pointer transition-colors rounded-md 
    hover:bg-[#e8e8e8] 
    ${i % 2 === 0 ? "bg-[#f5f5f7]" : "bg-[#fafafa]"}
    ${i !== songs.length - 1 ? "border-b border-[#f5f5f7]" : ""}
    grid-cols-[25px_1fr_40px] sm:grid-cols-[40px_1fr_1fr_1fr_56px_32px]
  `}
                >
                  {/* Star icon - replaces the index number */}
                  {/* Star icon - replaces the index number */}
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
      absolute left-1/2 -translate-x-[15%] sm:-translate-x-1/2 bottom-full mb-1 
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
                        <img src={song.coverUrl || song.imageUrl} alt={song.title}
                          className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: GR }}>
                          <LibraryMusicIcon sx={{ fontSize: 13 }} className="text-white/80" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1"> {/* Removed max-w-36, added flex-1 */}
                      <p className="text-[13px] font-semibold text-[#1d1d1f] truncate leading-tight">{song.title}</p>
                      {/* Artist shown below title only on mobile */}
                      <p className="text-[11px] text-[#6e6e73] truncate mt-0.5 md:hidden">{song.artist}</p>
                    </div>
                  </div>

                  {/* Artist — desktop only */}
                  <p className="text-[13px] text-[#3c3c43] truncate pr-4 hidden sm:block">{song.artist}</p>

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
        ) : (
          <div className="flex flex-col items-center py-20 text-center bg-white rounded-md border border-black/[0.05] shadow-sm">
            <div className="w-20 h-20 rounded-md bg-[#f5f5f7] flex items-center justify-center mb-5">
              <LibraryMusicIcon sx={{ fontSize: 36 }} className="text-[#c7c7cc]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1.5">No songs yet</h3>
            <p className="text-[13px] text-[#6e6e73]">Add songs to this playlist from the home screen</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
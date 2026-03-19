import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserPlaylists }  from "@/features/playlists/hooks/useUserPlaylist";
import { useLikedSongs }     from "@/features/likes/hooks/useLikedSongs";
import { useAuth }           from "@/features/auth/hooks/useAuth";
import { useProfile }        from "@/features/profile/hooks/useProfile";
import CreatePlaylistModal   from "@/features/playlists/components/CreatePlaylistModal";
import { HeroInfoPanel }     from "@/components/shared/HeroInfoPanel";
import LibraryMusicIcon        from "@mui/icons-material/LibraryMusic";
import FavoriteRoundedIcon     from "@mui/icons-material/FavoriteRounded";
import AddRoundedIcon          from "@mui/icons-material/AddRounded";
import ChevronLeftRoundedIcon  from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import GridViewRoundedIcon     from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon     from "@mui/icons-material/ViewListRounded";
import MoreHorizIcon           from "@mui/icons-material/MoreHoriz";
import AnimatedSpinner         from "@/components/ui/LoadingSpinner/AnimatedSpinner";

const P  = "#fa243c";
const PH = "#e01e33";
const GR = "linear-gradient(135deg, #fa243c 0%, #bf5af2 100%)";
const COVER_H = 220;

const Sk = ({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-md animate-pulse bg-gray-200`} />
);

const PillBtn = ({
  onClick, children, style, onMouseEnter, onMouseLeave,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    onClick={onClick}
    className="hidden sm:block flex items-center gap-2 px-7 py-[9px] rounded-md text-[13px] font-semibold text-white shadow-sm transition-colors"
    style={style}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {children}
  </button>
);

const LibraryPage = () => {
  const { playlists, loading: pL } = useUserPlaylists();
  const { likedSongs, loading: lL } = useLikedSongs();
  const { user }    = useAuth();
  const { profile } = useProfile();
  const navigate    = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const likedCount  = likedSongs?.length ?? 0;
  const displayName = profile?.name || user?.name || "You";
  const openModal   = useCallback(() => setShowModal(true),  []);
  const closeModal  = useCallback(() => setShowModal(false), []);

  const dates = useMemo(() => {
    const m = new Map<string, string | null>();
    playlists.forEach((p) => {
      try {
        const d = p.createdAt?.toDate?.() ?? new Date(p.createdAt);
        m.set(p.id, d.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
      } catch { m.set(p.id, null); }
    });
    return m;
  }, [playlists]);

  // Full description text for the modal
  const description =
    `Your personal music collection containing ${playlists.length} ${playlists.length === 1 ? "playlist" : "playlists"} and ${likedCount} liked ${likedCount === 1 ? "song" : "songs"}.\n\nOrganise your favourite tracks into playlists, save songs you love, and keep everything in one place. Your library grows with you — add new playlists any time to keep your music organised the way you like it.`;

  return (
    <div className="min-h-screen bg-[#f5f5f7]/50 backdrop-blur-md">

      {/* Sticky nav */}
      <div className="sticky top-0 z-20 bg-[#f5f5f7]/50 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-7xl mx-aut px-6 sm:px-8 flex items-center justify-between h-14">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-[15px] font-semibold"
            style={{ color: P }}>
            <ChevronLeftRoundedIcon sx={{ fontSize: 26 }} />
            <span>Library</span>
          </button>
          <button onClick={openModal}
            className="flex items-center gap-1 text-[13px] font-semibold transition-colors"
            style={{ color: P }}
            onMouseEnter={(e) => (e.currentTarget.style.color = PH)}
            onMouseLeave={(e) => (e.currentTarget.style.color = P)}>
            <AddRoundedIcon sx={{ fontSize: 18 }} />
            New Playlist
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-aut px-6 sm:px-8 pb-16">

        {/* ── Hero ── */}
        <div className="pt-10 pb-10">
          <div className="flex flex-col sm:flex-row gap-8 items-start">

            {/* Cover — fixed 220×220 */}
            <div
              className="shrink-0 mx-auto sm:mx-0 rounded-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
              style={{ width: COVER_H, height: COVER_H, background: GR }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <LibraryMusicIcon className="text-white/80" sx={{ fontSize: 84 }} />
              </div>
            </div>

            {/* Info panel — height locked to COVER_H on desktop */}
            <HeroInfoPanel
              title="Your Library"
              subtitle={displayName}
              description={description}
              meta={
                <div className="flex items-center gap-2">
                  <span>{playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}</span>
                  <span className="w-[3px] h-[3px] rounded-md bg-[#aeaeb2]" />
                  <span>{likedCount} liked {likedCount === 1 ? "song" : "songs"}</span>
                </div>
              }
              actions={
                <>
                  <PillBtn
                    onClick={openModal}
                    style={{ background: P }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = P)}
                  >
                    <AddRoundedIcon sx={{ fontSize: 16 }} />
                    New Playlist
                  </PillBtn>
                  <button className="hidden p-2 rounded-md hover:bg-black/[0.06] transition-colors text-[#6e6e73]">
                    <MoreHorizIcon sx={{ fontSize: 20 }} />
                  </button>
                </>
              }
            />
          </div>
        </div>

        {/* Liked Songs */}
        <div className="mb-8">
          <Link to="/liked"
            className="flex items-center gap-4 px-5 py-4 rounded-md bg-white hover:bg-[#f0f0f0] transition-colors shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.05] group">
            <div className="w-[52px] h-[52px] rounded-md shrink-0 flex items-center justify-center" style={{ background: GR }}>
              <FavoriteRoundedIcon className="text-white" sx={{ fontSize: 24 }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#1d1d1f]">Liked Songs</p>
              <p className="text-[12px] text-[#6e6e73] mt-0.5">
                {lL ? <AnimatedSpinner size={13} color={P} /> : `${likedCount} ${likedCount === 1 ? "song" : "songs"}`}
              </p>
            </div>
            <ChevronRightRoundedIcon className="text-[#c7c7cc] group-hover:text-[#aeaeb2] shrink-0" sx={{ fontSize: 20 }} />
          </Link>
        </div>

        {/* Playlists header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-[#1d1d1f]">Playlists</h2>
          <div className="flex items-center gap-0.5 bg-[#e5e5ea] rounded-md p-[3px]">
            {(["grid", "list"] as const).map((m) => (
              <button key={m} onClick={() => setView(m)}
                className={`px-2 py-1.5 rounded-md transition-colors ${view === m ? "bg-white shadow-sm" : "hover:bg-[#d1d1d6]"}`}>
                {m === "grid"
                  ? <GridViewRoundedIcon sx={{ fontSize: 15 }} className={view === "grid" ? "text-[#1d1d1f]" : "text-[#8e8e93]"} />
                  : <ViewListRoundedIcon sx={{ fontSize: 15 }} className={view === "list" ? "text-[#1d1d1f]" : "text-[#8e8e93]"} />}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {pL && (view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}><Sk w="w-full" h="aspect-square mb-2.5" /><Sk w="w-3/4" h="h-[13px] mb-1.5" /><Sk w="w-1/2" h="h-[11px]" /></div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-md overflow-hidden border border-black/[0.05]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse border-b border-[#f2f2f7] last:border-0">
                <Sk w="w-11" h="h-11 shrink-0" /><div className="flex-1"><Sk w="w-2/3" h="h-[13px] mb-1.5" /><Sk w="w-1/3" h="h-[11px]" /></div>
              </div>
            ))}
          </div>
        ))}

        {/* Empty */}
        {!pL && playlists.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center bg-white rounded-md border border-black/[0.05] shadow-sm">
            <div className="w-20 h-20 rounded-md bg-[#f5f5f7] flex items-center justify-center mb-5">
              <LibraryMusicIcon sx={{ fontSize: 36 }} className="text-[#c7c7cc]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1.5">No playlists yet</h3>
            <p className="text-[13px] text-[#6e6e73] mb-6 max-w-[220px]">Create your first playlist to organise your music</p>
            <button onClick={openModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md text-[13px] font-semibold text-white shadow-sm transition-colors"
              style={{ background: P }}
              onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
              onMouseLeave={(e) => (e.currentTarget.style.background = P)}>
              <AddRoundedIcon sx={{ fontSize: 16 }} />New Playlist
            </button>
          </div>
        )}

        {/* Grid */}
        {!pL && playlists.length > 0 && view === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {playlists.map((p) => (
              <Link key={p.id} to={`/playlist/${p.id}`} className="group">
                <div className="aspect-square w-full mb-2.5 rounded-md overflow-hidden shadow-md transition-all duration-200 group-hover:brightness-90 group-hover:shadow-lg">
                  {p.coverURL
                    ? <img src={p.coverURL} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: GR }}>
                        <LibraryMusicIcon className="text-white/80" sx={{ fontSize: { xs: 36, sm: 48 } }} />
                      </div>}
                </div>
                <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">{p.name}</p>
                <p className="text-[11px] text-[#6e6e73] mt-0.5">{p.songCount ?? 0} {p.songCount === 1 ? "song" : "songs"}</p>
              </Link>
            ))}
          </div>
        )}

        {/* List */}
        {!pL && playlists.length > 0 && view === "list" && (
          <div className="bg-white rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.05] overflow-hidden">
            {playlists.map((p, i) => (
              <Link key={p.id} to={`/playlist/${p.id}`}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#f5f5f7] group ${i !== playlists.length - 1 ? "border-b border-[#f2f2f7]" : ""}`}>
                <div className="w-11 h-11 shrink-0 rounded-md overflow-hidden shadow-sm">
                  {p.coverURL
                    ? <img src={p.coverURL} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: GR }}>
                        <LibraryMusicIcon sx={{ fontSize: 16 }} className="text-white/80" />
                      </div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1d1d1f] truncate">{p.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#6e6e73]">
                    <span>{p.songCount ?? 0} {p.songCount === 1 ? "song" : "songs"}</span>
                    {dates.get(p.id) && <><span className="w-[3px] h-[3px] rounded-md bg-[#c7c7cc]" /><span>{dates.get(p.id)}</span></>}
                    {p.isPublic === false && <><span className="w-[3px] h-[3px] rounded-md bg-[#c7c7cc]" /><span>Private</span></>}
                  </div>
                </div>
                <ChevronRightRoundedIcon className="text-[#c7c7cc] group-hover:text-[#aeaeb2] shrink-0" sx={{ fontSize: 18 }} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreatePlaylistModal open={showModal} onClose={closeModal} />
    </div>
  );
};

export default LibraryPage;
import { ISong } from "../types";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useLike } from "@/features/likes/hooks/useLike";
import { usePlaylists } from "@/features/playlists/hooks/usePlaylists";
import { addSongToPlaylist } from "@/features/playlists/services/playlistService";
import { useRef, useState, useEffect, useCallback, memo } from "react";
import { createPortal } from "react-dom";

// ─── MUI Icons ────────────────────────────────────────────────────────────────
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import ShareIcon from "@mui/icons-material/Share";
import CheckIcon from "@mui/icons-material/Check";
// import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import { color } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
    track: ISong;
    songs: ISong[];
    variant?: "default" | "compact" | "playlist";
    index?: number;
    disableLike?: boolean;
}

// ─── Shared: Menu Row ─────────────────────────────────────────────────────────
interface MenuRowProps {
    icon: React.ReactNode;
    iconCls?: string;
    label: string;
    right?: React.ReactNode;
    onClick: () => void;
}

const MenuRowLight = memo(({ icon, iconCls = "", label, right, onClick }: MenuRowProps) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2.5 w-full px-3 py-[9px] hover:bg-gray-50 active:bg-gray-100 transition-colors duration-100 text-left"
    >
        <span className={`flex items-center shrink-0 ${iconCls}`}>{icon}</span>
        <span className="flex-1 text-[13px] text-gray-700 tracking-[-0.1px]">{label}</span>
        {right && <span className="text-gray-300 flex items-center">{right}</span>}
    </button>
));

MenuRowLight.displayName = 'MenuRowLight';

// ─── Shared: Context Menu ─────────────────────────────────────────────────────
interface ContextMenuProps {
    track: ISong;
    isLiked: boolean;
    onToggleLike: () => void;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    disableLike: boolean;
}

const ContextMenu = memo(({
    track,
    isLiked,
    onToggleLike,
    onClose,
    anchorRef,
    disableLike,
}: ContextMenuProps) => {
    const { playlists } = usePlaylists();
    const [activeMenu, setActiveMenu] = useState<"main" | "playlists">("main");
    const [addedId, setAddedId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, left: 0, ready: false });

    // Position menu next to anchor button with mobile awareness
    useEffect(() => {
        // Don't run if no anchor or menu refs
        if (!anchorRef.current || !menuRef.current) return;

        // Use requestAnimationFrame to avoid synchronous setState
        const updatePosition = () => {
            if (!anchorRef.current || !menuRef.current) return;

            const btn = anchorRef.current.getBoundingClientRect();
            const menu = menuRef.current.getBoundingClientRect();
            const mw = menu.width;
            const mh = menu.height;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Default position (right side)
            let left = btn.right + 8;
            let top = btn.top;

            // Check if menu would go off-screen on the right
            if (left + mw > vw - 8) {
                // Try left side
                left = btn.left - mw - 8;

                // If left also goes off-screen, center horizontally
                if (left < 8) {
                    left = Math.max(8, (vw - mw) / 2);
                }
            }

            // Adjust vertical position if needed
            if (top + mh > vh - 8) {
                top = vh - mh - 8;
            }
            if (top < 8) {
                top = 8;
            }

            setPos({ top, left, ready: true });
        };

        // Small delay to ensure menu is rendered before measuring
        const timer = setTimeout(updatePosition, 10);

        return () => clearTimeout(timer);
    }, [anchorRef, activeMenu]);

    // Close on scroll or resize
    useEffect(() => {
        if (!pos.ready) return;

        const handleClose = () => onClose();

        window.addEventListener("scroll", handleClose, true);
        window.addEventListener("resize", handleClose);

        return () => {
            window.removeEventListener("scroll", handleClose, true);
            window.removeEventListener("resize", handleClose);
        };
    }, [onClose, pos.ready]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current?.contains(e.target as Node)) return;
            if (anchorRef.current?.contains(e.target as Node)) return;
            onClose();
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose, anchorRef]);

    const handleAddToPlaylist = useCallback(
        async (playlistId: string) => {
            try {
                setAddedId(playlistId);
                await addSongToPlaylist(playlistId, track);
                setTimeout(() => {
                    setAddedId(null);
                    onClose();
                }, 750);
            } catch (error) {
                console.error("Failed to add song to playlist:", error);
                setAddedId(null);
            }
        },
        [track, onClose]
    );

    return createPortal(
        <>
            <style>{`
                @keyframes menuPop {
                    from { opacity: 0; transform: scale(0.88) translateY(-6px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(12px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideBack {
                    from { opacity: 0; transform: translateX(-12px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            <div
                ref={menuRef}
                className="fixed z-[9999] rounded-xl overflow-hidden"
                style={{
                    width: Math.min(232, window.innerWidth - 32),
                    top: pos.top,
                    left: pos.left,
                    opacity: pos.ready ? 1 : 0,
                    background: "rgba(255,255,255,0.98)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12), 0 1px 8px rgba(0,0,0,0.04)",
                    transition: "opacity 0.2s ease",
                }}
            >
                {/* Mini track header */}
                <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-200/60">
                    <img
                        src={track.coverUrl || "/default-album.jpg"}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
                    />
                    <div className="overflow-hidden">
                        <p className="text-[13px] font-semibold text-gray-800 truncate tracking-[-0.1px]">
                            {track.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{track.artist}</p>
                    </div>
                </div>

                {/* Main menu */}
                {activeMenu === "main" && (
                    <div className="py-1" style={{ animation: pos.ready ? "slideIn 0.15s ease" : "none" }}>
                        <MenuRowLight
                            icon={<PlaylistAddIcon sx={{ fontSize: 16 }} />}
                            iconCls="text-[#ff375f]"
                            label="Add to Playlist"
                            right={<ChevronRightIcon sx={{ fontSize: 14 }} />}
                            onClick={() => setActiveMenu("playlists")}
                        />

                        {!disableLike && (
                            <MenuRowLight
                                icon={
                                    isLiked ? (
                                        <FavoriteIcon sx={{ fontSize: 15 }} />
                                    ) : (
                                        <FavoriteBorderIcon sx={{ fontSize: 15 }} />
                                    )
                                }
                                iconCls={isLiked ? "text-[#ff375f]" : "text-gray-400"}
                                label={isLiked ? "Remove from Favorites" : "Add to Favorites"}
                                onClick={() => { onToggleLike(); onClose(); }}
                            />
                        )}

                        {/* <div className="h-px bg-gray-100 my-1" />

                        <MenuRowLight
                            icon={<ShareIcon sx={{ fontSize: 15 }} />}
                            iconCls="text-gray-500"
                            label="Share Song"
                            onClick={onClose}
                        />
                        <MenuRowLight
                            icon={<PersonIcon sx={{ fontSize: 15 }} />}
                            iconCls="text-gray-500"
                            label="Go to Artist"
                            onClick={onClose}
                        /> */}
                    </div>
                )}

                {/* Playlists submenu */}
                {activeMenu === "playlists" && (
                    <div className="py-1" style={{ animation: pos.ready ? "slideBack 0.15s ease" : "none" }}>
                        <button
                            onClick={() => setActiveMenu("main")}
                            className="flex items-center gap-1.5 w-full px-3 py-2 text-[12.5px] text-[#ff375f] hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeftIcon sx={{ fontSize: 14 }} />
                            <span>Back</span>
                        </button>
                        <div className="h-px bg-gray-100 my-1" />

                        {playlists.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-5 text-gray-300">
                                <LibraryMusicIcon sx={{ fontSize: 22, color: '#d1d5db' }} />
                                <p className="text-[12px] text-gray-400">No playlists yet</p>
                            </div>
                        ) : (
                            <div className="max-h-52 overflow-y-auto">
                                {playlists.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleAddToPlaylist(p.id)}
                                        className="flex items-center gap-2.5 w-full px-3 py-[9px] hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                            <LibraryMusicIcon sx={{ fontSize: 13 }} />
                                        </span>
                                        <span className="flex-1 text-[13px] text-gray-700 text-left truncate">
                                            {p.name}
                                        </span>
                                        {addedId === p.id ? (
                                            <span className="text-[#ff375f]">
                                                <CheckIcon sx={{ fontSize: 14 }} />
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-gray-400">
                                                {p.songCount ?? 0}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="h-px bg-gray-100 my-1" />
                        <button
                            onClick={() => { onClose(); setActiveMenu("main"); }}
                            className="flex items-center gap-2.5 w-full px-3 py-[9px] text-[#ff375f] text-[13px] hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-[18px] leading-none">+</span>
                            <span>New Playlist</span>
                        </button>
                    </div>
                )}
            </div>
        </>,
        document.body
    );
});

ContextMenu.displayName = 'ContextMenu';

// ─── Shared: Equalizer Bars ───────────────────────────────────────────────────
const EqBars = memo(() => (
    <div className="flex items-end gap-px h-3.5">
        {[0, 1, 2].map((i) => (
            <div
                key={i}
                className="w-[3px] rounded-sm bg-[#ff375f] animate-eqBar"
                style={{ animationDelay: `${i * 0.15}s` }}
            />
        ))}
        <style>{`
            @keyframes eqBar {
                0%, 100% { height: 25%; }
                50% { height: 100%; }
            }
            .animate-eqBar {
                animation: eqBar 0.7s ease-in-out infinite alternate;
            }
        `}</style>
    </div>
));

EqBars.displayName = 'EqBars';

// ─── Main Component ───────────────────────────────────────────────────────────
const SongCard = memo(({
    track,
    songs,
    variant = "default",
    index,
    disableLike = false,
}: Props) => {
    const { playTrack } = usePlayer();
    const { isLiked, toggleLike } = useLike(track.id);
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const moreButtonRef = useRef<HTMLButtonElement>(null);

    const handlePlay = useCallback(() => {
        playTrack(track, songs);
    }, [playTrack, track, songs]);

    const active = isHovered || isMenuOpen;

    // ── Variant: default (Grid View) - Apple Music Style ─────────────────────
    if (variant === 'default') {
        return (
            <div
                className="relative w-[140px] sm:w-[172px] select-none"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Album art container */}
                <div
                    className="relative w-[140px] h-[140px] sm:w-[172px] sm:h-[172px] rounded-md overflow-hidden cursor-pointer"

                >
                    <img
                        src={track.coverUrl || "/default-album.jpg"}
                        alt={track.title}
                        className="w-full h-full object-cover block"
                        loading="lazy"
                        style={{
                            boxShadow: active
                                ? "0 20px 32px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)"
                                : "0 8px 20px rgba(0,0,0,0.1)",
                            // transform: active ? "scale(1.02)" : "scale(1)",
                            // transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        }}
                    />

                    {/* Hover overlay - subtle darken */}
                    <div
                        className="absolute inset-0 bg-black/30 transition-opacity duration-200"
                        style={{ opacity: active ? 1 : 0 }}
                    />

                    {/* Play button - positioned at left bottom */}
                    <button
                        onClick={handlePlay}
                        className="absolute bottom-2.5 sm:bottom-1.5 left-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                        style={{
                            opacity: active ? 1 : 0,
                            transform: `translateY(${active ? 0 : '8px'})`,
                            transition: "opacity 0.2s ease, transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2)",
                        }}
                        aria-label="Play song"
                    >
                        <PlayCircleRoundedIcon
                            sx={{
                                fontSize: { xs: 28, sm: 34 },
                                color: '#fff',
                                transition: 'color 0.2s ease',
                                '&:hover': {
                                    color: '#ff375f' // Apple Music pink color
                                }
                            }}
                        />
                    </button>

                    {/* More options button - positioned at right bottom */}
                    <button
                        ref={moreButtonRef}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen((v) => !v);
                        }}
                        className="absolute bottom-3 sm:bottom-2 right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                        style={{
                            background: "rgba(28,28,30,0.8)",
                            backdropFilter: "blur(4px)",
                            WebkitBackdropFilter: "blur(4px)",
                            opacity: active ? 1 : 0,
                            transform: `translateY(${active ? 0 : '8px'})`,
                            transition: "opacity 0.2s ease, transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2)",
                            border: isMenuOpen ? "1px solid rgba(255,255,255,0.3)" : "none",
                        }}
                        aria-label="More options"
                    >
                        <MoreHorizIcon sx={{ fontSize: { xs: 14, sm: 18 }, color: 'white' }} />
                    </button>
                </div>

                {/* Track info - Apple Music typography */}
                <div className="mt-2 px-1">
                    <p className="text-[11px] sm:text-[13px] font-medium text-gray-900 truncate leading-tight">
                        {track.title}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 truncate mt-0.5">
                        {track.artist}
                    </p>
                </div>

                {/* Context menu */}
                {isMenuOpen && (
                    <ContextMenu
                        track={track}
                        isLiked={isLiked}
                        onToggleLike={toggleLike}
                        onClose={() => setIsMenuOpen(false)}
                        anchorRef={moreButtonRef}
                        disableLike={disableLike}
                    />
                )}
            </div>
        );
    }

    // ── Variant: compact ──────────────────────────────────────────────────────
    if (variant === "compact") {
        return (
            <div
                className="group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Thumbnail */}
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0">
                    <img
                        src={track.coverUrl || "/default-album.jpg"}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    {/* Play overlay */}
                    <div
                        className="absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity duration-150"
                        style={{ opacity: isHovered ? 1 : 0 }}
                    >
                        <button
                            onClick={handlePlay}
                            className="text-white"
                            style={{
                                transform: `scale(${isHovered ? 1 : 0.7})`,
                                transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                            }}
                            aria-label="Play song"
                        >
                            <PlayCircleRoundedIcon
                                sx={{
                                    fontSize: 34,
                                    color: '#fff',
                                    transition: 'color 0.2s ease',
                                    '&:hover': {
                                        color: '#ff375f' // Apple Music pink color
                                    }
                                }}
                            />
                        </button>
                    </div>
                </div>

                {/* Track info */}
                <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] sm:text-[13px] font-medium text-gray-900 truncate tracking-[-0.1px]">
                        {track.title}
                    </p>
                    <p className="text-[10px] sm:text-[11.5px] text-gray-500 truncate mt-0.5">{track.artist}</p>
                </div>

                {/* Like button */}
                {!disableLike && (
                    <button
                        onClick={toggleLike}
                        className="shrink-0 transition-all duration-150 p-1"
                        style={{
                            opacity: isHovered || isLiked ? 1 : 0,
                            transform: `scale(${isHovered || isLiked ? 1 : 0.8})`,
                            color: isLiked ? "#ff375f" : "rgba(156,163,175,0.6)",
                        }}
                        aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
                    >
                        {isLiked ? (
                            <FavoriteIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                        )}
                    </button>
                )}
            </div>
        );
    }

    // ── Variant: playlist ─────────────────────────────────────────────────────
    if (variant === "playlist") {
        return (
            <div
                className="group grid items-center gap-2 sm:gap-4 px-2 sm:px-4 py-2 rounded-xl transition-colors duration-150 hover:bg-gray-50 cursor-pointer"
                style={{ gridTemplateColumns: "24px 1fr 1fr 1fr auto" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Index / play toggle */}
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 shrink-0">
                    {isHovered ? (
                        <button
                            onClick={handlePlay}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="Play song"
                        >
                            <PlayCircleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </button>
                    ) : (
                        <span className="text-[11px] sm:text-[13px] text-gray-400 font-medium tabular-nums">
                            {index ?? "•"}
                        </span>
                    )}
                </div>

                {/* Cover + title + artist */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <div className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-md overflow-hidden shrink-0">
                        <img
                            src={track.coverUrl || "/default-album.jpg"}
                            alt={track.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[11px] sm:text-[13px] font-medium text-gray-900 truncate">
                            {track.title}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 truncate mt-0.5">{track.artist}</p>
                    </div>
                </div>

                {/* Artist column */}
                <p className="text-[11px] sm:text-[13px] text-gray-500 truncate px-1 sm:px-2 hidden sm:block">{track.artist}</p>

                {/* Album column */}
                <p className="text-[11px] sm:text-[13px] text-gray-500 truncate px-1 sm:px-2 hidden lg:block">{track.album ?? "—"}</p>

                {/* Duration + like */}
                <div className="flex items-center gap-1 sm:gap-3 justify-end">
                    {!disableLike && (
                        <button
                            onClick={toggleLike}
                            className="transition-all duration-150"
                            style={{
                                opacity: isHovered || isLiked ? 1 : 0,
                                transform: `scale(${isHovered || isLiked ? 1 : 0.8})`,
                                color: isLiked ? "#ff375f" : "rgba(156,163,175,0.5)",
                            }}
                            aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
                        >
                            {isLiked ? (
                                <FavoriteIcon sx={{ fontSize: { xs: 13, sm: 15 } }} />
                            ) : (
                                <FavoriteBorderIcon sx={{ fontSize: { xs: 13, sm: 15 } }} />
                            )}
                        </button>
                    )}
                    <div className="flex items-center gap-0.5 sm:gap-1 text-gray-400">
                        <AccessTimeIcon sx={{ fontSize: { xs: 10, sm: 12 } }} />
                        <span className="text-[9px] sm:text-[11px] tabular-nums">{track.duration ?? "3:45"}</span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
});

SongCard.displayName = 'SongCard';

export default SongCard;
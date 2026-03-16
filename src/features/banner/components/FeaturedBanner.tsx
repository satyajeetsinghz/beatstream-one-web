import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBanners } from "../hooks/useBanners";
import { useSongs } from "@/features/songs/hooks/useSongs";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useNavigate } from "react-router-dom";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useResponsive } from "@/components/layout/hooks/useResponsive";

// ─── Constants ────────────────────────────────────────────────────────────────
const SLIDE_INTERVAL_MS = 6000;

// ─── Sub-component: Progress Dot ─────────────────────────────────────────────
interface ProgressDotProps {
    index: number;
    isActive: boolean;
    isPaused: boolean;
    isMobile: boolean;
    isTablet: boolean;
    onClick: (index: number) => void;
}

const ProgressDot = ({
    index,
    isActive,
    isPaused,
    isMobile,
    isTablet,
    onClick,
}: ProgressDotProps) => {
    const activeWidth = isMobile ? 16 : isTablet ? 24 : 32;
    const inactiveWidth = isMobile ? 4 : 6;

    return (
        <motion.button
            onClick={() => onClick(index)}
            className="relative cursor-pointer group/dot"
            aria-label={`Go to slide ${index + 1}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
        >
            <motion.div
                className="rounded-full overflow-hidden"
                animate={{
                    backgroundColor: isActive ? "#fa243c" : "rgba(255,255,255,0.35)",
                    width: isActive ? activeWidth : inactiveWidth,
                    height: 4,
                }}
                transition={{ duration: 0.3 }}
            >
                {/* Progress fill — synced to the slide timer via component remount */}
                {isActive && (
                    <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: isPaused ? "0%" : "100%" }}
                        transition={{
                            duration: SLIDE_INTERVAL_MS / 1000,
                            ease: "linear",
                        }}
                    />
                )}
            </motion.div>

            {/* Tooltip — desktop only */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/70 backdrop-blur-md text-white text-xs rounded-lg opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none hidden sm:block">
                Slide {index + 1}
            </div>
        </motion.button>
    );
};

// ─── Sub-component: Nav Arrow ─────────────────────────────────────────────────
interface NavArrowProps {
    direction: "left" | "right";
    onClick: (e: React.MouseEvent) => void;
}

const NavArrow = ({ direction, onClick }: NavArrowProps) => (
    <motion.button
        whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.55)" }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center cursor-pointer"
        aria-label={direction === "left" ? "Previous slide" : "Next slide"}
    >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
            />
        </svg>
    </motion.button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const FeaturedBanner = () => {
    const { banners, loading } = useBanners(false);
    const { songs } = useSongs();
    const { playTrack } = usePlayer();
    const navigate = useNavigate();
    const { isMobile, isTablet } = useResponsive();

    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountedRef = useRef(true);


    // ── Cleanup on unmount ───────────────────────────────────────────────────
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // ── Interval management ───────────────────────────────────────────────────
    const clearSlideInterval = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startSlideInterval = useCallback(() => {
        clearSlideInterval();
        if (!banners.length || !mountedRef.current) return;

        intervalRef.current = setInterval(() => {
            if (mountedRef.current) {
                setCurrent((prev) => (prev + 1) % banners.length);
            }
        }, SLIDE_INTERVAL_MS);
    }, [banners.length, clearSlideInterval]);

    useEffect(() => {
        if (isPaused) {
            clearSlideInterval();
        } else {
            startSlideInterval();
        }

        return () => {
            clearSlideInterval();
        };
    }, [isPaused, startSlideInterval, clearSlideInterval]);

    // ── Clamp current index if banners shrink ─────────────────────────────────
    useEffect(() => {
        if (banners.length && current >= banners.length && mountedRef.current) {
            setCurrent(banners.length - 1);
        }
    }, [banners.length, current]);

    // ── Reset current when banners change ─────────────────────────────────────
    useEffect(() => {
        if (banners.length > 0 && mountedRef.current) {
            setCurrent(0);
        }
    }, [banners.length]);

    // ── Keyboard navigation ───────────────────────────────────────────────────
    useEffect(() => {
        if (!banners.length) return;

        const handler = (e: KeyboardEvent) => {
            if (!mountedRef.current) return;

            if (e.key === "ArrowLeft") {
                setCurrent((p) => (p - 1 + banners.length) % banners.length);
            } else if (e.key === "ArrowRight") {
                setCurrent((p) => (p + 1) % banners.length);
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [banners.length]);

    // ── Memoised song list ────────────────────────────────────────────────────
    const mappedSongs = useMemo(
        () =>
            songs.map((s) => ({
                id: s.id,
                title: s.title,
                artist: s.artist,
                audioUrl: s.audioUrl,
                coverUrl: s.coverUrl,
            })),
        [songs]
    );

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handlePlayClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            const banner = banners[current];
            if (!banner?.redirectType) return;

            switch (banner.redirectType) {
                case "song": {
                    const track = mappedSongs.find((s) => s.id === banner.redirectId);
                    if (!track) {
                        console.warn(`[FeaturedBanner] Song not found: ${banner.redirectId}`);
                        return;
                    }
                    playTrack(track, mappedSongs);
                    break;
                }
                case "artist":
                    navigate(`/artist/${banner.redirectId}`);
                    break;
                case "section":
                    navigate(`/section/${banner.redirectId}`);
                    break;
                default:
                    console.warn(`[FeaturedBanner] Unknown redirect type: ${banner.redirectType}`);
            }
        },
        [banners, current, mappedSongs, navigate, playTrack]
    );

    const handleLearnMoreClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            // TODO: wire to your actual destination
            console.info("[FeaturedBanner] Learn more:", banners[current]?.title);
        },
        [banners, current]
    );

    const goTo = useCallback(
        (index: number) => {
            if (!mountedRef.current) return;
            setCurrent(index);
            startSlideInterval(); // reset timer from the new slide
        },
        [startSlideInterval]
    );

    const goPrev = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!banners.length || !mountedRef.current) return;
            goTo((current - 1 + banners.length) % banners.length);
        },
        [current, banners.length, goTo]
    );

    const goNext = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!banners.length || !mountedRef.current) return;
            goTo((current + 1) % banners.length);
        },
        [current, banners.length, goTo]
    );

    // ── Early return ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="relative w-full h-[180px] sm:h-[260px] bg-gray-200 rounded-2xl mb-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-[#fa243c] rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading promotions...</p>
                </div>
            </div>
        );
    }

    if (!banners.length) {
        return (
            <div className="relative w-full h-[180px] sm:h-[260px] bg-gray-200 rounded-2xl mb-8 flex items-center justify-center">
                <p className="text-gray-500 font-semibold text-sm">No active promotions</p>
            </div>
        );
    }

    const banner = banners[current];
    if (!banner) return null;

    const bannerHeight = isMobile ? 200 : isTablet ? 250 : 300;
    const showControls = banners.length > 1;

    return (
        <div
            className="relative w-full overflow-hidden rounded-3xl mb-6 sm:mb-8 md:mb-12 group/banner"
            style={{ height: bannerHeight }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={banner.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {/* ── Media ── */}
                    {/* ── Media ── */}
                    <motion.div
                        className="absolute inset-0"
                        initial={{ scale: 1.06 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 5, ease: "easeOut" }}
                    >
                        {banner.mediaType === "video" && banner.mediaUrl ? (
                            <video
                                key={banner.id}
                                src={banner.mediaUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover pointer-events-none"
                                onError={(e) => {
                                    console.error("Video failed to load:", e);
                                    // Fallback to image
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <img
                                src={banner.imageUrl}
                                alt={banner.title}
                                loading="eager"
                                draggable={false}
                                className="w-full h-full object-cover pointer-events-none select-none"
                            />
                        )}
                    </motion.div>

                    {/* ── Gradients ── */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-transparent to-transparent pointer-events-none" />

                    {/* ── Content ── */}
                    <div className="absolute inset-0 flex items-end md:items-center px-4 sm:px-6 md:px-12 lg:px-16 pb-12 sm:pb-0">
                        <motion.div
                            className="max-w-lg sm:max-w-xl md:max-w-2xl text-white"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
                        >
                            {/* Badge */}
                            <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-semibold mb-2 sm:mb-3 tracking-wide uppercase select-none">
                                Featured
                            </span>

                            {/* Title */}
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1.5 sm:mb-2 md:mb-3 tracking-tight leading-tight line-clamp-2">
                                {banner.title}
                            </h1>

                            {/* Subtitle — single element, responsive classes only */}
                            {banner.subtitle && (
                                <p className="text-xs sm:text-sm md:text-base text-white/70 mb-4 sm:mb-5 max-w-md line-clamp-2">
                                    {banner.subtitle}
                                </p>
                            )}

                            {/* Buttons */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handlePlayClick}
                                    className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 bg-white text-gray-900 font-semibold rounded-full hover:bg-[#fa243c] hover:text-white transition-colors duration-200 shadow-lg text-xs sm:text-sm cursor-pointer select-none"
                                >
                                    <PlayCircleIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
                                    <span>{banner.buttonText || (isMobile ? "Play" : "Play Now")}</span>
                                </motion.button>

                                {!isMobile && (
                                    <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleLearnMoreClick}
                                        className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md text-white font-semibold rounded-full hover:bg-white/30 transition-colors duration-200 border border-white/15 text-xs sm:text-sm cursor-pointer select-none"
                                    >
                                        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                                        <span>Learn More</span>
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ── Progress dots ── */}
            {showControls && (
                <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-30">
                    {banners.map((_, index) => (
                        <ProgressDot
                            key={index}
                            index={index}
                            isActive={index === current}
                            isPaused={isPaused}
                            isMobile={isMobile}
                            isTablet={isTablet}
                            onClick={goTo}
                        />
                    ))}
                </div>
            )}

            {/* ── Nav arrows — desktop only ── */}
            {showControls && (
                <div className="hidden sm:flex absolute inset-0 items-center justify-between px-3 sm:px-4 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
                    <div className="pointer-events-auto">
                        <NavArrow direction="left" onClick={goPrev} />
                    </div>
                    <div className="pointer-events-auto">
                        <NavArrow direction="right" onClick={goNext} />
                    </div>
                </div>
            )}

            {/* ── Slide counter ── */}
            {showControls && (
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2.5 py-1 bg-black/30 backdrop-blur-md rounded-full text-[10px] sm:text-xs text-white/80 z-30 tabular-nums font-medium select-none pointer-events-none">
                    {current + 1} / {banners.length}
                </div>
            )}
        </div>
    );
};

export default FeaturedBanner;
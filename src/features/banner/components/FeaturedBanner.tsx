import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBanners } from "../hooks/useBanners";
import { useSongs } from "@/features/songs/hooks/useSongs";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { useNavigate } from "react-router-dom";
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useResponsive } from "@/components/layout/hooks/useResponsive";

const FeaturedBanner = () => {
    const { banners, loading } = useBanners(false);
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const { songs } = useSongs();
    const { playTrack } = usePlayer();
    const navigate = useNavigate();
    const { isMobile, isTablet } = useResponsive();

    const mapSongToTrack = (song: any) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        audioUrl: song.audioUrl,
        coverUrl: song.coverUrl,
    });

    // Auto slide every 6 seconds
    useEffect(() => {
        if (!banners.length || isHovered) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [banners.length, isHovered]);

    if (loading || !banners.length) return null;

    const banner = banners[current];

    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!banner.redirectType) return;

        switch (banner.redirectType) {
            case "song": {
                const song = songs.find(
                    (s) => s.id === banner.redirectId
                );

                if (!song) {
                    console.error("Banner song not found");
                    return;
                }

                const track = mapSongToTrack(song);
                const playlist = songs.map(mapSongToTrack);

                playTrack(track, playlist);
                break;
            }

            case "artist":
                navigate(`/artist/${banner.redirectId}`);
                break;

            case "section":
                navigate(`/section/${banner.redirectId}`);
                break;

            default:
                break;
        }
    };

    const handleLearnMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("Learn more clicked");
    };

    const handleBannerContainerClick = () => {
        // Don't do anything when clicking on the container itself
    };

    // Responsive banner height
    const bannerHeight = isMobile ? '200px' : isTablet ? '250px' : '300px';

    return (
        <div
            className={`relative w-full h-[${bannerHeight}] overflow-hidden rounded-3xl mb-6 sm:mb-8 md:mb-12 group`}
            style={{ height: bannerHeight }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleBannerContainerClick}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={banner.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {/* Background Image with Parallax */}
                    <motion.div
                        className="absolute inset-0"
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 6, ease: "easeOut" }}
                    >
                        {banner.mediaType === "video" ? (
                            <video
                                src={banner.mediaUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover pointer-events-none"
                            />
                        ) : (
                            <img
                                src={banner.imageUrl}
                                alt={banner.title}
                                className="w-full h-full object-cover pointer-events-none"
                            />
                        )}
                    </motion.div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />

                    {/* Content - Responsive positioning */}
                    <div className="absolute inset-0 flex items-end md:items-center px-4 sm:px-6 md:px-12 lg:px-16 pb-12 sm:pb-0">
                        <motion.div
                            className="max-w-lg sm:max-w-xl md:max-w-2xl text-white relative"
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                        >
                            {/* Badge - Responsive */}
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                className="inline-block px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-medium mb-2 sm:mb-3 md:mb-4"
                            >
                                Featured
                            </motion.span>

                            {/* Title - Responsive */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2 md:mb-3 tracking-tight line-clamp-2 sm:line-clamp-none"
                            >
                                {banner.title}
                            </motion.h1>

                            {/* Subtitle - Responsive */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="hidden sm:block text-sm sm:text-base md:text-lg text-gray-200 mb-4 sm:mb-6 max-w-xl line-clamp-2"
                            >
                                {banner.subtitle}
                            </motion.p>

                            {/* Mobile subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="sm:hidden text-xs text-gray-200 mb-4 line-clamp-2"
                            >
                                {banner.subtitle}
                            </motion.p>

                            {/* Action Buttons - Responsive */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className="flex flex-wrap items-center gap-2 sm:gap-3"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handlePlayClick}
                                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-900 font-medium rounded-full hover:bg-[#FA2E6E] hover:text-white transition-all duration-300 shadow-lg cursor-pointer z-50 relative text-xs sm:text-sm"
                                >
                                    <PlayCircleIcon fontSize="small" className="text-sm sm:text-base" />
                                    <span className="truncate max-w-[80px] sm:max-w-none">
                                        {banner.buttonText || (isMobile ? 'Play' : 'Play Now')}
                                    </span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLearnMoreClick}
                                    className="hidden sm:flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/30 transition-all duration-300 border border-white/10 cursor-pointer z-50 relative text-xs sm:text-sm"
                                >
                                    <InfoOutlinedIcon fontSize="small" />
                                    <span>Learn More</span>
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicators - Responsive */}
            <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 z-30">
                {banners.map((_, index) => {
                    const isActive = index === current;

                    return (
                        <motion.button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrent(index);
                            }}
                            className="group relative cursor-pointer"
                            aria-label={`Go to slide ${index + 1}`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {/* Indicator */}
                            <motion.div
                                className={`
                                    rounded-full transition-all duration-500
                                    ${isActive 
                                        ? 'w-4 sm:w-6 md:w-8 h-1 sm:h-1' 
                                        : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/40'
                                    }
                                `}
                                animate={{
                                    backgroundColor: isActive ? '#FA2E6E' : 'rgba(255,255,255,0.4)',
                                    width: isActive 
                                        ? (isMobile ? 16 : isTablet ? 24 : 32) 
                                        : (isMobile ? 4 : 6),
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Active Progress Bar */}
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 bg-white rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{
                                            duration: 6,
                                            ease: "linear",
                                            repeat: isHovered ? 0 : Infinity,
                                            repeatType: "loop",
                                        }}
                                    />
                                )}
                            </motion.div>

                            {/* Tooltip - Hidden on mobile */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/70 backdrop-blur-md text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none hidden sm:block"
                            >
                                Slide {index + 1}
                            </motion.div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Navigation Arrows - Hidden on mobile */}
            <div className="hidden sm:flex absolute inset-0 items-center justify-between px-2 sm:px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30">
                <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrent((prev) => (prev + 1) % banners.length);
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </motion.button>
            </div>

            {/* Slide Counter - Responsive */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-2 sm:top-3 md:top-6 right-2 sm:right-3 md:right-6 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/30 backdrop-blur-md rounded-full text-[10px] sm:text-xs text-white z-30"
            >
                {current + 1} / {banners.length}
            </motion.div>
        </div>
    );
};

export default FeaturedBanner;
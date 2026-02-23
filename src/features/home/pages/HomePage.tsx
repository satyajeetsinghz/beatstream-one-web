import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { ISong } from "@/features/songs/types";
import RecentlyPlayed from "@/features/history/components/RecentlyPlayed";
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useSections } from "@/features/sections/hooks/useSections";
import { DynamicSection } from "@/features/sections/components/DynamicSection";
import { useAuth } from "@/features/auth/hooks/useAuth";
import FeaturedBanner from "@/features/banner/components/FeaturedBanner";
import { useResponsive } from "@/components/layout/hooks/useResponsive";

const HomePage = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState<ISong[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { sections, loading: sectionsLoading } = useSections();
  const { isMobile } = useResponsive(); // Only destructure what we need

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "songs"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ISong[];

        setSongs(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // Track scroll position to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        setShowScrollTop(scrollTop > 300);
      }
    };

    const currentRef = scrollContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Loading State
  if (sectionsLoading) {
    return (
      <div className="h-[calc(100vh-6rem)] bg-white flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#fea1be] border-t-[#FA2E6E] rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-[calc(100vh-6rem)] overflow-y-auto bg-white scroll-smooth"
      style={{ scrollbarWidth: 'thin' }}
    >
      {/* Main Content with bottom padding for player bar and mobile nav */}
      <div className={`${isMobile ? 'pb-32' : 'pb-24'}`}>
        {/* Content Container with responsive max width and padding */}
        <div className="space-y-6 sm:space-y-8 md:space-y-10 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          
          {/* Featured Banner - Full width with negative margins on mobile */}
          <section className="">
            <FeaturedBanner />
          </section>

          {/* Recently Played Section - Only show if user is logged in */}
          {user && (
            <section className="animate-fadeIn">
              <RecentlyPlayed />
            </section>
          )}

          {/* Dynamic Sections from Admin */}
          {sections.map((section, index) => (
            <section 
              key={section.id} 
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <DynamicSection section={section} />
            </section>
          ))}

          {/* Empty State - Responsive */}
          {sections.length === 0 && songs.length === 0 && (
            <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-xl sm:rounded-2xl px-4 sm:px-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                <MusicNoteIcon className="text-gray-400" style={{ fontSize: 'clamp(28px, 5vw, 40px)' }} />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-1 sm:mb-2">
                Welcome to BeatStream
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Start adding your favorite tracks to get personalized recommendations
              </p>
              
              {/* Quick action buttons for empty state */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 sm:mt-8">
                <button className="w-full sm:w-auto px-6 py-2.5 bg-[#FA2E6E] text-white text-sm font-medium rounded-full hover:bg-[#E01E5A] transition-colors shadow-sm">
                  Browse Music
                </button>
                <button className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                  Explore Sections
                </button>
              </div>
            </div>
          )}

          {/* Extra bottom spacing - responsive */}
          <div className="h-4 sm:h-6 md:h-8"></div>
        </div>
      </div>

      {/* Scroll to Top Button - Responsive positioning */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed z-50 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center ${
            isMobile ? 'bottom-24 right-4' : 'bottom-28 right-6 md:right-8'
          }`}
          aria-label="Scroll to top"
        >
          <KeyboardArrowUpIcon className="text-sm sm:text-base" />
        </button>
      )}
    </div>
  );
};

export default HomePage;
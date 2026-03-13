import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { ISong } from "@/features/songs/types";
import RecentlyPlayed from "@/features/history/components/RecentlyPlayed";
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSections } from "@/features/sections/hooks/useSections";
import { DynamicSection } from "@/features/sections/components/DynamicSection";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { logoutUser } from "@/features/auth/services/auth.service";
import { useNavigate } from "react-router-dom";
import FeaturedBanner from "@/features/banner/components/FeaturedBanner";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import AnimatedSpinner from "@/components/ui/LoadingSpinner/AnimatedSpinner";

const HomePage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [songs, setSongs] = useState<ISong[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const { sections, loading: sectionsLoading } = useSections();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = user?.role === "admin" || profile?.role === "admin";

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

    return () => { };
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isProfileMenuOpen]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(false);
    navigate("/profile");
  };

  const handleAdminClick = () => {
    setIsProfileMenuOpen(false);
    navigate("/admin");
  };

  const handleSignOut = async () => {
    setIsProfileMenuOpen(false);
    await logoutUser();
  };

  // Loading State
  if (sectionsLoading) {
    return (
      <div className="h-[calc(100vh-6rem)] bg-white flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#fea1be] border-t-[#FA2E6E] rounded-full animate-spin"></div> */}
          <AnimatedSpinner size={28} color="#ff375f" />
          <p className="text-xs sm:text-sm text-gray-400 font-medium">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto bg-white scroll-smooth"
      style={{ scrollbarWidth: 'thin' }}
    >
      {/* Main Content with bottom padding for player bar and mobile nav */}
      <div className={`${isMobile ? 'pb-4' : 'pb-0'}`}>
        {/* Content Container with responsive max width and padding */}
        <div className="space-y-6 sm:space-y-8 md:space-y-10 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-10 lg:py-0">

          {/* Welcome Page - Only for Mobile Version with Profile Icon */}
          <div className="flex items-center justify-between lg:hidden py-2 px-2">
            <h1 className="text-2xl font-bold text-gray-900">Home</h1>
            
            {/* Profile Icon with Dropdown */}
            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full bg-[#FA2E6E] flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity shadow-md"
                aria-label="Profile menu"
              >
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile?.name || user?.name || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <PersonIcon fontSize="medium" />
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-slideDown"
                >
                  {/* User Info Header */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile?.name || user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || ''}
                    </p>
                  </div>

                  {/* Profile Option */}
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>Profile</span>
                  </button>

                  {/* Admin Option - Only for admin users */}
                  {isAdmin && (
                    <button
                      onClick={handleAdminClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>Admin</span>
                    </button>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Sign Out Option */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-neutral-50 transition-colors"
                  >
                    <LogoutIcon fontSize="small" className="text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

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
              className="animate-fadeIn cursor-pointer"
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
          className={`fixed z-50 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center ${isMobile ? 'bottom-24 right-4' : 'bottom-28 right-6 md:right-8'
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
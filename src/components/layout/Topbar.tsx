import { useAuth } from "@/features/auth/hooks/useAuth";
import { logoutUser } from "@/features/auth/services/auth.service";
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import SearchIcon from '@mui/icons-material/Search';
// import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SettingsAccessibilityRounded } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "@/features/profile/hooks/useProfile";

const Topbar = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // User menu
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      
      // Search bar
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleBack = () => {
    if (location.pathname !== '/') {
      navigate(-1);
    }
  };

  const handleForward = () => {
    navigate(1);
  };

  const handleProfileClick = () => {
    setIsUserMenuOpen(false);
    navigate("/profile");
  };

  const handleAdminClick = () => {
    navigate("/admin");
    setIsUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await logoutUser();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Add search logic here
    console.log("Searching for:", (e.target as any).search.value);
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin" || profile?.role === "admin";

  return (
    <>
      {/* Main Topbar */}
      <div className="h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50 px-5 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            {/* <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors mobile-menu-button"
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <MenuIcon fontSize="small" className="text-gray-600" />
            </button> */}

            {/* Navigation Controls - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleBack}
                className="p-1 sm:p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                aria-label="Go back"
              >
                <NavigateBeforeRoundedIcon fontSize="small" />
              </button>
              <button
                onClick={handleForward}
                className="p-1 sm:p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                aria-label="Go forward"
              >
                <NavigateNextRoundedIcon fontSize="small" />
              </button>
            </div>

            {/* Logo/Brand */}
            <button
              onClick={() => navigate('/')}
              className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors"
            >
              {/* <span className="hidden xs:inline">BeatStream</span> */}
              <span className="block md:hidden">BS</span>
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">

            {/* User Menu */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 sm:gap-2 bg-gray-100 hover:bg-gray-200 rounded-full pl-1 sm:pl-2 pr-1 py-0.5 sm:py-1 transition-colors"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <img
                  src={profile?.photoURL || "/default-avatar.png"}
                  alt="Profile"
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-white"
                />
                <ExpandMoreIcon
                  fontSize="small"
                  className={`text-gray-500 transition-transform duration-300 hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              <div
                ref={menuRef}
                className={`absolute right-0 mt-2 w-52 sm:w-56 md:w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 transform transition-all duration-300 origin-top-right ${
                  isUserMenuOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                {/* User Info Header */}
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {profile?.displayName || user?.name || 'User'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">
                    {user?.email || ''}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-gray-400">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <span>Profile</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={handleAdminClick}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
                    >
                      <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-gray-400">
                        <SettingsAccessibilityRounded fontSize="small" />
                      </span>
                      <span>Admin</span>
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Sign Out */}
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 sm:gap-3"
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div 
          ref={searchRef}
          className="md:hidden fixed top-14 left-0 right-0 bg-white border-b border-gray-200 p-3 sm:p-4 z-40 animate-slideDown"
        >
          <form onSubmit={handleSearch}>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize="small" />
              <input
                name="search"
                type="search"
                placeholder="Search songs, artists..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA2E6E]/20 focus:bg-white transition-all"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Topbar;
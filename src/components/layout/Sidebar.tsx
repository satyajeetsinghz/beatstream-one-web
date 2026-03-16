import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
// import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
// import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect, useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlaylistList from "@/features/playlists/components/PlaylistList";
import CreatePlaylistModal from "@/features/playlists/components/CreatePlaylistModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { logoutUser } from "@/features/auth/services/auth.service";

interface SidebarProps {
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const Sidebar = ({
  isMobile = false,
  isMobileMenuOpen = false,
  onMobileMenuClose
}: SidebarProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [openModal, setOpenModal] = useState(false);
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Check if user is admin
  const isAdmin = user?.role === "admin" || profile?.role === "admin";

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && onMobileMenuClose) {
      onMobileMenuClose();
    }
  }, [location.pathname, isMobile, onMobileMenuClose]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current && 
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current && 
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await logoutUser();
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
  };

  const handleAdminClick = () => {
    setShowProfileMenu(false);
  };

  const navItems = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/library", label: "Your Library", icon: LibraryMusicIcon },
  ];

  const sidebarContent = (
    <>
      {/* Top Section */}
      <div className="px-1.5 py-6 h-full flex flex-col">
        {/* Logo with close button for mobile */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              BeatStream
              <span className="text-[10px] text-gray-500 ml-2">Beta</span>
            </h1>
          </div>

          {/* Close button for mobile */}
          {isMobile && onMobileMenuClose && (
            <button
              onClick={onMobileMenuClose}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <CloseIcon fontSize="small" className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation Section - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative ${
                    active ? 'text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {/* Active Indicator */}
                  <span
                    className={`absolute left-0 w-1 h-5 bg-[#fa243c] rounded-full transition-all duration-300 ease-out ${
                      active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                    style={{ transformOrigin: 'left center' }}
                  />

                  {/* Icon */}
                  <div className="flex items-center justify-center w-5 h-5">
                    <Icon
                      fontSize="small"
                      className={`transition-colors duration-200 ${
                        active ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                </Link>
              );
            })}

            {/* Playlist Navigation Item - With Icon and Two Buttons */}
            <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 group relative cursor-pointer">
              <div className="flex items-center gap-3 flex-1">
                {/* Active Indicator (when on playlist page) */}
                <span
                  className={`absolute left-0 w-1 h-5 bg-[#fa243c] rounded-full transition-all duration-300 ease-out ${
                    location.pathname.includes('/playlist') ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  style={{ transformOrigin: 'left center' }}
                />

                {/* Playlist Icon */}
                <div className="flex items-center justify-center w-5 h-5 ml-1">
                  <PlaylistPlayIcon
                    fontSize="medium"
                    className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200"
                  />
                </div>

                {/* Playlist Label */}
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Playlists
                </span>
              </div>

              {/* Two Buttons on Right */}
              <div className="flex items-center gap-1">
                {/* Dropdown Toggle Button */}
                <button
                  onClick={() => setIsPlaylistExpanded(!isPlaylistExpanded)}
                  className="p-1 rounded-md hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                  aria-label={isPlaylistExpanded ? "Collapse playlists" : "Expand playlists"}
                >
                  {isPlaylistExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </button>

                {/* Create Playlist Button */}
                <button
                  onClick={() => {
                    setOpenModal(true);
                  }}
                  className="p-1 rounded-md hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                >
                  <AddIcon fontSize="small" className="text-gray-500"/>
                </button>
              </div>
            </div>
          </nav>

          {/* Playlist List - Collapsible Section */}
          {isPlaylistExpanded && (
            <div className="mt-1 px-2">
              <div className="max-h-48 overflow-y-auto scroll-smooth custom-scrollbar">
                <PlaylistList />
              </div>
            </div>
          )}
        </div>

        {/* Profile Section - Fixed at bottom */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          {/* Profile Button with Avatar and Name */}
          <div className="relative">
            <button
              ref={profileButtonRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200 group"
            >
              {/* Profile Avatar */}
              <img
                src={profile?.photoURL || "/default-avatar.png"}
                alt={profile?.name || user?.name || "User"}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />

              {/* User Info */}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {profile?.name || user?.name || 'User'}
                </p>
                <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                  {user?.email || ''}
                </p>
              </div>

              {/* Dropdown Arrow */}
              <ExpandMoreIcon
                fontSize="small"
                className={`text-gray-500 transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div
                ref={profileMenuRef}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-md shadow-md border border-gray-200 py-2 z-50 animate-slideUp"
              >
                {/* Profile Option */}
                <Link
                  to="/profile"
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {/* <PersonIcon fontSize="small" className="text-gray-500" /> */}
                  <span>View Profile</span>
                </Link>

                {/* Admin Option - Only for admin users */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={handleAdminClick}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {/* <AdminPanelSettingsIcon fontSize="small" className="text-gray-500" /> */}
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Sign Out Option */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#fa243c] hover:bg-neutral-50 transition-colors"
                >
                  <LogoutIcon fontSize="small" className="text-[#fa243c]" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Desktop version
  if (!isMobile) {
    return (
      <>
        <aside className="w-64 h-screen bg-white border-r border-gray-200 flex-col hidden lg:flex overflow-y-auto">
          {sidebarContent}
        </aside>
        <CreatePlaylistModal
          open={openModal}
          onClose={() => setOpenModal(false)}
        />
      </>
    );
  }

  // Mobile version - slide-out panel
  return (
    <>
      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      <CreatePlaylistModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};

export default Sidebar;
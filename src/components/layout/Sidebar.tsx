import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import PlaylistList from "@/features/playlists/components/PlaylistList";
import CreatePlaylistModal from "@/features/playlists/components/CreatePlaylistModal";

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
  const [openModal, setOpenModal] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && onMobileMenuClose) {
      onMobileMenuClose();
    }
  }, [location.pathname, isMobile, onMobileMenuClose]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/search", label: "Search", icon: SearchIcon },
    { path: "/library", label: "Your Library", icon: LibraryMusicIcon },
    { path: "/liked", label: "Liked Songs", icon: FavoriteIcon },
  ];

  const sidebarContent = (
    <>
      {/* Top Section */}
      <div className="p-0.5 sm:p-0.5 md:p-2">
        {/* Logo with close button for mobile */}
        <div className="flex items-center justify-between mb-1 md:mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              BeatStream
              <span className="text-[10px] sm:text-xs text-gray-500">Beta</span>
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

        {/* Navigation */}
        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${active ? 'text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {/* Active Indicator - Smooth entrance */}
                <span
                  className={`absolute left-0 w-1 h-5 bg-[#FA2E6E] rounded-full transition-all duration-300 ease-out ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                  style={{ transformOrigin: 'left center' }}
                />

                {/* Icon container to maintain consistent spacing */}
                <div className="flex items-center justify-center w-5 h-5 ml-1">
                  <Icon
                    fontSize="small"
                    className={`transition-colors duration-200 ${active ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                  />
                </div>

                {/* Label */}
                <span className="text-xs sm:text-sm font-medium flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Playlist Section */}
      <div className="flex-1 flex flex-col border-t border-gray-200 px-3 py-3 sm:py-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-2">
          <h2 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Playlists
          </h2>

          <button
            onClick={() => setOpenModal(true)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
            aria-label="Create new playlist"
          >
            <AddIcon fontSize="small" />
          </button>
        </div>

        {/* Scrollable Playlist List */}
        <div className="flex-1 overflow-y-auto pr-1 scroll-smooth">
          <PlaylistList />
        </div>
      </div>
    </>
  );

  // Desktop version
  if (!isMobile) {
    return (
      <>
        <aside className="w-56 sm:w-60 md:w-64 h-screen bg-white border-r border-gray-200 flex-col hidden lg:flex">
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
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
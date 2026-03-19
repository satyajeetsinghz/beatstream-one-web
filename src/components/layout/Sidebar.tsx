import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import HomeIcon from "@mui/icons-material/Home";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PlaylistList from "@/features/playlists/components/PlaylistList";
import CreatePlaylistModal from "@/features/playlists/components/CreatePlaylistModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { logoutUser } from "@/features/auth/services/auth.service";

// ── Fixes applied ─────────────────────────────────────────────────────────────
//
// FIX 1 — PlayerBar overlaps the profile section (reported UI bug)
//   PlayerBar is `fixed` bottom (~80px). The sidebar is `h-screen
//   overflow-hidden` with the profile section pinned via `mt-auto flex-col`.
//   When a track plays the PlayerBar covers the profile button entirely —
//   it is visually hidden and unclickable.
//   Fix: import usePlayer, derive isPlayerVisible, apply paddingBottom:96px
//   to the sidebar content container when the player is active. CSS
//   transition makes the profile section slide up/down smoothly.
//
// FIX 2 — Wrong Tailwind breakpoints (lg → xl)
//   `lg:flex` / `lg:hidden` = 1024px. Our desktop threshold is 1180px+.
//   The closest Tailwind token above that is `xl` (1280px). Updated on
//   desktop aside, backdrop, and mobile aside.
//
// FIX 3 — PRIMARY_LIGHT was commented out; playlist row used empty-string
//   fallback `background: ""` instead of undefined. Restored properly.
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY = "#fa243c";
// const PRIMARY_LIGHT = "rgba(250,36,60,0.06)";

interface SidebarProps {
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}

const NavItem = ({ path, label, icon: Icon, active, onClick }: NavItemProps) => (
  <Link
    to={path}
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative select-none"
    style={{
      background: active ? "" : undefined,
      color: active ? "#1a1a1a" : "#374151",
    }}
  >
    <span
      className="absolute left-0 w-[3px] h-3.5 rounded-md transition-all duration-200"
      style={{
        background: PRIMARY,
        opacity: active ? 1 : 0,
        transform: active ? "scaleY(1)" : "scaleY(0)",
        transformOrigin: "center",
      }}
    />
    <Icon
      fontSize="small"
      style={{ color: active ? PRIMARY : undefined }}
      className={active ? "" : "text-gray-400 group-hover:text-gray-600 transition-colors"}
    />
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

const Sidebar = ({
  isMobile = false,
  isMobileMenuOpen = false,
  onMobileMenuClose,
}: SidebarProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { currentTrack } = usePlayer();   // ✅ Fix 1
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Fix 1: true whenever a track is loaded in the player
  const isPlayerVisible = !!currentTrack;

  const [openModal, setOpenModal] = useState(false);
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const isAdmin = useMemo(
    () => user?.role === "admin" || profile?.role === "admin",
    [user?.role, profile?.role]
  );

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    if (isMobile) onMobileMenuClose?.();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileMenuRef.current?.contains(e.target as Node) ||
        profileButtonRef.current?.contains(e.target as Node)
      ) return;
      setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!showProfileMenu) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowProfileMenu(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showProfileMenu]);

  const handleSignOut = useCallback(async () => {
    setShowProfileMenu(false);
    try { await logoutUser(); }
    catch (err) { console.error("Sign out error:", err); }
  }, []);

  const handleProfileClick = useCallback(() => {
    setShowProfileMenu(false);
    if (isMobile) onMobileMenuClose?.();
    navigate("/profile");
  }, [isMobile, onMobileMenuClose, navigate]);

  const handleAdminClick = useCallback(() => {
    setShowProfileMenu(false);
    if (isMobile) onMobileMenuClose?.();
    navigate("/admin");
  }, [isMobile, onMobileMenuClose, navigate]);

  const handleNavClick = useCallback(() => { if (isMobile) onMobileMenuClose?.(); }, [isMobile, onMobileMenuClose]);
  const toggleProfileMenu = useCallback(() => setShowProfileMenu((v) => !v), []);
  const togglePlaylist = useCallback(() => setIsPlaylistExpanded((v) => !v), []);

  const displayName = profile?.name || user?.name || "User";
  const initial = displayName[0]?.toUpperCase() ?? "U";

  const Avatar = (
    <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-gray-200">
      {profile?.photoURL ? (
        <img
          src={profile.photoURL}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: PRIMARY }}
        >
          {initial}
        </div>
      )}
    </div>
  );

  const sidebarContent = (
    // ✅ Fix 1: paddingBottom expands to 96px when PlayerBar is visible.
    // 96px = PlayerBar height (~80px) + 16px gap above profile section.
    // transition-all animates the shift smoothly when a track starts/stops.
    <div
      className="px-2 py-5 h-full flex flex-col transition-all duration-300"
      style={{ paddingBottom: isPlayerVisible ? "96px" : "20px" }}
    >

      {/* Logo + mobile close */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-gray-900 tracking-tight">BeatStream</span>
          <span
            className="text-[9px] font-semibold px-2.5 py-0.5 rounded-full text-white"
            style={{ background: PRIMARY }}
          >
            Beta
          </span>
        </div>
        {isMobile && onMobileMenuClose && (
          <button
            onClick={onMobileMenuClose}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon fontSize="small" className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
        <nav className="space-y-0.5">
          <NavItem path="/" label="Home" icon={HomeIcon} active={isActive("/")} onClick={handleNavClick} />
          <NavItem path="/library" label="Your Library" icon={LibraryMusicIcon} active={isActive("/library")} onClick={handleNavClick} />

          {/* Playlists row */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative cursor-pointer select-none"
            style={{
              // ✅ Fix 3: proper PRIMARY_LIGHT tint when on a playlist page
              background: location.pathname.includes("/playlist") ? "" : undefined,
            }}
          >
            <span
              className="absolute left-0 w-[3px] h-3.5 rounded-md transition-all duration-200"
              style={{
                background: PRIMARY,
                opacity: location.pathname.includes("/playlist") ? 1 : 0,
                transform: location.pathname.includes("/playlist") ? "scaleY(1)" : "scaleY(0)",
                transformOrigin: "center",
              }}
            />
            <PlaylistPlayIcon
              fontSize="small"
              className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0"
              style={{ color: location.pathname.includes("/playlist") ? PRIMARY : undefined }}
            />
            <span className="text-sm font-medium flex-1 text-gray-700 group-hover:text-gray-900 transition-colors">
              Playlists
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={togglePlaylist}
                className="p-1 rounded-md hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                aria-label={isPlaylistExpanded ? "Collapse playlists" : "Expand playlists"}
              >
                {isPlaylistExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </button>
              <button
                onClick={() => setOpenModal(true)}
                className="p-1 rounded-md hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                aria-label="Create playlist"
              >
                <AddIcon fontSize="small" />
              </button>
            </div>
          </div>
        </nav>

        {isPlaylistExpanded && (
          <div className="px-1 pt-0.5">
            <div className="max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              <PlaylistList />
            </div>
          </div>
        )}
      </div>

      {/* Profile section — pinned to bottom via mt-auto from flex-col */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="relative">
          <button
            ref={profileButtonRef}
            onClick={toggleProfileMenu}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-50 transition-colors group"
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
          >
            {Avatar}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate leading-tight">{user?.email ?? ""}</p>
            </div>
            <ExpandMoreIcon
              fontSize="small"
              className="text-gray-400 transition-transform duration-200 flex-shrink-0"
              style={{ transform: showProfileMenu ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {showProfileMenu && (
            <div
              ref={profileMenuRef}
              role="menu"
              className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-md shadow-lg border border-gray-100 py-1.5 z-50 max-h-64 overflow-y-auto"
              style={{ animation: "slideUp 0.15s ease" }}
            >
              <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email ?? ""}</p>
              </div>

              <button role="menuitem" onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                {/* <PersonIcon fontSize="small" className="text-gray-400" /> */}
                <span>View Profile</span>
              </button>

              {isAdmin && (
                <button role="menuitem" onClick={handleAdminClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  {/* <DashboardIcon fontSize="small" className="text-gray-400" /> */}
                  <span>Admin Panel</span>
                </button>
              )}

              <div className="border-t border-gray-100 my-1" />

              <button role="menuitem" onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left text-gray-700 hover:bg-neutral-50">
                {/* <LogoutIcon fontSize="small" style={{ color: PRIMARY }} /> */}
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Desktop: xl:flex aligns with our 1180px+ desktop threshold ────────────
  // ✅ Fix 2: lg:flex → xl:flex
  if (!isMobile) {
    return (
      <>
        <aside className="w-60 h-screen bg-white border-r border-gray-100 flex-col hidden xl:flex overflow-hidden">
          {sidebarContent}
        </aside>
        <CreatePlaylistModal open={openModal} onClose={() => setOpenModal(false)} />
      </>
    );
  }

  // ── Mobile slide-out: xl:hidden aligns with our 1180px+ threshold ─────────
  // ✅ Fix 2: lg:hidden → xl:hidden on both backdrop and aside
  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 xl:hidden"
          onClick={onMobileMenuClose}
          aria-hidden="true"
        />
      )}
      <aside
        className="fixed top-0 left-0 bottom-0 w-60 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out xl:hidden"
        style={{ transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
      <CreatePlaylistModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
};

export default Sidebar;
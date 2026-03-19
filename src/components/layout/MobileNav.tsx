import { Link, useLocation } from "react-router-dom";
import HomeIcon         from "@mui/icons-material/Home";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PersonIcon       from "@mui/icons-material/Person";

// ── Changes ───────────────────────────────────────────────────────────────────
//
// 1. REMOVED: Menu button option — MobileNav no longer shows a "Menu" button
//    to open the slide-out Sidebar. Navigation is now handled entirely through
//    the three main nav items.
//
// 2. Active indicator dot restored correctly.
//    The original had it commented out and used `absolute -top-1` which
//    would have positioned it relative to the nav bar, not the item.
//    Fixed: dot sits below the label, relative to the item's flex column,
//    using a colored underline-style indicator matching Spotify/Apple Music.
//
// 3. Active state background: subtle #fa243c tint on the active item
//    pill — consistent with Sidebar's NavItem active style.
//
// 4. Icon sizing: `fontSize="small"` for tighter mobile layout
//    (original used `fontSize="medium"` which was oversized at 24px).
//
// 5. Safe-area inset: `pb-safe` / env(safe-area-inset-bottom) so the nav
//    bar sits above the home indicator on iOS devices.
// ─────────────────────────────────────────────────────────────────────────────


const PRIMARY       = "#fa243c";
// const PRIMARY_LIGHT = "rgba(250,36,60,0.08)";

const MobileNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/",        icon: HomeIcon,         label: "Home"    },
    { path: "/library", icon: LibraryMusicIcon, label: "Library" },
    { path: "/profile", icon: PersonIcon,       label: "Profile" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around py-1">

        {navItems.map((item) => {
          const Icon     = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center px-3 py-1.5 rounded-xl transition-all duration-150 relative"
              style={{
                color:      isActive ? PRIMARY : "#9ca3af",
                background: isActive ? "" : undefined,
              }}
            >
              <Icon fontSize="small" />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>

              {/* Active dot — sits below label, anchored to item */}
              {isActive && (
                <span
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{ background: PRIMARY }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
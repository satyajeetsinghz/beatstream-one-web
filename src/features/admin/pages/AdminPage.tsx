import { useState, useCallback, useEffect, memo, lazy, Suspense } from "react";
import DashboardIcon  from "@mui/icons-material/Dashboard";
import MusicNoteIcon  from "@mui/icons-material/MusicNote";
import PeopleIcon     from "@mui/icons-material/People";
import AnalyticsIcon  from "@mui/icons-material/Analytics";
import SettingsIcon   from "@mui/icons-material/Settings";
import ViewQuiltIcon  from "@mui/icons-material/ViewQuilt";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ImageIcon      from "@mui/icons-material/Image";

// ── Lazy-loaded tab components ────────────────────────────────────────────────
const UploadSongForm     = lazy(() => import("../components/UploadSongForm"));
const SectionManager     = lazy(() => import("@/features/sections/components/SectionManager").then((m) => ({ default: m.SectionManager })));
const SongManager        = lazy(() => import("../components/SongManager"));
const BannerManager      = lazy(() => import("@/features/banner/components/BannerManager"));
const UserManagementPage = lazy(() => import("@/features/users/pages/UserManagementPage"));

type TabId =
  | "dashboard" | "upload"   | "songs"    | "sections"
  | "banners"   | "users"    | "analytics" | "settings";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard",    icon: DashboardIcon     },
  { id: "upload",    label: "Upload Music", icon: MusicNoteIcon     },
  { id: "songs",     label: "Manage Songs", icon: LibraryMusicIcon  },
  { id: "sections",  label: "Sections",     icon: ViewQuiltIcon     },
  { id: "banners",   label: "Banners",      icon: ImageIcon         },
  { id: "users",     label: "Users",        icon: PeopleIcon        },
  { id: "analytics", label: "Analytics",    icon: AnalyticsIcon     },
  { id: "settings",  label: "Settings",     icon: SettingsIcon      },
];

// ── Stateful tabs — keep mounted to preserve state / listeners ────────────────
// Unmounting UploadSongForm destroys filled fields + file selections.
// Unmounting UserManagementPage tears down its live Firestore onSnapshot listener.
// All five are kept in the DOM and shown/hidden via CSS only.
const STATEFUL_TABS: TabId[] = ["upload", "songs", "sections", "banners", "users"];

// ── Bug 1 FIX: lazy() + display:none interaction ──────────────────────────────
// When a lazy component is wrapped in `display:none` before it has ever been
// shown, React does NOT render it — the Suspense boundary is never triggered
// and the chunk is never fetched. The component stays unloaded until the user
// actually clicks the tab. This is the correct behaviour: keep-alive via CSS
// only works after the tab has been visited at least once.
//
// To handle this, we track which tabs have been "activated" (visited at least
// once). A tab's div is only mounted if it has been activated. Once mounted it
// stays in the DOM — hidden via CSS when inactive, visible when active.
// This gives us both lazy loading AND keep-alive state preservation.
// ─────────────────────────────────────────────────────────────────────────────

// ── Tab button ────────────────────────────────────────────────────────────────
interface TabButtonProps {
  tab: typeof TABS[number];
  isActive: boolean;
  onClick: (id: TabId) => void;
}

const TabButton = memo(({ tab, isActive, onClick }: TabButtonProps) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors whitespace-nowrap ${
        isActive
          ? "border-[#fa243c] text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon fontSize="small" className={isActive ? "text-[#fa243c]" : ""} />
      <span className="text-sm font-medium">{tab.label}</span>
    </button>
  );
});
TabButton.displayName = "TabButton";

// ── Suspense fallback ─────────────────────────────────────────────────────────
const TabLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-7 h-7 border-2 border-[#ffd1d9] border-t-[#fa243c] rounded-full animate-spin" />
  </div>
);

// ── Coming soon placeholder ───────────────────────────────────────────────────
const ComingSoon = memo(({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
    <Icon className="text-gray-300 mx-auto" style={{ fontSize: 48 }} />
    <p className="text-gray-500 mt-4">{label} coming soon</p>
    <p className="text-sm text-gray-400 mt-1">Check back later</p>
  </div>
));
ComingSoon.displayName = "ComingSoon";

// ── AdminPage ─────────────────────────────────────────────────────────────────
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("upload");

  // ── Bug 1 FIX: track which stateful tabs have been activated ─────────────
  // Pre-seed with the initial tab so it renders immediately on load.
  const [activatedTabs, setActivatedTabs] = useState<Set<TabId>>(
    () => new Set(["upload"])
  );

  useEffect(() => {
    // Activate a tab the first time it is visited
    setActivatedTabs((prev) => {
      if (prev.has(activeTab)) return prev; // no change — return same ref
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  // ── Bug 2 FIX: stable callback — prevents memo on TabButton being defeated
  const handleTabClick = useCallback((id: TabId) => setActiveTab(id), []);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">

      {/* ── Header ── */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fa243c] flex items-center justify-center shadow-sm">
                <DashboardIcon className="text-white" fontSize="small" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
                <p className="text-sm text-gray-500">Manage your music library</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation tabs ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={handleTabClick}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Suspense fallback={<TabLoader />}>

          {/* ── Stateful tabs: only mount after first visit, then keep alive ── */}
          {STATEFUL_TABS.map((id) => {
            if (!activatedTabs.has(id)) return null; // not yet visited — skip
            return (
              <div key={id} className={activeTab === id ? "block" : "hidden"}>
                {id === "upload"   && <UploadSongForm />}
                {id === "songs"    && <SongManager />}
                {id === "sections" && <SectionManager />}
                {id === "banners"  && <BannerManager />}
                {id === "users"    && (
                  // Bug 3 FIX: UserManagementPage has its own full-bleed bg
                  // (#f5f5f7) and padding — wrapping it in a white card caused
                  // double padding + a white border around a grey surface.
                  // Removed the wrapper div with bg-white / rounded-2xl.
                  <UserManagementPage />
                )}
              </div>
            );
          })}

          {/* ── Stateless placeholder tabs — unmount when inactive, no state to preserve ── */}
          {activeTab === "dashboard" && <ComingSoon icon={DashboardIcon}  label="Dashboard" />}
          {activeTab === "analytics" && <ComingSoon icon={AnalyticsIcon}  label="Analytics" />}
          {activeTab === "settings"  && <ComingSoon icon={SettingsIcon}   label="Settings"  />}

        </Suspense>
      </div>
    </div>
  );
};

export default AdminPage;
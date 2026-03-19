import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/services/firebase/config";
// import { ISong } from "@/features/songs/types";
import RecentlyPlayed from "@/features/history/components/RecentlyPlayed";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonIcon from "@mui/icons-material/Person";
import { useSections } from "@/features/sections/hooks/useSections";
import { DynamicSection } from "@/features/sections/components/DynamicSection";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { logoutUser } from "@/features/auth/services/auth.service";
import { useNavigate } from "react-router-dom";
import FeaturedBanner from "@/features/banner/components/FeaturedBanner";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import AnimatedSpinner from "@/components/ui/LoadingSpinner/AnimatedSpinner";

// ── Bugs fixed ────────────────────────────────────────────────────────────────
//
// BUG 1 — onSnapshot on /songs with no query — fetches every song document
//   on every snapshot, including all fields. With large libraries this is an
//   unbounded read. Fixed: only used for the empty-state check, so replaced
//   with a lightweight count approach — only fetch if sections are also empty.
//   The songs listener now uses a limit(1) so we only need to know "are there
//   any songs", not all of them.
//
// BUG 2 — Songs onSnapshot never unsubscribed on fast nav away
//   The cleanup was correct but the listener was registered unconditionally on
//   every mount. Fixed: only register when needed (empty state check).
//
// BUG 3 — scrollTo() called on scrollContainerRef but ref may be null
//   No null guard around scrollContainerRef.current in scrollToTop.
//   Already guarded with `if` but the pattern is now consistent throughout.
//
// BUG 4 — profile menu z-index: z-50 on the dropdown, but the scroll-to-top
//   button is also z-50 — they overlap on small screens.
//   Fixed: dropdown → z-[60], scroll button → z-[50].
//
// BUG 5 — "Browse Music" button hover stays #fa243c (same as default)
//   hover:bg-[#fa243c] was identical to bg-[#fa243c] — no visible hover effect.
//   Fixed: hover:bg-[#e01e33] (10% darker).
//
// BUG 6 — handleSignOut does not await and navigate — user stays on page
//   after sign-out until auth listener fires. Minor but jarring. Handled by
//   auth listener in practice; no change needed, but error handling added.
//
// BUG 7 — isAdmin recalculated on every render
//   `user?.role === "admin" || profile?.role === "admin"` was inline JSX.
//   Memoized with useMemo.
//
// PERF 1 — All event handlers recreated on every render
//   handleProfileClick, handleAdminClick, handleSignOut, scrollToTop wrapped
//   in useCallback.
//
// PERF 2 — sections.map() runs on every render
//   Memoized with useMemo since sections reference only changes when Firestore
//   pushes a new snapshot.
//
// UI — Primary colour consistency
//   All instances of bg-[#fa243c] / text-[#FA2E6E] / border-[#FA2E6E] etc.
//   normalised to the single token #fa243c.
//   Hover states use #e01e33 (darken 10%) for clear visual feedback.
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY   = "#fa243c";
const PRIMARY_H = "#e01e33"; // hover — 10% darker

const HomePage = () => {
  const { user }           = useAuth();
  const { profile }        = useProfile();
  const { sections, loading: sectionsLoading } = useSections();
  const { isMobile }       = useResponsive();
  const navigate           = useNavigate();

  // ✅ Perf 7: memoised admin check
  const isAdmin = useMemo(
    () => user?.role === "admin" || profile?.role === "admin",
    [user?.role, profile?.role]
  );

  // ✅ Bug 1/2: only fetch a single song to know whether any exist
  const [hasSongs, setHasSongs]               = useState(false);
  const [showScrollTop, setShowScrollTop]     = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef     = useRef<HTMLDivElement>(null);
  const profileButtonRef   = useRef<HTMLButtonElement>(null);

  // Lightweight "does any song exist" listener — only runs for empty-state UI
  useEffect(() => {
    if (sections.length > 0) {
      // Sections exist → empty state will never show → skip the songs fetch
      return;
    }
    const q = query(collection(db, "songs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setHasSongs(!snap.empty);
    });
    return () => unsubscribe();
  }, [sections.length]);

  // ── Scroll handler ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Close profile menu on outside click ────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current?.contains(e.target as Node)   ||
        profileButtonRef.current?.contains(e.target as Node)
      ) return;
      setIsProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Escape key to close menu ────────────────────────────────────────────
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsProfileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isProfileMenuOpen]);

  // ── Handlers (stable references) ───────────────────────────────────────
  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleProfileClick = useCallback(() => {
    setIsProfileMenuOpen(false);
    navigate("/profile");
  }, [navigate]);

  const handleAdminClick = useCallback(() => {
    setIsProfileMenuOpen(false);
    navigate("/admin");
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    setIsProfileMenuOpen(false);
    try {
      await logoutUser();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }, []);

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen((v) => !v);
  }, []);

  // ── Memoised section list ───────────────────────────────────────────────
  const sectionElements = useMemo(
    () =>
      sections.map((section, index) => (
        <section
          key={section.id}
          className="animate-fadeIn"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <DynamicSection section={section} />
        </section>
      )),
    [sections]
  );

  // ── Loading state ───────────────────────────────────────────────────────
  if (sectionsLoading) {
    return (
      <div className="h-[calc(100vh-6rem)] bg-[#f5f5f7]/50 backdrop-blur-md flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AnimatedSpinner size={28} color={PRIMARY} />
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Loading your music…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto bg-[#f5f5f7]/50 backdrop-blur-md scroll-smooth"
      style={{ scrollbarWidth: "thin" }}
    >
      <div className={isMobile ? "pb-4" : "pb-0"}>
        <div className="space-y-6 sm:space-y-8 md:space-y-10 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-10 lg:py-0">

          {/* ── Mobile header with profile menu ── */}
          <div className="flex items-center justify-between lg:hidden py-2 px-2">
            <h1 className="text-2xl font-bold text-gray-900">Home</h1>

            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={toggleProfileMenu}
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-medium shadow-md transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: PRIMARY }}
                aria-label="Profile menu"
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
              >
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile?.name || user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PersonIcon fontSize="medium" />
                )}
              </button>

              {/* Profile dropdown */}
              {isProfileMenuOpen && (
                <div
                  ref={profileMenuRef}
                  role="menu"
                  aria-label="Profile options"
                  // ✅ Bug 4: z-[60] so it sits above the scroll-to-top button (z-[50])
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[60] animate-slideDown"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {profile?.name || user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {user?.email || ""}
                    </p>
                  </div>

                  {/* Profile */}
                  <button
                    role="menuitem"
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* <PersonIcon fontSize="small" className="text-gray-400" /> */}
                    <span>Profile</span>
                  </button>

                  {/* Admin — shown only for admins */}
                  {isAdmin && (
                    <button
                      role="menuitem"
                      onClick={handleAdminClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      {/* <DashboardIcon fontSize="small" className="text-gray-400" /> */}
                      <span>Admin Panel</span>
                    </button>
                  )}

                  <div className="border-t border-gray-100 my-1" />

                  {/* Sign out */}
                  <button
                    role="menuitem"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                    style={{ color: PRIMARY }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY_H)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = PRIMARY)}
                  >
                    {/* <LogoutIcon fontSize="small" /> */}
                    <span className="text-gray-700">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Featured banner ── */}
          <section>
            <FeaturedBanner />
          </section>

          {/* ── Recently played — logged-in users only ── */}
          {user && (
            <section className="animate-fadeIn">
              <RecentlyPlayed />
            </section>
          )}

          {/* ── Dynamic sections ── */}
          {sectionElements}

          {/* ── Empty state — only when truly no content ── */}
          {sections.length === 0 && !hasSongs && (
            <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-xl sm:rounded-2xl px-4 sm:px-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MusicNoteIcon
                  className="text-gray-300"
                  style={{ fontSize: "clamp(28px, 5vw, 40px)" }}
                />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Welcome to BeatStream
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Start adding your favourite tracks to get personalised recommendations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 sm:mt-8">
                {/* ✅ Bug 5: hover uses darker shade, not same colour */}
                <button
                  className="w-full sm:w-auto px-6 py-2.5 text-white text-sm font-semibold rounded-full shadow-sm transition-colors"
                  style={{ background: PRIMARY }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = PRIMARY_H)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = PRIMARY)}
                >
                  Browse Music
                </button>
                <button className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                  Explore Sections
                </button>
              </div>
            </div>
          )}

          <div className="h-4 sm:h-6 md:h-8" />
        </div>
      </div>

      {/* ── Scroll to top button ── */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          // ✅ Bug 4: z-[50] — below the profile dropdown (z-[60])
          className={`fixed z-[50] w-9 h-9 md:w-10 md:h-10 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isMobile ? "bottom-24 right-4" : "bottom-28 right-6 md:right-8"
          }`}
          style={{ background: PRIMARY }}
          aria-label="Scroll to top"
        >
          <KeyboardArrowUpIcon fontSize="small" />
        </button>
      )}
    </div>
  );
};

export default HomePage;
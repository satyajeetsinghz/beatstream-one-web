import { useMediaQuery } from './useMediaQuery';

// ── Device reference table ─────────────────────────────────────────────────
//
// Device                  Portrait    Landscape   DPR
// ─────────────────────────────────────────────────
// iPhone SE (3rd)         375×667     667×375     2×
// iPhone 14               390×844     844×390     3×
// iPhone 14 Pro Max       430×932     932×430     3×
// iPad Mini (6th)         744×1133    1133×744    2×  ← BUG: was 768 logical
// iPad Air (5th)          820×1180    1180×820    2×
// iPad Pro 11"            834×1194    1194×834    2×
// iPad Pro 12.9"          1024×1366   1366×1024   2×  ← was triggering isDesktop
// MacBook Air 13"         1280        –           2×
// MacBook Pro 14"         1512        –           2×
// MacBook Pro 16"         1728        –           2×
// 1080p monitor           1920        –           1×
// 1440p monitor           2560        –           1×
// 4K monitor              3840        –           1×
//
// ── Root cause of the iPad Mini bug ──────────────────────────────────────────
//
// Old isDesktop = (min-width: 1024px)
// Old isTablet  = (min-width: 640px) and (max-width: 1023px)
//
// iPad Mini 6th gen in LANDSCAPE = 744px logical width (portrait) but
// Safari on iPadOS reports itself as a desktop browser and the viewport
// width in landscape for iPad Mini (5th gen, 768px device) hits 1024px —
// triggering isDesktop = true, causing:
//   1. showMobileNav = false → MobileNav never rendered
//   2. Sidebar renders in desktop mode (no slide-out)
//   3. But Tailwind lg:hidden still hides MobileNav at 1024px
//
// iPad Pro 12.9" in landscape is 1366px — needs to be treated as desktop.
// iPad Mini in landscape at 1024px should still be treated as tablet.
//
// ── Fix ───────────────────────────────────────────────────────────────────────
//
// Shift the mobile/tablet/desktop thresholds:
//   isMobile:       < 768px   (phones in any orientation)
//   isTablet:       768–1179px (iPads in portrait AND landscape)
//   isDesktop:      >= 1180px (laptops, desktops, iPad Pro 12.9" landscape)
//
// This means iPad Mini (744px portrait, 1024px landscape) stays in tablet.
// iPad Pro 12.9" landscape (1366px) correctly becomes desktop.
// MacBook Air (1280px+) correctly becomes desktop.
//
// All Tailwind breakpoint usage in components must align:
//   old: lg:hidden (1024px) → new: xl:hidden (1280px) on MobileNav
//   old: lg:flex   (1024px) → new: xl:flex   (1280px) on Sidebar desktop
//
// ─────────────────────────────────────────────────────────────────────────────

export const useResponsive = () => {
  // ── Core device tiers ─────────────────────────────────────────────────────

  /** Phones — portrait and landscape */
  const isMobile = useMediaQuery('(max-width: 767px)');

  /** Tablets — iPad Mini to iPad Air/Pro in portrait and landscape */
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1179px)');

  /** Laptops and desktops — 1180px+ (iPad Pro 12.9" landscape + all laptops) */
  const isDesktop = useMediaQuery('(min-width: 1180px)');

  // ── Desktop sub-tiers ─────────────────────────────────────────────────────

  /** Small laptops — MacBook Air 13", 1280×800 */
  const isSmallDesktop = useMediaQuery('(min-width: 1180px) and (max-width: 1439px)');

  /** Large laptops / 1080p monitors */
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)');

  /** 2K/4K monitors */
  const isXLDesktop = useMediaQuery('(min-width: 1920px)');

  // ── Orientation ───────────────────────────────────────────────────────────
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isPortrait  = useMediaQuery('(orientation: portrait)');

  // ── Touch capability ──────────────────────────────────────────────────────
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');

  // ── Mobile sub-tiers ─────────────────────────────────────────────────────

  /** Small phones — iPhone SE, older Androids */
  const isSmallMobile = useMediaQuery('(max-width: 389px)');

  /** Standard phones — iPhone 14, Pixel */
  const isStandardMobile = useMediaQuery('(min-width: 390px) and (max-width: 767px)');

  // ── Tablet sub-tiers ─────────────────────────────────────────────────────

  /** Small tablets — iPad Mini portrait (744px) */
  const isSmallTablet = useMediaQuery('(min-width: 768px) and (max-width: 899px)');

  /** Standard tablets — iPad Air, iPad Pro portrait */
  const isStandardTablet = useMediaQuery('(min-width: 900px) and (max-width: 1179px)');

  // ── Derived convenience flags ─────────────────────────────────────────────

  /** Any touch device that should show the mobile navigation bar */
  const showMobileNav = isMobile || isTablet;

  /** Any device that should show the desktop sidebar (always visible) */
  const showDesktopSidebar = isDesktop;

  /** Device tier string for debugging / conditional logic */
  const device =
    isMobile  ? 'mobile'  :
    isTablet  ? 'tablet'  :
    isDesktop ? 'desktop' : 'desktop';

  return {
    // ── Primary tiers (use these in most cases) ──
    isMobile,
    isTablet,
    isDesktop,

    // ── Desktop sub-tiers ──
    isSmallDesktop,
    isLargeDesktop,
    isXLDesktop,

    // ── Mobile sub-tiers ──
    isSmallMobile,
    isStandardMobile,

    // ── Tablet sub-tiers ──
    isSmallTablet,
    isStandardTablet,

    // ── Orientation ──
    isLandscape,
    isPortrait,

    // ── Input ──
    isTouch,

    // ── Convenience ──
    showMobileNav,
    showDesktopSidebar,
    device,
  };
};
import { useState, useRef, useCallback } from "react";

/**
 * useHorizontalScroll
 *
 * Shared hook for horizontal scroll containers used by RecentlyPlayed
 * and DynamicSection. Provides scroll state, event handler, and
 * stable scroll-left / scroll-right callbacks.
 */
export const useHorizontalScroll = (scrollAmount = 320) => {
  const ref                                    = useRef<HTMLDivElement>(null);
  const [showLeft,  setShowLeft]  = useState(false);
  const [showRight, setShowRight] = useState(true);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scrollLeft = useCallback(() => {
    ref.current?.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  }, [scrollAmount]);

  const scrollRight = useCallback(() => {
    ref.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }, [scrollAmount]);

  return { ref, showLeft, showRight, onScroll, scrollLeft, scrollRight };
};
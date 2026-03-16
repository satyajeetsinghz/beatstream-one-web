import { useEffect, useState, useRef, useCallback } from "react";
import {
  subscribeToActiveBanners,
  subscribeToAllBanners,
} from "../services/bannerService";
import { IBanner } from "../types";

export const useBanners = (adminMode = false) => {
  const [allBanners, setAllBanners] = useState<IBanner[]>([]);
  const [banners,    setBanners]    = useState<IBanner[]>([]);
  const [loading,    setLoading]    = useState(true);

  const mountedRef  = useRef(true);

  // ── Fix 1 ─────────────────────────────────────────────────────────────────
  // Error: "Expected 1 arguments, but got 0" + "undefined not assignable to Timeout"
  //
  // useRef<ReturnType<typeof setInterval>>() — no initial value provided.
  // TypeScript infers the type as `ReturnType<typeof setInterval>` (i.e. `Timeout`)
  // but since no argument is passed the actual runtime value is `undefined`.
  // TypeScript correctly rejects `undefined` as not assignable to `Timeout`.
  //
  // Fix: provide `undefined` as the explicit initial value and widen the type
  // to `ReturnType<typeof setInterval> | undefined`. This matches what the
  // cleanup sets it back to (`intervalRef.current = undefined`).
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const getTime = useCallback((value: any): number | null => {
    if (!value) return null;
    try {
      if (typeof value?.toDate === "function") return value.toDate().getTime();
      if (value instanceof Date) return value.getTime();
      if (typeof value === "string" && value.length > 0) {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date.getTime();
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const filterBanners = useCallback((data: IBanner[]) => {
    if (!mountedRef.current) return;

    const now   = Date.now();
    const valid = data.filter((banner) => {
      if (!banner.isActive) return false;
      const start = getTime(banner.startDate);
      const end   = getTime(banner.endDate);
      if (!start && !end)        return true;
      if (start && now < start)  return false;
      if (end   && now > end)    return false;
      return true;
    });

    valid.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    if (mountedRef.current) {
      setBanners((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(valid)) return prev;
        return valid;
      });
    }
  }, [getTime]);

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = adminMode
      ? subscribeToAllBanners((data) => {
          if (!mountedRef.current) return;
          setBanners(data);
          setLoading(false);
        })
      : subscribeToActiveBanners((data) => {
          if (!mountedRef.current) return;
          setAllBanners(data);
          filterBanners(data);
          setLoading(false);
        });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [adminMode, filterBanners]);

  useEffect(() => {
    if (adminMode) return;

    const checkExpiry = () => {
      if (mountedRef.current) filterBanners(allBanners);
    };

    checkExpiry();
    intervalRef.current = setInterval(checkExpiry, 30_000);

    return () => {
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [allBanners, adminMode, filterBanners]);

  return { banners, loading };
};
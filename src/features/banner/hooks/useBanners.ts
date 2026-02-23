import { useEffect, useState } from "react";
import {
  subscribeToActiveBanners,
  subscribeToAllBanners,
} from "../services/bannerService";
import { IBanner } from "../types";

export const useBanners = (adminMode = false) => {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = adminMode
      ? subscribeToAllBanners((data) => {
          setBanners(data);
          setLoading(false);
        })
      : subscribeToActiveBanners((data) => {
          setBanners(data);
          setLoading(false);
        });

    return () => unsubscribe();
  }, [adminMode]);

  return { banners, loading };
};

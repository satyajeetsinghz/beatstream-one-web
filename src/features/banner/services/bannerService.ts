import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { IBanner } from "../types";

// 🔥 For Homepage
export const subscribeToActiveBanners = (
  callback: (banners: IBanner[]) => void
) => {
  const q = query(
    collection(db, "banners"),
    where("isActive", "==", true),
    orderBy("order", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const banners = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IBanner[];

    callback(banners);
  });
};

// 🔥 For Admin Panel
export const subscribeToAllBanners = (
  callback: (banners: IBanner[]) => void
) => {
  const q = query(
    collection(db, "banners"),
    orderBy("order", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const banners = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IBanner[];

    callback(banners);
  });
};

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase/config";

export const getUserProfile = async (uid: string) => {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return null;

  return snap.data();
};

export const updateUserProfile = async (
  uid: string,
  data: { displayName?: string; photoURL?: string }
) => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
};

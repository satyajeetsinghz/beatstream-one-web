import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase/config";

export const useAuth = () => {
  return useContext(AuthContext);
};

export const fetchUserRole = async (uid: string) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data()?.role : "user";
};

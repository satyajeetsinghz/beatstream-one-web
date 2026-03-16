import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/services/firebase/config";

export const updateUserRole = async (
  uid: string,
  role: "user" | "admin"
) => {

  await updateDoc(doc(db, "users", uid), {
    role
  });

};

export const updateUserStatus = async (
  uid: string,
  status: "active" | "banned" | "suspended"
) => {

  await updateDoc(doc(db, "users", uid), {
    status
  });

};

export const deleteUser = async (uid: string) => {

  await deleteDoc(doc(db, "users", uid));

};
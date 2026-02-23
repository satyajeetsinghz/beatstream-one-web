import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";

// Create Section
export const createSection = async (title: string) => {
  await addDoc(collection(db, "sections"), {
    title: title.trim(),
    isActive: true,
    createdAt: serverTimestamp(),
  });
};

// Update Section Title
export const updateSection = async (
  id: string,
  newTitle: string
) => {
  const ref = doc(db, "sections", id);
  await updateDoc(ref, {
    title: newTitle.trim(),
  });
};

// Toggle Active
export const toggleSectionStatus = async (
  id: string,
  currentStatus: boolean
) => {
  const ref = doc(db, "sections", id);
  await updateDoc(ref, {
    isActive: !currentStatus,
  });
};

// Delete
export const deleteSection = async (id: string) => {
  const ref = doc(db, "sections", id);
  await deleteDoc(ref);
};

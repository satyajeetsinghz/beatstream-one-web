import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { IUser } from "../types";

export const createUserIfNotExists = async (
  firebaseUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  },
  role: "user" | "admin" = "user"
): Promise<IUser> => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const newUser: IUser = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName ?? "",
      email: firebaseUser.email ?? "",
      photoURL: firebaseUser.photoURL ?? "",
      role: role,
      createdAt: new Date(),
    };

    await setDoc(userRef, newUser);
    return newUser;
  }

  return snapshot.data() as IUser;
};

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { IUser } from "../types";

export const useUsers = () => {

  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {

        const data = snapshot.docs.map(doc => ({
          ...(doc.data() as IUser),
          uid: doc.id
        }));

        setUsers(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();

  }, []);

  return { users, loading };
};
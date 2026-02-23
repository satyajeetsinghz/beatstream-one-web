import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";
import { ISection } from "../types";

export const useSections = () => {
  const [sections, setSections] = useState<ISection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "sections"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ISection[];

      setSections(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { sections, loading };
};

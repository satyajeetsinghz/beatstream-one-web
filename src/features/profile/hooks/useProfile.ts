import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getUserProfile, updateUserProfile } from "../services/profileService";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;

      const data = await getUserProfile(user.uid);
      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [user?.uid]);

  const updateProfile = async (data: any) => {
    if (!user?.uid) return;
    await updateUserProfile(user.uid, data);
    setProfile((prev: any) => ({ ...prev, ...data }));
  };

  return { profile, loading, updateProfile };
};

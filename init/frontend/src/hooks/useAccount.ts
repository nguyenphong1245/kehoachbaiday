import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import type {
  User,
  UserProfile,
  UserProfileUpdatePayload,
  UserSettings,
  UserSettingsUpdatePayload,
} from "@/types/auth";
import {
  getUser,
  getUserProfile,
  getUserSettings,
  updateUserProfile,
  updateUserSettings,
} from "@/services/accountService";
import { setStoredAuthUser } from "@/utils/authStorage";

interface UseAccountOptions {
  userId: number | null;
}

const parseErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail ?? err.message;
    return Array.isArray(detail) ? detail.join(", ") : String(detail);
  }
  return "Unexpected error. Please try again.";
};

const useAccount = ({ userId }: UseAccountOptions) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [userData, profileData, settingsData] = await Promise.all([
        getUser(userId),
        getUserProfile(userId),
        getUserSettings(userId),
      ]);
      setUser(userData);
      setProfile(profileData);
      setSettings(settingsData);
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveProfile = useCallback(
    async (payload: UserProfileUpdatePayload) => {
      if (!userId) return null;
      setError(null);
      try {
        const updated = await updateUserProfile(userId, payload);
        setProfile(updated);
        if (user) {
          const nextUser = { ...user, profile: updated } as User;
          setUser(nextUser);
          setStoredAuthUser(nextUser);
        }
        return updated;
      } catch (err) {
        const message = parseErrorMessage(err);
        setError(message);
        throw err;
      }
    },
    [user, userId],
  );

  const saveSettings = useCallback(
    async (payload: UserSettingsUpdatePayload) => {
      if (!userId) return null;
      setError(null);
      try {
        const updated = await updateUserSettings(userId, payload);
        setSettings(updated);
        if (user) {
          const nextUser = { ...user, settings: updated } as User;
          setUser(nextUser);
          setStoredAuthUser(nextUser);
        }
        return updated;
      } catch (err) {
        const message = parseErrorMessage(err);
        setError(message);
        throw err;
      }
    },
    [user, userId],
  );

  const resetError = useCallback(() => setError(null), []);

  return {
    user,
    profile,
    settings,
    isLoading,
    error,
    refresh: load,
    resetError,
    saveProfile,
    saveSettings,
  };
};

export default useAccount;

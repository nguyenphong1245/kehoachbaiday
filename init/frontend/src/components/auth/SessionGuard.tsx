import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredAuthUser } from "@/utils/authStorage";

/**
 * SessionGuard: Detects when user logs in from another tab
 * and forces current tab to reload/logout to prevent conflicts
 */
const SessionGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user when component mounts
    const initialUser = getStoredAuthUser();
    const initialUserId = initialUser?.id;

    // Listen for storage changes (login from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      // Check if auth_user key changed
      if (e.key === "auth_user") {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        const newUserId = newUser?.id;

        // If user changed (different user or logged out)
        if (newUserId !== initialUserId) {
          // Force reload to apply new session
          window.location.href = "/login";
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  return null;
};

export default SessionGuard;

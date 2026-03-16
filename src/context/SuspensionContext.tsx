import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface SuspensionContextValue {
  isSuspended: boolean;       // user has suspended status
  hasAcknowledged: boolean;   // user clicked "Continue Anyway"
  acknowledge: () => void;    // let them into the app
  showToast: boolean;         // periodic reminder toast visible
  dismissToast: () => void;   // user dismisses toast
}

const SuspensionContext = createContext<SuspensionContextValue>({
  isSuspended:     false,
  hasAcknowledged: false,
  acknowledge:     () => {},
  showToast:       false,
  dismissToast:    () => {},
});

const REMINDER_INTERVAL_MS = 60_000; // 1 minute

export const SuspensionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const isSuspended = user?.status === "suspended";

  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [showToast,        setShowToast]       = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const acknowledge = useCallback(() => {
    setHasAcknowledged(true);
  }, []);

  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  // Start periodic reminder once user acknowledges and is in the app
  useEffect(() => {
    if (!isSuspended || !hasAcknowledged) {
      // Clear any running interval if status changed or user left
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Show first toast after the interval (not immediately on entry)
    intervalRef.current = setInterval(() => {
      setShowToast(true);
    }, REMINDER_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSuspended, hasAcknowledged]);

  // Reset acknowledged state if user logs out or status changes
  useEffect(() => {
    if (!isSuspended) {
      setHasAcknowledged(false);
      setShowToast(false);
    }
  }, [isSuspended]);

  return (
    <SuspensionContext.Provider
      value={{
        isSuspended,
        hasAcknowledged,
        acknowledge,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </SuspensionContext.Provider>
  );
};

export const useSuspension = () => useContext(SuspensionContext);
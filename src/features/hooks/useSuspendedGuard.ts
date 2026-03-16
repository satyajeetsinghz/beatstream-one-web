import { useCallback } from "react";
import { useSuspension } from "@/context/SuspensionContext";

/**
 * useSuspendedGuard
 *
 * Use this hook in any feature that writes to Firestore (likes, playlists,
 * history) to silently block the action for suspended users.
 *
 * Usage:
 *   const { guardAction, isSuspended } = useSuspendedGuard();
 *
 *   const handleLike = guardAction(async () => {
 *     await toggleLikeTransaction(user.uid, songId);
 *   });
 *
 * The wrapped function becomes a no-op for suspended users.
 * Optionally show a tooltip or disabled state using `isSuspended`.
 */
export const useSuspendedGuard = () => {
  const { isSuspended } = useSuspension();

  const guardAction = useCallback(
    <T extends (...args: any[]) => any>(fn: T): T => {
      return ((...args: Parameters<T>) => {
        if (isSuspended) {
          // Silently block — the banner and periodic toast already inform the user
          return;
        }
        return fn(...args);
      }) as T;
    },
    [isSuspended]
  );

  return { guardAction, isSuspended };
};
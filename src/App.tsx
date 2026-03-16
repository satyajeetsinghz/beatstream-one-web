import { RouterProvider } from "react-router-dom";
import router from "@/app/router";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { PlayerProvider } from "./features/player/context/PlayerContext";
import { SuspensionProvider, useSuspension } from "@/context/SuspensionContext";
import AnimatedSpinner from "./components/ui/LoadingSpinner/AnimatedSpinner";
import BlockedUserScreen from "./components/common/BlockedUserScreen";
import SuspendedScreen from "./components/common/SuspendedScreen";
import SuspensionBanner from "./components/common/SuspensionBanner";
// import SuspensionToast from "./components/common/SuspensionToast";
import { useAuth } from "@/features/auth/hooks/useAuth";

const AppContent = () => {
  const { user, loading } = useAuth();
  const { isSuspended, hasAcknowledged } = useSuspension();

  // ── Banned: full block, no way in ──────────────────────────────────────────
  if (user?.status === "banned") {
    return <BlockedUserScreen />;
  }

  // ── Suspended: show screen until acknowledged, then limited app access ─────
  if (isSuspended && !hasAcknowledged) {
    return <SuspendedScreen />;
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AnimatedSpinner size={28} color="#fa243c" />
          <p className="text-sm text-gray-400 font-medium">BeatStream Beta</p>
        </div>
      </div>
    );
  }

  // ── App ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Persistent banner + periodic toast shown while suspended in app */}
      {isSuspended && hasAcknowledged && (
        <>
          <SuspensionBanner />
          {/* <SuspensionToast /> */}
        </>
      )}
      <RouterProvider router={router} />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <SuspensionProvider>
          <AppContent />
        </SuspensionProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
import { RouterProvider } from "react-router-dom";
import router from "@/app/router";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PlayerProvider } from "./features/player/context/PlayerContext";

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Apple-style spinner */}
          <div className="w-8 h-8 border-2 border-[#fea1be] border-t-[#FA2E6E] rounded-full animate-spin"></div>

          {/* Loading text */}
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;

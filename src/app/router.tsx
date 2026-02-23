import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import LikedSongs from "@/features/likes/pages/LikedSongs";
import AdminPage from "@/features/admin/pages/AdminPage";
import ProfilePage from "@/features/profile/ProfilePage";
import ProtectedAdminRoute from "@/features/admin/components/ProtectedAdminRoute";
import PlaylistPage from "@/features/playlists/pages/PlaylistPage";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "search",
        element: <div>Search Page</div>,
      },
      {
        path: "library",
        element: <div>Library Page</div>,
      },
      {
        path: "liked",
        element: <LikedSongs />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminPage />
      </ProtectedAdminRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProfilePage />
    ),
  },
  {
    path: "/playlist/:id",
    element: (
      <PlaylistPage />
    ),
  },
]);


export default router;
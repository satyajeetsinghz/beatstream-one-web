import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
// import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <CircularProgress size={40} className="text-gray-400" />
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <Navigate 
        to="/" 
        replace 
        state={{ 
          from: 'admin-route',
          message: 'You need admin privileges to access this page' 
        }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
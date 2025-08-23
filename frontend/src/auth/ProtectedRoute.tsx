import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

interface Props {
  role?: string;
}

const ProtectedRoute = ({ role }: Props) => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !user.id) {
    return <Navigate to="/auth/login" />;
  }
  // Check role if specified
  if (role && user.role !== role) {
    return <p>Access denied</p>;
  }

  return <Outlet />;
};

export default ProtectedRoute;

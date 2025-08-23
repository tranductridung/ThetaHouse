import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (user && user.id) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

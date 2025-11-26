import { Navigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, authChecked } = useApp();

  // If auth hasn't been checked yet, show loading — let the app finish
  // the initial refresh attempt (avoids flashing to /signin on page reload).
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

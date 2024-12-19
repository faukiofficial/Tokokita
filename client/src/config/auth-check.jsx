import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-slate-100">
    <div className="loader"></div>
    <style jsx>{`
      .loader {
        border: 8px solid rgba(0, 0, 0, 0.1);
        border-top: 8px solid #ea580c;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

const NoneProtectedRoute = ({ children }) => {
  const { checkAuthLoading } = useSelector((state) => state.auth);

  if (checkAuthLoading) {
    return <LoadingSpinner />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, checkAuthLoading } = useSelector((state) => state.auth);

  if (checkAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && !user && !checkAuthLoading) {
    return <Navigate to="/auth/login" />;
  }

  if (user?.role === "user" && !checkAuthLoading) {
    return <Navigate to="/shop/products" />;
  }

  return children;
};

const UserRoute = ({ children }) => {
  const { isAuthenticated, user, checkAuthLoading } = useSelector((state) => state.auth);

  if (checkAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && !user && !checkAuthLoading) {
    return <Navigate to="/auth/login" />;
  }

  if (user?.role === "admin" && !checkAuthLoading) {
    return <Navigate to="/admin/products" />;
  }

  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, user, checkAuthLoading } = useSelector((state) => state.auth);

  if (checkAuthLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return user?.role === "admin" ? <Navigate to="/admin/products" /> : <Navigate to="/shop/products" />;
  }

  return children;
};

export { AdminRoute, UserRoute, AuthRoute, NoneProtectedRoute };

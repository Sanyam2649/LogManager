import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const adminToken = sessionStorage.getItem("admin_access_token");

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

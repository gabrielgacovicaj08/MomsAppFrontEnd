import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getStoredToken, isCurrentUserAdmin } from "../utils/auth";

type AdminRouteProps = {
  children: ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!isCurrentUserAdmin()) {
    return <Navigate to="/assignments" replace />;
  }

  return <>{children}</>;
}

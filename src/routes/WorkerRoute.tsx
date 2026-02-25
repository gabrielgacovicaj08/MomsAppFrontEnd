import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getStoredToken, isCurrentUserAdmin } from "../utils/auth";

type WorkerRouteProps = {
  children: ReactNode;
};

export default function WorkerRoute({ children }: WorkerRouteProps) {
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (isCurrentUserAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

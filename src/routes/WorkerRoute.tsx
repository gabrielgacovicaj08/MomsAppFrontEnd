import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isCurrentUserAdmin } from "../utils/auth";

type WorkerRouteProps = {
  children: ReactNode;
};

export default function WorkerRoute({ children }: WorkerRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (isCurrentUserAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

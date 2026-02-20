import AdminDashboard from "./admin/AdminDashboard";
import useAdminDashboard from "./admin/useAdminDashboard";

export default function AdminPage() {
  const controller = useAdminDashboard();
  return <AdminDashboard {...controller} />;
}

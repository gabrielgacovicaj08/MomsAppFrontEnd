import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";

import HomePage from "./pages/HomePage";
import AssignmentsPage from "./pages/AssignmentsPage";
import AdminPage from "./pages/AdminPage";
import AdminRoute from "./routes/AdminRoute";
import WorkerPage from "./pages/WorkerPage";
import WorkerRoute from "./routes/WorkerRoute";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminPage />
      </AdminRoute>
    ),
  },
  {
    path: "/worker",
    element: (
      <WorkerRoute>
        <WorkerPage />
      </WorkerRoute>
    ),
  },
  { path: "/assignments", element: <AssignmentsPage /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

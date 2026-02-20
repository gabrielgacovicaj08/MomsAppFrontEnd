import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAssignmentsByDay } from "../services/assignments";
import type { Assignment } from "../types/assignments";
import { getCurrentUserDisplayName, isCurrentUserAdmin } from "../utils/auth";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function WorkerPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(getToday());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    if (isCurrentUserAdmin()) {
      navigate("/admin");
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setLoading(true);
        setError(null);
        const response = await getAssignmentsByDay(date);
        setAssignments(response.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load assignments.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [date]);

  const upcomingCount = useMemo(
    () =>
      assignments.filter(
        (assignment) => assignment.status?.toLowerCase() !== "completed",
      ).length,
    [assignments],
  );

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-700">Worker</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
              Welcome, {getCurrentUserDisplayName()}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              View your day and keep track of assignments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              navigate("/");
            }}
            className="rounded-2xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            Log out
          </button>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Assignments Today</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{assignments.length}</p>
          </div>
          <div className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Upcoming</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{upcomingCount}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-teal-900/10 bg-white/90 p-5 shadow-[0_18px_60px_-35px_rgba(2,44,34,0.6)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="worker-date" className="text-sm font-semibold text-slate-700">
              Assignment date
            </label>
            <Link to="/assignments" className="text-sm font-semibold text-teal-700 hover:underline">
              Open full assignments page
            </Link>
          </div>
          <input
            id="worker-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-3 w-full max-w-xs rounded-2xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        {loading && (
          <div className="mt-6 rounded-2xl border border-teal-900/10 bg-white p-4 text-sm text-slate-600">
            Loading assignments...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && assignments.length === 0 && (
          <div className="mt-6 rounded-2xl border border-teal-900/10 bg-white p-6 text-center shadow-sm">
            <p className="font-semibold text-slate-800">No assignments found.</p>
            <p className="mt-1 text-sm text-slate-600">Try another date.</p>
          </div>
        )}

        {!loading && !error && assignments.length > 0 && (
          <div className="mt-6 grid gap-4">
            {assignments.map((assignment) => (
              <article
                key={assignment.assignment_id}
                className="rounded-2xl border border-teal-900/10 bg-white/95 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {assignment.structure_name}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {assignment.first_name} {assignment.last_name}
                    </p>
                  </div>
                  <span className="rounded-full bg-gradient-to-r from-teal-900 to-emerald-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {assignment.status}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-slate-900">Date:</span>{" "}
                    {assignment.work_date}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Shift:</span>{" "}
                    {assignment.shift_start && assignment.shift_end
                      ? `${assignment.shift_start} - ${assignment.shift_end}`
                      : "Not set"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

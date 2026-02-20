import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssignmentsByDay } from "../services/assignments";
import type { Assignment } from "../types/assignments";

export default function AssignmentsPage() {
  const [date, setDate] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setAssignments([]);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAssignmentsByDay(date);
        setAssignments(data.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load assignments.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [date]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-700">MomsApp</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Daily Assignments</h1>
            <p className="mt-1 text-sm text-slate-600">
              Pick a date to view all scheduled assignments.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-2xl border border-teal-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-teal-50"
          >
            Back to Home
          </Link>
        </div>

        <div className="rounded-[28px] border border-teal-900/10 bg-white/90 p-5 shadow-[0_18px_60px_-35px_rgba(2,44,34,0.6)] backdrop-blur-sm">
          <label
            htmlFor="assignment-date"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Assignment Date
          </label>
          <input
            id="assignment-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full max-w-xs rounded-2xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        {loading && (
          <div className="mt-6 rounded-2xl border border-teal-900/10 bg-white p-4 text-sm text-slate-600 shadow-sm">
            Loading assignments...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && date && assignments.length === 0 && (
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
                className="rounded-2xl border border-teal-900/10 bg-white/95 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {assignment.first_name} {assignment.last_name}
                    </h2>
                    <p className="text-sm text-slate-600">{assignment.structure_name}</p>
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

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import useI18n from "../i18n/useI18n";
import { getAssignmentsByEmployeeId } from "../services/assignments";
import { createWorkLog } from "../services/workLogs";
import type { Assignment } from "../types/assignments";
import {
  clearAuthTokens,
  getCurrentUserDisplayName,
  getCurrentUserEmployeeId,
  getStoredToken,
  isCurrentUserAdmin,
} from "../utils/auth";

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localInputToDateTime7(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) return null;

  const date = match[1];
  const hours = match[2];
  const minutes = match[3];
  const seconds = match[4] ?? "00";
  return `${date}T${hours}:${minutes}:${seconds}.0000000`;
}

export default function WorkerPage() {
  const { t } = useI18n();
  const toArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);
  const navigate = useNavigate();
  const [date, setDate] = useState(getToday());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(
    null,
  );
  const [completingAssignmentId, setCompletingAssignmentId] = useState<number | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [startedAtInput, setStartedAtInput] = useState("");
  const [endedAtInput, setEndedAtInput] = useState("");
  const currentWorkerName = useMemo(() => getCurrentUserDisplayName(), []);
  const currentWorkerId = useMemo(() => getCurrentUserEmployeeId(), []);

  useEffect(() => {
    const token = getStoredToken();
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
        if (!currentWorkerId) {
          setAssignments([]);
          setError(t("Employee ID is missing from your login token."));
          return;
        }

        const response = await getAssignmentsByEmployeeId(currentWorkerId);
        const assignmentsData = toArray<Assignment>(response.data);
        setAssignments(
          assignmentsData.filter(
            (assignment) =>
              typeof assignment.work_date === "string" &&
              assignment.work_date.startsWith(date),
          ),
        );
        setSelectedAssignmentId(null);
        setStartedAtInput("");
        setEndedAtInput("");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : t("Failed to load assignments.");
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [date, currentWorkerId, t]);

  const handleCompleteAssignment = async (assignmentId: number) => {
    if (!currentWorkerId) {
      setActionError(t("Employee ID is missing from your login token."));
      return;
    }

    try {
      setCompletingAssignmentId(assignmentId);
      setActionError(null);
      setActionSuccess(null);

      if (!startedAtInput || !endedAtInput) {
        setActionError(t("Please set both start and end time before submitting."));
        return;
      }

      const startedAt = localInputToDateTime7(startedAtInput);
      const endedAt = localInputToDateTime7(endedAtInput);

      if (!startedAt || !endedAt) {
        setActionError(t("Invalid date/time format for start or end."));
        return;
      }

      if (new Date(startedAtInput) > new Date(endedAtInput)) {
        setActionError(t("End time must be after start time."));
        return;
      }

      await createWorkLog({
        assignment_id: String(assignmentId),
        started_at: startedAt,
        ended_at: endedAt,
        notes: t("Completed by worker."),
      });

      setAssignments((current) =>
        current.map((assignment) =>
          assignment.assignment_id === assignmentId
            ? { ...assignment, status: "Completed" }
            : assignment,
        ),
      );
      setActionSuccess(t("Work log submitted. Assignment marked as completed."));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("Failed to submit work log.");
      setActionError(message);
    } finally {
      setCompletingAssignmentId(null);
    }
  };

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
            <p className="text-xs uppercase tracking-[0.22em] text-teal-700">{t("Worker")}</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
              {t("Welcome, {name}", { name: currentWorkerName })}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {t("View your day and keep track of assignments.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearAuthTokens();
              navigate("/");
            }}
            className="rounded-2xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            {t("Log out")}
          </button>
        </div>
        <LanguageSwitcher />

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {t("Assignments Today")}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{assignments.length}</p>
          </div>
          <div className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{t("Upcoming")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{upcomingCount}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-teal-900/10 bg-white/90 p-5 shadow-[0_18px_60px_-35px_rgba(2,44,34,0.6)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="worker-date" className="text-sm font-semibold text-slate-700">
              {t("Assignment date")}
            </label>
            <Link to="/assignments" className="text-sm font-semibold text-teal-700 hover:underline">
              {t("Open full assignments page")}
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
            {t("Loading assignments...")}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {actionError && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {actionSuccess}
          </div>
        )}

        {!loading && !error && assignments.length === 0 && (
          <div className="mt-6 rounded-2xl border border-teal-900/10 bg-white p-6 text-center shadow-sm">
            <p className="font-semibold text-slate-800">{t("No assignments found.")}</p>
            <p className="mt-1 text-sm text-slate-600">{t("Try another date.")}</p>
          </div>
        )}

        {!loading && !error && assignments.length > 0 && (
          <div className="mt-6 grid gap-4">
            {assignments.map((assignment) => (
              <article
                key={assignment.assignment_id}
                onClick={() => {
                  setActionError(null);
                  setActionSuccess(null);
                  setSelectedAssignmentId((current) =>
                    current === assignment.assignment_id
                      ? null
                      : assignment.assignment_id,
                  );
                  setStartedAtInput("");
                  setEndedAtInput("");
                }}
                className={`rounded-2xl border bg-white/95 p-4 shadow-sm transition ${
                  selectedAssignmentId === assignment.assignment_id
                    ? "border-teal-500 ring-2 ring-teal-100"
                    : "border-teal-900/10"
                }`}
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
                    <span className="font-semibold text-slate-900">{t("Date:")}</span>{" "}
                    {assignment.work_date ?? t("Not set")}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">{t("Shift:")}</span>{" "}
                    {assignment.shift_start && assignment.shift_end
                      ? `${assignment.shift_start} - ${assignment.shift_end}`
                      : t("Not set")}
                  </p>
                </div>

                {selectedAssignmentId === assignment.assignment_id && (
                  <div className="mt-4">
                    <div className="mb-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {t("Started At")}
                        </label>
                        <input
                          type="datetime-local"
                          value={startedAtInput}
                          onChange={(event) => setStartedAtInput(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {t("Ended At")}
                        </label>
                        <input
                          type="datetime-local"
                          value={endedAtInput}
                          onChange={(event) => setEndedAtInput(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleCompleteAssignment(assignment.assignment_id);
                      }}
                      disabled={
                        completingAssignmentId === assignment.assignment_id ||
                        !startedAtInput ||
                        !endedAtInput ||
                        assignment.status?.toLowerCase() === "completed"
                      }
                      className="rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {assignment.status?.toLowerCase() === "completed"
                        ? t("Already Completed")
                        : completingAssignmentId === assignment.assignment_id
                          ? t("Submitting...")
                          : t("Mark as Completed")}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

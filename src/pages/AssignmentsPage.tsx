import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import useI18n from "../i18n/useI18n";
import {
  createAssignment,
  getAssignmentsByDay,
} from "../services/assignments";
import { createWorkLog } from "../services/workLogs";
import { getStructures, type Structure } from "../services/structures";
import { getAvailableEmployeesPerDay, type Worker } from "../services/workers";
import type { Assignment } from "../types/assignments";
import { isCurrentUserAdmin } from "../utils/auth";

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

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number): string | null {
  const baseDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(baseDate.getTime())) return null;
  baseDate.setDate(baseDate.getDate() + days);
  return formatDateLocal(baseDate);
}

export default function AssignmentsPage() {
  const { t } = useI18n();
  const toArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);
  const [date, setDate] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [structureId, setStructureId] = useState("");
  const [assignmentDays, setAssignmentDays] = useState("1");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(
    null,
  );
  const [startedAtInput, setStartedAtInput] = useState("");
  const [endedAtInput, setEndedAtInput] = useState("");
  const [workLogNotes, setWorkLogNotes] = useState(t("Completed by admin."));
  const [isSavingWorkLog, setIsSavingWorkLog] = useState(false);
  const [workLogMessage, setWorkLogMessage] = useState<string | null>(null);
  const isAdmin = isCurrentUserAdmin();

  useEffect(() => {
    async function fetchMeta() {
      try {
        setMetaLoading(true);
        const structuresResponse = await getStructures();
        const structuresData = toArray<Structure>(structuresResponse.data);
        setStructures(structuresData.filter((structure) => structure.is_active));
      } catch {
        setCreateError(t("Failed to load structures."));
      } finally {
        setMetaLoading(false);
      }
    }

    fetchMeta();
  }, [t]);

  useEffect(() => {
    if (!date) {
      setAssignments([]);
      setWorkers([]);
      setEmployeeId("");
      setSelectedAssignmentId(null);
      setStartedAtInput("");
      setEndedAtInput("");
      setWorkLogMessage(null);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setWorkersLoading(true);
        setError(null);
        setCreateError(null);

        const [assignmentsResponse, workersResponse] = await Promise.all([
          getAssignmentsByDay(date),
          getAvailableEmployeesPerDay(date),
        ]);

        const assignmentsData = toArray<Assignment>(assignmentsResponse.data);
        const workersData = toArray<Worker>(workersResponse.data);
        setAssignments(assignmentsData);
        setWorkers(workersData.filter((worker) => worker.is_active));
        setSelectedAssignmentId(null);
        setStartedAtInput("");
        setEndedAtInput("");
        setWorkLogMessage(null);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("Failed to load assignments or available workers.");
        setError(message);
      } finally {
        setLoading(false);
        setWorkersLoading(false);
      }
    }

    fetchData();
  }, [date, t]);

  const toApiTime = (value: string) => {
    if (!value) {
      return null;
    }

    return value.length === 5 ? `${value}:00` : value;
  };

  const handleCreateAssignment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!date) {
      setCreateError(t("Please select an assignment date first."));
      return;
    }

    if (!employeeId || !structureId) {
      setCreateError(t("Please select a worker and a structure."));
      return;
    }

    const numberOfDays = Number.parseInt(assignmentDays, 10);
    if (!Number.isInteger(numberOfDays) || numberOfDays < 1) {
      setCreateError(t("Please enter a valid number of days."));
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);
      setCreateSuccess(null);

      let createdCount = 0;
      let lastErrorMessage = "";

      for (let offset = 0; offset < numberOfDays; offset += 1) {
        const targetDate = addDays(date, offset);
        if (!targetDate) {
          lastErrorMessage = t("Please select an assignment date first.");
          continue;
        }

        try {
          await createAssignment({
            work_date: targetDate,
            employee_id: Number(employeeId),
            structure_id: Number(structureId),
            shift_start: toApiTime(shiftStart),
            shift_end: toApiTime(shiftEnd),
          });
          createdCount += 1;
        } catch (err: unknown) {
          lastErrorMessage =
            err instanceof Error ? err.message : t("Failed to create assignment.");
        }
      }

      if (createdCount === numberOfDays) {
        setCreateSuccess(
          numberOfDays === 1
            ? t("Assignment created.")
            : t("Created {count} assignments.", { count: createdCount }),
        );
      } else if (createdCount > 0) {
        setCreateError(
          `${t("Created {count} assignments.", { count: createdCount })} ${t(
            "Some assignments could not be created.",
          )} ${lastErrorMessage}`.trim(),
        );
      } else {
        setCreateError(lastErrorMessage || t("Failed to create assignment."));
      }

      setShiftStart("");
      setShiftEnd("");

      const refreshed = await getAssignmentsByDay(date);
      setAssignments(toArray<Assignment>(refreshed.data));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("Failed to create assignment.");
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitWorkLog = async () => {
    if (!selectedAssignmentId) {
      setWorkLogMessage(t("Select an assignment first."));
      return;
    }

    if (!startedAtInput || !endedAtInput) {
      setWorkLogMessage(t("Started at and ended at are required."));
      return;
    }

    const startedAt = localInputToDateTime7(startedAtInput);
    const endedAt = localInputToDateTime7(endedAtInput);
    if (!startedAt || !endedAt) {
      setWorkLogMessage(t("Invalid start/end date-time format."));
      return;
    }

    if (new Date(startedAtInput) > new Date(endedAtInput)) {
      setWorkLogMessage(t("Ended at must be after started at."));
      return;
    }

    try {
      setIsSavingWorkLog(true);
      setWorkLogMessage(null);

      await createWorkLog({
        assignment_id: String(selectedAssignmentId),
        started_at: startedAt,
        ended_at: endedAt,
        notes: workLogNotes.trim() || t("Completed by admin."),
      });

      setAssignments((current) =>
        current.map((assignment) =>
          assignment.assignment_id === selectedAssignmentId
            ? { ...assignment, status: "Completed" }
            : assignment,
        ),
      );
      setWorkLogMessage(t("Work log submitted successfully."));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("Failed to submit work log.");
      setWorkLogMessage(message);
    } finally {
      setIsSavingWorkLog(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-700">
              {t("MomsApp")}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
              {t("Daily Assignments")}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {t("Pick a date to view all scheduled assignments.")}
            </p>
          </div>
          <Link
            to="/admin"
            className="rounded-2xl border border-teal-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-teal-50"
          >
            {t("Back to Home")}
          </Link>
        </div>
        <LanguageSwitcher />

        <div className="rounded-[28px] border border-teal-900/10 bg-white/90 p-5 shadow-[0_18px_60px_-35px_rgba(2,44,34,0.6)] backdrop-blur-sm">
          <label
            htmlFor="assignment-date"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            {t("Assignment Date")}
          </label>
          <input
            id="assignment-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full max-w-xs rounded-2xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />

          <form onSubmit={handleCreateAssignment} className="mt-5 grid gap-3">
            <p className="text-sm font-semibold text-slate-800">
              {t("Create Assignment")}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={!date || workersLoading}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:opacity-60"
              >
                <option value="">
                  {!date
                    ? t("Select a date first")
                    : workersLoading
                      ? t("Loading workers...")
                      : t("Select worker")}
                </option>
                {workers.map((worker) => (
                  <option key={worker.employee_id} value={worker.employee_id}>
                    {worker.first_name} {worker.last_name}
                  </option>
                ))}
              </select>

              <select
                value={structureId}
                onChange={(e) => setStructureId(e.target.value)}
                disabled={metaLoading}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:opacity-60"
              >
                <option value="">{t("Select structure")}</option>
                {structures.map((structure) => (
                  <option
                    key={structure.structure_id}
                    value={structure.structure_id}
                  >
                    {structure.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                min={1}
                step={1}
                value={assignmentDays}
                onChange={(event) => setAssignmentDays(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                placeholder={t("Number of days")}
              />
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isCreating || metaLoading}
                className="rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? t("Creating...") : t("Create Assignment")}
              </button>
              <p className="text-xs text-slate-500">
                {t("Shift times are optional.")}
              </p>
            </div>

            {createError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {createError}
              </p>
            )}

            {createSuccess && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {createSuccess}
              </p>
            )}
          </form>
        </div>

        {loading && (
          <div className="mt-6 rounded-2xl border border-teal-900/10 bg-white p-4 text-sm text-slate-600 shadow-sm">
            {t("Loading assignments...")}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && date && assignments.length === 0 && (
          <div className="mt-6 rounded-2xl border border-teal-900/10 bg-white p-6 text-center shadow-sm">
            <p className="font-semibold text-slate-800">
              {t("No assignments found.")}
            </p>
            <p className="mt-1 text-sm text-slate-600">{t("Try another date.")}</p>
          </div>
        )}

        {!loading && !error && assignments.length > 0 && (
          <div className="mt-6 grid gap-4">
            {assignments.map((assignment) => (
              <article
                key={assignment.assignment_id}
                className={`rounded-2xl border bg-white/95 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedAssignmentId === assignment.assignment_id
                    ? "border-teal-500 ring-2 ring-teal-100"
                    : "border-teal-900/10"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {assignment.first_name} {assignment.last_name}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {assignment.structure_name}
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

                {isAdmin && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setWorkLogMessage(null);
                        setSelectedAssignmentId((current) =>
                          current === assignment.assignment_id
                            ? null
                            : assignment.assignment_id,
                        );
                        setStartedAtInput("");
                        setEndedAtInput("");
                      }}
                      className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100"
                    >
                      {selectedAssignmentId === assignment.assignment_id
                        ? t("Hide Work Log")
                        : t("Submit Work Log")}
                    </button>
                  </div>
                )}
              </article>
            ))}

            {isAdmin && selectedAssignmentId && (
              <div className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{t("Submit Work Log")}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      {t("Started At")}
                    </label>
                    <input
                      type="datetime-local"
                      value={startedAtInput}
                      onChange={(event) => setStartedAtInput(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      {t("Ended At")}
                    </label>
                    <input
                      type="datetime-local"
                      value={endedAtInput}
                      onChange={(event) => setEndedAtInput(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    {t("Notes")}
                  </label>
                  <textarea
                    value={workLogNotes}
                    onChange={(event) => setWorkLogNotes(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {workLogMessage && (
                  <p
                    className={`mt-2 text-sm ${
                      workLogMessage.toLowerCase().includes("success")
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {workLogMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    void handleSubmitWorkLog();
                  }}
                  disabled={isSavingWorkLog || !startedAtInput || !endedAtInput}
                  className="mt-3 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingWorkLog ? t("Submitting...") : t("Submit Work Log")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

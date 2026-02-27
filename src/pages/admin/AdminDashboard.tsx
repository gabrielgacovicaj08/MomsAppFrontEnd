import { Link } from "react-router-dom";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import useI18n from "../../i18n/useI18n";
import type { AdminDashboardController } from "./useAdminDashboard";

function getStructureImageUrl(structureName: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(structureName)}/800/480`;
}

function getWorkerImageUrl(fullName: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(fullName)}/800/480`;
}

export default function AdminDashboard(controller: AdminDashboardController) {
  const { t } = useI18n();
  const {
    date,
    setDate,
    loading,
    error,
    stats,
    assignments,
    structures,
    workers,
    workerForm,
    setWorkerForm,
    structureForm,
    setStructureForm,
    isSavingWorker,
    isSavingStructure,
    workerMessage,
    structureMessage,
    selectedStructure,
    structureEditForm,
    setStructureEditForm,
    isStructureAssignOpen,
    handleToggleStructureAssignPanel,
    structureAssignDate,
    handleStructureAssignDateChange,
    structureAssignDays,
    setStructureAssignDays,
    structureAssignShiftStart,
    setStructureAssignShiftStart,
    structureAssignShiftEnd,
    setStructureAssignShiftEnd,
    availableStructureWorkers,
    selectedStructureWorkerIds,
    handleToggleStructureWorkerSelection,
    isLoadingStructureWorkers,
    isAssigningStructure,
    structureAssignMessage,
    isUpdatingStructure,
    isTogglingStructureId,
    structureModalMessage,
    selectedWorker,
    workerEditForm,
    setWorkerEditForm,
    isUpdatingWorker,
    isTogglingWorkerId,
    workerModalMessage,
    selectedAssignmentForWorkLogId,
    setSelectedAssignmentForWorkLogId,
    startedAtInput,
    setStartedAtInput,
    endedAtInput,
    setEndedAtInput,
    workLogNotes,
    setWorkLogNotes,
    isSavingWorkLog,
    workLogMessage,
    handleCreateWorker,
    handleCreateStructure,
    openStructureModal,
    closeStructureModal,
    handleUpdateStructure,
    handleToggleStructureActive,
    handleAssignWorkersToStructure,
    openWorkerModal,
    closeWorkerModal,
    handleUpdateWorker,
    handleToggleWorkerActive,
    handleSubmitWorkLog,
    handleLogout,
  } = controller;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-700">{t("Admin")}</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{t("Dashboard")}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {t("Overview of structures, workers, and daily assignments.")}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/assignments"
              className="rounded-2xl border border-teal-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-teal-50"
            >
              {t("Open Assignments")}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              {t("Log out")}
            </button>
          </div>
        </div>
        <LanguageSwitcher />

        <div className="mb-6 rounded-[28px] border border-teal-900/10 bg-white/90 p-5 shadow-[0_18px_60px_-35px_rgba(2,44,34,0.6)]">
          <label htmlFor="admin-date" className="mb-2 block text-sm font-semibold text-slate-700">
            {t("Daily assignment date")}
          </label>
          <input
            id="admin-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full max-w-xs rounded-2xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">{t("Add Worker")}</h2>
            <form className="mt-3 grid gap-3" onSubmit={handleCreateWorker}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={workerForm.first_name}
                  onChange={(event) =>
                    setWorkerForm((prev) => ({ ...prev, first_name: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("First name")}
                />
                <input
                  value={workerForm.last_name}
                  onChange={(event) =>
                    setWorkerForm((prev) => ({ ...prev, last_name: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("Last name")}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={workerForm.email}
                  onChange={(event) =>
                    setWorkerForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("Email")}
                />
                <input
                  value={workerForm.phone}
                  onChange={(event) =>
                    setWorkerForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("Phone")}
                />
              </div>
              <input
                value={workerForm.role}
                onChange={(event) => setWorkerForm((prev) => ({ ...prev, role: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder={t("Role")}
              />
              {workerMessage && (
                <p
                  className={`text-sm ${
                    workerMessage.toLowerCase().includes("success")
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {workerMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={isSavingWorker}
                className="rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingWorker ? t("Adding...") : t("Add Worker")}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">{t("Add Structure")}</h2>
            <form className="mt-3 grid gap-3" onSubmit={handleCreateStructure}>
              <input
                value={structureForm.name}
                onChange={(event) =>
                  setStructureForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder={t("Structure name")}
              />
              <input
                value={structureForm.address_line}
                onChange={(event) =>
                  setStructureForm((prev) => ({ ...prev, address_line: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder={t("Address line")}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={structureForm.city}
                  onChange={(event) =>
                    setStructureForm((prev) => ({ ...prev, city: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("City")}
                />
                <input
                  value={structureForm.zip}
                  onChange={(event) =>
                    setStructureForm((prev) => ({ ...prev, zip: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("Zip")}
                />
              </div>
              <input
                value={structureForm.client_name}
                onChange={(event) =>
                  setStructureForm((prev) => ({ ...prev, client_name: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder={t("Client name")}
              />
              {structureMessage && (
                <p
                  className={`text-sm ${
                    structureMessage.toLowerCase().includes("success")
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {structureMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={isSavingStructure}
                className="rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingStructure ? t("Adding...") : t("Add Structure")}
              </button>
            </form>
          </section>
        </div>

        {loading && (
          <div className="mt-6 rounded-2xl border border-teal-900/10 bg-white p-4 text-sm text-slate-600">
            {t("Loading dashboard...")}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">{t("Structures")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {structures.slice(0, 8).map((structure) => (
                  <button
                    type="button"
                    key={structure.structure_id}
                    onClick={() => openStructureModal(structure)}
                    className="w-full rounded-lg bg-slate-50 px-3 py-2 text-left transition hover:bg-teal-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{structure.name}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          structure.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {structure.is_active ? t("Active") : t("Inactive")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {structure.address_line}, {structure.city} {structure.zip}
                    </p>
                    <p className="text-xs text-teal-700">
                      {t("Client: {name}", { name: structure.client_name })}
                    </p>
                  </button>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">{t("Employees")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {workers.slice(0, 8).map((worker) => (
                  <button
                    type="button"
                    key={worker.employee_id}
                    onClick={() => openWorkerModal(worker)}
                    className="w-full rounded-lg bg-slate-50 px-3 py-2 text-left transition hover:bg-teal-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900">
                        {worker.first_name} {worker.last_name}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          worker.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {worker.is_active ? t("Active") : t("Inactive")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {worker.role} - {worker.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{worker.phone}</p>
                  </button>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">{t("Daily Assignments")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {assignments.slice(0, 8).map((assignment) => (
                  <li
                    key={assignment.assignment_id}
                    className={`rounded-lg px-3 py-2 ${
                      selectedAssignmentForWorkLogId === assignment.assignment_id
                        ? "bg-teal-50 ring-1 ring-teal-200"
                        : "bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssignmentForWorkLogId(assignment.assignment_id);
                      }}
                      className="w-full text-left"
                    >
                      {assignment.first_name} {assignment.last_name} -{" "}
                      {assignment.structure_name}
                      <span className="ml-2 text-xs text-slate-500">
                        ({assignment.status})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {selectedAssignmentForWorkLogId && (
                <div className="mt-4 rounded-xl border border-teal-900/10 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {t("Submit Work Log")}
                  </p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
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
                    disabled={
                      isSavingWorkLog ||
                      !startedAtInput ||
                      !endedAtInput
                    }
                    className="mt-3 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingWorkLog ? t("Submitting...") : t("Submit Work Log")}
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {selectedStructure && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 py-4 sm:items-center sm:py-6">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col rounded-3xl border border-teal-900/10 bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
            <img
              src={getStructureImageUrl(selectedStructure.name)}
              alt={selectedStructure.name}
              className="h-56 w-full shrink-0 rounded-t-3xl object-cover"
            />
            <div className="overflow-y-auto p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-700">{t("Structure")}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <h3 className="text-2xl font-extrabold text-slate-900">{selectedStructure.name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        structureEditForm.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {structureEditForm.is_active ? t("Active") : t("Inactive")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeStructureModal}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t("Close")}
                </button>
              </div>

              <form className="grid gap-3" onSubmit={handleUpdateStructure}>
                <input
                  value={structureEditForm.name}
                  onChange={(event) =>
                    setStructureEditForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("Structure name")}
                />
                <input
                  value={structureEditForm.address_line}
                  onChange={(event) =>
                    setStructureEditForm((prev) => ({
                      ...prev,
                      address_line: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("Address line")}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={structureEditForm.city}
                    onChange={(event) =>
                      setStructureEditForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder={t("City")}
                  />
                  <input
                    value={structureEditForm.zip}
                    onChange={(event) =>
                      setStructureEditForm((prev) => ({ ...prev, zip: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder={t("Zip")}
                  />
                </div>
                <input
                  value={structureEditForm.client_name}
                  onChange={(event) =>
                    setStructureEditForm((prev) => ({
                      ...prev,
                      client_name: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("Client name")}
                />

                {structureModalMessage && (
                  <p
                    className={`text-sm ${
                      structureModalMessage.toLowerCase().includes("success")
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {structureModalMessage}
                  </p>
                )}

                <div className="mt-1 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleToggleStructureActive}
                    disabled={
                      isTogglingStructureId === selectedStructure.structure_id ||
                      isUpdatingStructure
                    }
                    className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                          structureEditForm.is_active ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            structureEditForm.is_active ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </span>
                      {isTogglingStructureId === selectedStructure.structure_id
                        ? t("Saving...")
                        : structureEditForm.is_active
                          ? t("Set Inactive")
                          : t("Set Active")}
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isUpdatingStructure ||
                      isTogglingStructureId === selectedStructure.structure_id
                    }
                    className="rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingStructure ? t("Updating...") : t("Update")}
                  </button>
                </div>
              </form>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      void handleToggleStructureAssignPanel();
                    }}
                    className="rounded-xl border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                  >
                    {isStructureAssignOpen ? t("Hide Assign Worker") : t("Assign Worker")}
                  </button>
                </div>

                {isStructureAssignOpen && (
                  <form className="mt-3 grid gap-3" onSubmit={handleAssignWorkersToStructure}>
                    <p className="text-sm font-semibold text-slate-900">
                      {t("Assign Worker to Structure")}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="date"
                        value={structureAssignDate}
                        onChange={(event) => {
                          void handleStructureAssignDateChange(event.target.value);
                        }}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={structureAssignDays}
                        onChange={(event) => setStructureAssignDays(event.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                        placeholder={t("Number of days")}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="time"
                        value={structureAssignShiftStart}
                        onChange={(event) => setStructureAssignShiftStart(event.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />
                      <input
                        type="time"
                        value={structureAssignShiftEnd}
                        onChange={(event) => setStructureAssignShiftEnd(event.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {t("Available workers")}
                      </p>
                      {isLoadingStructureWorkers ? (
                        <p className="mt-2 text-sm text-slate-600">{t("Loading workers...")}</p>
                      ) : availableStructureWorkers.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-600">
                          {t("No workers available for selected date.")}
                        </p>
                      ) : (
                        <ul className="mt-2 grid max-h-56 gap-2 overflow-auto">
                          {availableStructureWorkers.map((worker) => {
                            const isChecked = selectedStructureWorkerIds.includes(
                              worker.employee_id,
                            );
                            return (
                              <li key={worker.employee_id}>
                                <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-sm text-slate-800 hover:bg-teal-50">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                      handleToggleStructureWorkerSelection(
                                        worker.employee_id,
                                      )
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                                  />
                                  <span>
                                    {worker.first_name} {worker.last_name}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    {structureAssignMessage && (
                      <p className="text-sm text-slate-700">{structureAssignMessage}</p>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isAssigningStructure || isLoadingStructureWorkers}
                        className="rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isAssigningStructure ? t("Assigning...") : t("Assign Worker")}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-teal-900/10 bg-white shadow-2xl">
            <img
              src={getWorkerImageUrl(`${selectedWorker.first_name} ${selectedWorker.last_name}`)}
              alt={`${selectedWorker.first_name} ${selectedWorker.last_name}`}
              className="h-56 w-full rounded-t-3xl object-cover"
            />
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-700">{t("Worker")}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {selectedWorker.first_name} {selectedWorker.last_name}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        selectedWorker.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {selectedWorker.is_active ? t("Active") : t("Inactive")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeWorkerModal}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t("Close")}
                </button>
              </div>

              <form className="grid gap-3" onSubmit={handleUpdateWorker}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={workerEditForm.first_name}
                    onChange={(event) =>
                      setWorkerEditForm((prev) => ({ ...prev, first_name: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder={t("First name")}
                  />
                  <input
                    value={workerEditForm.last_name}
                    onChange={(event) =>
                      setWorkerEditForm((prev) => ({ ...prev, last_name: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder={t("Last name")}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={workerEditForm.email}
                    onChange={(event) =>
                      setWorkerEditForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder={t("Email")}
                  />
                  <input
                    value={workerEditForm.phone}
                    onChange={(event) =>
                      setWorkerEditForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder={t("Phone")}
                  />
                </div>
                <input
                  value={workerEditForm.role}
                  onChange={(event) =>
                    setWorkerEditForm((prev) => ({ ...prev, role: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder={t("Role")}
                />

                {workerModalMessage && (
                  <p
                    className={`text-sm ${
                      workerModalMessage.toLowerCase().includes("success")
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {workerModalMessage}
                  </p>
                )}

                <div className="mt-1 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleToggleWorkerActive}
                    disabled={
                      isTogglingWorkerId === selectedWorker.employee_id ||
                      isUpdatingWorker
                    }
                    className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                          workerEditForm.is_active ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            workerEditForm.is_active ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </span>
                      {isTogglingWorkerId === selectedWorker.employee_id
                        ? t("Saving...")
                        : workerEditForm.is_active
                          ? t("Set Inactive")
                          : t("Set Active")}
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingWorker || isTogglingWorkerId === selectedWorker.employee_id}
                    className="rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingWorker ? t("Updating...") : t("Update")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

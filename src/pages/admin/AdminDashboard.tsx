import { Link } from "react-router-dom";
import type { AdminDashboardController } from "./useAdminDashboard";

function getStructureImageUrl(structureName: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(structureName)}/800/480`;
}

function getWorkerImageUrl(fullName: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(fullName)}/800/480`;
}

export default function AdminDashboard(controller: AdminDashboardController) {
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
    isUpdatingStructure,
    isTogglingStructureId,
    structureModalMessage,
    selectedWorker,
    workerEditForm,
    setWorkerEditForm,
    isUpdatingWorker,
    isTogglingWorkerId,
    workerModalMessage,
    handleCreateWorker,
    handleCreateStructure,
    openStructureModal,
    closeStructureModal,
    handleUpdateStructure,
    handleToggleStructureActive,
    openWorkerModal,
    closeWorkerModal,
    handleUpdateWorker,
    handleToggleWorkerActive,
    handleLogout,
  } = controller;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-700">Admin</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Overview of structures, workers, and daily assignments.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/assignments"
              className="rounded-2xl border border-teal-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-teal-50"
            >
              Open Assignments
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-teal-900/10 bg-white/90 p-5 shadow-[0_18px_60px_-35px_rgba(2,44,34,0.6)]">
          <label htmlFor="admin-date" className="mb-2 block text-sm font-semibold text-slate-700">
            Daily assignment date
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
            <h2 className="text-lg font-extrabold text-slate-900">Add Worker</h2>
            <form className="mt-3 grid gap-3" onSubmit={handleCreateWorker}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={workerForm.first_name}
                  onChange={(event) =>
                    setWorkerForm((prev) => ({ ...prev, first_name: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="First name"
                />
                <input
                  value={workerForm.last_name}
                  onChange={(event) =>
                    setWorkerForm((prev) => ({ ...prev, last_name: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Last name"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={workerForm.email}
                  onChange={(event) =>
                    setWorkerForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Email"
                />
                <input
                  value={workerForm.phone}
                  onChange={(event) =>
                    setWorkerForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Phone"
                />
              </div>
              <input
                value={workerForm.role}
                onChange={(event) => setWorkerForm((prev) => ({ ...prev, role: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Role"
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
                {isSavingWorker ? "Adding..." : "Add Worker"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Add Structure</h2>
            <form className="mt-3 grid gap-3" onSubmit={handleCreateStructure}>
              <input
                value={structureForm.name}
                onChange={(event) =>
                  setStructureForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Structure name"
              />
              <input
                value={structureForm.address_line}
                onChange={(event) =>
                  setStructureForm((prev) => ({ ...prev, address_line: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Address line"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={structureForm.city}
                  onChange={(event) =>
                    setStructureForm((prev) => ({ ...prev, city: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="City"
                />
                <input
                  value={structureForm.zip}
                  onChange={(event) =>
                    setStructureForm((prev) => ({ ...prev, zip: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Zip"
                />
              </div>
              <input
                value={structureForm.client_name}
                onChange={(event) =>
                  setStructureForm((prev) => ({ ...prev, client_name: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Client name"
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
                {isSavingStructure ? "Adding..." : "Add Structure"}
              </button>
            </form>
          </section>
        </div>

        {loading && (
          <div className="mt-6 rounded-2xl border border-teal-900/10 bg-white p-4 text-sm text-slate-600">
            Loading dashboard...
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
              <h2 className="text-lg font-extrabold text-slate-900">Structures</h2>
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
                        {structure.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {structure.address_line}, {structure.city} {structure.zip}
                    </p>
                    <p className="text-xs text-teal-700">Client: {structure.client_name}</p>
                  </button>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-teal-900/10 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">Employees</h2>
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
                        {worker.is_active ? "Active" : "Inactive"}
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
              <h2 className="text-lg font-extrabold text-slate-900">Daily Assignments</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {assignments.slice(0, 8).map((assignment) => (
                  <li key={assignment.assignment_id} className="rounded-lg bg-slate-50 px-3 py-2">
                    {assignment.first_name} {assignment.last_name} - {assignment.structure_name}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>

      {selectedStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-teal-900/10 bg-white shadow-2xl">
            <img
              src={getStructureImageUrl(selectedStructure.name)}
              alt={selectedStructure.name}
              className="h-56 w-full rounded-t-3xl object-cover"
            />
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-700">Structure</p>
                  <div className="mt-1 flex items-center gap-2">
                    <h3 className="text-2xl font-extrabold text-slate-900">{selectedStructure.name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        structureEditForm.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {structureEditForm.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeStructureModal}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <form className="grid gap-3" onSubmit={handleUpdateStructure}>
                <input
                  value={structureEditForm.name}
                  onChange={(event) =>
                    setStructureEditForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Structure name"
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
                  placeholder="Address line"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={structureEditForm.city}
                    onChange={(event) =>
                      setStructureEditForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder="City"
                  />
                  <input
                    value={structureEditForm.zip}
                    onChange={(event) =>
                      setStructureEditForm((prev) => ({ ...prev, zip: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder="Zip"
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
                  placeholder="Client name"
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
                        ? "Saving..."
                        : structureEditForm.is_active
                          ? "Set Inactive"
                          : "Set Active"}
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
                    {isUpdatingStructure ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
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
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-700">Employee</p>
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
                      {selectedWorker.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeWorkerModal}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
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
                    placeholder="First name"
                  />
                  <input
                    value={workerEditForm.last_name}
                    onChange={(event) =>
                      setWorkerEditForm((prev) => ({ ...prev, last_name: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder="Last name"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={workerEditForm.email}
                    onChange={(event) =>
                      setWorkerEditForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder="Email"
                  />
                  <input
                    value={workerEditForm.phone}
                    onChange={(event) =>
                      setWorkerEditForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder="Phone"
                  />
                </div>
                <input
                  value={workerEditForm.role}
                  onChange={(event) =>
                    setWorkerEditForm((prev) => ({ ...prev, role: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="Role"
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
                        ? "Saving..."
                        : workerEditForm.is_active
                          ? "Set Inactive"
                          : "Set Active"}
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingWorker || isTogglingWorkerId === selectedWorker.employee_id}
                    className="rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingWorker ? "Updating..." : "Update"}
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

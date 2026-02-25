import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAssignment, getAssignmentsByDay } from "../../services/assignments";
import {
  createStructure,
  getStructures,
  type CreateStructurePayload,
  type Structure,
  type UpdateStructurePayload,
  updateStructure,
} from "../../services/structures";
import {
  createWorker,
  getAvailableEmployeesPerDay,
  getWorkers,
  type CreateWorkerPayload,
  type UpdateWorkerPayload,
  type Worker,
  updateWorker,
} from "../../services/workers";
import { createWorkLog } from "../../services/workLogs";
import type { Assignment } from "../../types/assignments";
import useI18n from "../../i18n/useI18n";
import { clearAuthTokens, getStoredToken, isCurrentUserAdmin } from "../../utils/auth";

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number): string | null {
  const baseDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(baseDate.getTime())) return null;

  baseDate.setDate(baseDate.getDate() + days);
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStructureId(structure: Structure): number {
  return structure.structure_id;
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

export type AdminDashboardController = {
  date: string;
  setDate: (value: string) => void;
  loading: boolean;
  error: string | null;
  stats: Array<{ label: string; value: number }>;
  assignments: Assignment[];
  structures: Structure[];
  workers: Worker[];
  workerForm: CreateWorkerPayload;
  setWorkerForm: React.Dispatch<React.SetStateAction<CreateWorkerPayload>>;
  structureForm: CreateStructurePayload;
  setStructureForm: React.Dispatch<React.SetStateAction<CreateStructurePayload>>;
  isSavingWorker: boolean;
  isSavingStructure: boolean;
  workerMessage: string | null;
  structureMessage: string | null;
  selectedStructure: Structure | null;
  structureEditForm: UpdateStructurePayload;
  setStructureEditForm: React.Dispatch<React.SetStateAction<UpdateStructurePayload>>;
  isStructureAssignOpen: boolean;
  setIsStructureAssignOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleToggleStructureAssignPanel: () => Promise<void>;
  structureAssignDate: string;
  handleStructureAssignDateChange: (value: string) => Promise<void>;
  structureAssignDays: string;
  setStructureAssignDays: React.Dispatch<React.SetStateAction<string>>;
  structureAssignShiftStart: string;
  setStructureAssignShiftStart: React.Dispatch<React.SetStateAction<string>>;
  structureAssignShiftEnd: string;
  setStructureAssignShiftEnd: React.Dispatch<React.SetStateAction<string>>;
  availableStructureWorkers: Worker[];
  selectedStructureWorkerIds: number[];
  handleToggleStructureWorkerSelection: (workerId: number) => void;
  isLoadingStructureWorkers: boolean;
  isAssigningStructure: boolean;
  structureAssignMessage: string | null;
  isUpdatingStructure: boolean;
  isTogglingStructureId: number | null;
  structureModalMessage: string | null;
  selectedWorker: Worker | null;
  workerEditForm: UpdateWorkerPayload;
  setWorkerEditForm: React.Dispatch<React.SetStateAction<UpdateWorkerPayload>>;
  isUpdatingWorker: boolean;
  isTogglingWorkerId: number | null;
  workerModalMessage: string | null;
  selectedAssignmentForWorkLogId: number | null;
  setSelectedAssignmentForWorkLogId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  startedAtInput: string;
  setStartedAtInput: React.Dispatch<React.SetStateAction<string>>;
  endedAtInput: string;
  setEndedAtInput: React.Dispatch<React.SetStateAction<string>>;
  workLogNotes: string;
  setWorkLogNotes: React.Dispatch<React.SetStateAction<string>>;
  isSavingWorkLog: boolean;
  workLogMessage: string | null;
  handleCreateWorker: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleCreateStructure: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  openStructureModal: (structure: Structure) => void;
  closeStructureModal: () => void;
  handleUpdateStructure: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleToggleStructureActive: () => Promise<void>;
  handleAssignWorkersToStructure: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  openWorkerModal: (worker: Worker) => void;
  closeWorkerModal: () => void;
  handleUpdateWorker: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleToggleWorkerActive: () => Promise<void>;
  handleSubmitWorkLog: () => Promise<void>;
  handleLogout: () => void;
};

export default function useAdminDashboard(): AdminDashboardController {
  const { t } = useI18n();
  const toArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);
  const navigate = useNavigate();
  const [date, setDate] = useState(getToday());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isSavingWorker, setIsSavingWorker] = useState(false);
  const [isTogglingWorkerId, setIsTogglingWorkerId] = useState<number | null>(null);
  const [isSavingStructure, setIsSavingStructure] = useState(false);
  const [isTogglingStructureId, setIsTogglingStructureId] = useState<number | null>(null);
  const [workerMessage, setWorkerMessage] = useState<string | null>(null);
  const [structureMessage, setStructureMessage] = useState<string | null>(null);
  const [workerForm, setWorkerForm] = useState<CreateWorkerPayload>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    role: "Worker",
  });
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerEditForm, setWorkerEditForm] = useState<UpdateWorkerPayload>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    role: "Worker",
    is_active: true,
  });
  const [isUpdatingWorker, setIsUpdatingWorker] = useState(false);
  const [workerModalMessage, setWorkerModalMessage] = useState<string | null>(null);
  const [structureForm, setStructureForm] = useState<CreateStructurePayload>({
    name: "",
    address_line: "",
    city: "",
    zip: "",
    client_name: "",
  });
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [structureEditForm, setStructureEditForm] = useState<UpdateStructurePayload>({
    name: "",
    address_line: "",
    city: "",
    zip: "",
    client_name: "",
    is_active: true,
  });
  const [isUpdatingStructure, setIsUpdatingStructure] = useState(false);
  const [structureModalMessage, setStructureModalMessage] = useState<string | null>(null);
  const [isStructureAssignOpen, setIsStructureAssignOpen] = useState(false);
  const [structureAssignDate, setStructureAssignDate] = useState(getToday());
  const [structureAssignDays, setStructureAssignDays] = useState("1");
  const [structureAssignShiftStart, setStructureAssignShiftStart] = useState("");
  const [structureAssignShiftEnd, setStructureAssignShiftEnd] = useState("");
  const [availableStructureWorkers, setAvailableStructureWorkers] = useState<Worker[]>([]);
  const [selectedStructureWorkerIds, setSelectedStructureWorkerIds] = useState<number[]>(
    [],
  );
  const [isLoadingStructureWorkers, setIsLoadingStructureWorkers] = useState(false);
  const [isAssigningStructure, setIsAssigningStructure] = useState(false);
  const [structureAssignMessage, setStructureAssignMessage] = useState<string | null>(
    null,
  );
  const [selectedAssignmentForWorkLogId, setSelectedAssignmentForWorkLogId] = useState<
    number | null
  >(null);
  const [startedAtInput, setStartedAtInput] = useState("");
  const [endedAtInput, setEndedAtInput] = useState("");
  const [workLogNotes, setWorkLogNotes] = useState(t("Completed by admin."));
  const [isSavingWorkLog, setIsSavingWorkLog] = useState(false);
  const [workLogMessage, setWorkLogMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      navigate("/");
      return;
    }

    if (!isCurrentUserAdmin()) {
      navigate("/assignments");
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [structuresResponse, workersResponse, assignmentsResponse] =
          await Promise.all([getStructures(), getWorkers(), getAssignmentsByDay(date)]);

        setStructures(toArray<Structure>(structuresResponse.data));
        setWorkers(toArray<Worker>(workersResponse.data));
        setAssignments(toArray<Assignment>(assignmentsResponse.data));
        setSelectedAssignmentForWorkLogId(null);
        setStartedAtInput("");
        setEndedAtInput("");
        setWorkLogMessage(null);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : t("Failed to load admin dashboard.");
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [date, t]);

  const stats = useMemo(
    () => [
      { label: t("Structures"), value: structures.length },
      { label: t("Workers"), value: workers.length },
      { label: t("Assignments"), value: assignments.length },
    ],
    [structures.length, workers.length, assignments.length, t],
  );

  const handleCreateWorker = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorkerMessage(null);

    const payload: CreateWorkerPayload = {
      first_name: workerForm.first_name.trim(),
      last_name: workerForm.last_name.trim(),
      phone: workerForm.phone.trim(),
      email: workerForm.email.trim(),
      role: workerForm.role.trim(),
    };

    if (!payload.first_name || !payload.last_name || !payload.email || !payload.role) {
      setWorkerMessage(t("Please fill first name, last name, email, and role."));
      return;
    }

    try {
      setIsSavingWorker(true);
      await createWorker(payload);
      const workersResponse = await getWorkers();
      setWorkers(toArray<Worker>(workersResponse.data));
      setWorkerForm({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        role: "Worker",
      });
      setWorkerMessage(t("Worker added successfully."));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("Failed to add worker.");
      setWorkerMessage(message);
    } finally {
      setIsSavingWorker(false);
    }
  };

  const handleCreateStructure = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStructureMessage(null);

    const payload: CreateStructurePayload = {
      name: structureForm.name.trim(),
      address_line: structureForm.address_line.trim(),
      city: structureForm.city.trim(),
      zip: structureForm.zip.trim(),
      client_name: structureForm.client_name.trim(),
    };

    if (!payload.name || !payload.address_line || !payload.city || !payload.zip) {
      setStructureMessage(t("Please fill name, address, city, and zip."));
      return;
    }

    try {
      setIsSavingStructure(true);
      await createStructure(payload);
      const structuresResponse = await getStructures();
      setStructures(toArray<Structure>(structuresResponse.data));
      setStructureForm({
        name: "",
        address_line: "",
        city: "",
        zip: "",
        client_name: "",
      });
      setStructureMessage(t("Structure added successfully."));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("Failed to add structure.");
      setStructureMessage(message);
    } finally {
      setIsSavingStructure(false);
    }
  };

  const openWorkerModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setWorkerEditForm({
      first_name: worker.first_name,
      last_name: worker.last_name,
      phone: worker.phone,
      email: worker.email,
      role: worker.role,
      is_active: worker.is_active,
    });
    setWorkerModalMessage(null);
  };

  const closeWorkerModal = () => {
    setSelectedWorker(null);
    setWorkerModalMessage(null);
  };

  const handleUpdateWorker = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWorker) return;

    const payload: UpdateWorkerPayload = {
      first_name: workerEditForm.first_name.trim(),
      last_name: workerEditForm.last_name.trim(),
      phone: workerEditForm.phone.trim(),
      email: workerEditForm.email.trim(),
      role: workerEditForm.role.trim(),
      is_active: workerEditForm.is_active,
    };

    if (!payload.first_name || !payload.last_name || !payload.email || !payload.role) {
      setWorkerModalMessage(t("First name, last name, email, and role are required."));
      return;
    }

    try {
      setIsUpdatingWorker(true);
      await updateWorker(selectedWorker.employee_id, payload);
      const workersResponse = await getWorkers();
      setWorkers(toArray<Worker>(workersResponse.data));
      setSelectedWorker((prev) => (prev ? { ...prev, ...payload } : null));
      setWorkerModalMessage(t("Employee updated successfully."));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("Failed to update employee.");
      setWorkerModalMessage(message);
    } finally {
      setIsUpdatingWorker(false);
    }
  };

  const handleToggleWorkerActive = async () => {
    if (!selectedWorker) return;
    const employeeId = selectedWorker.employee_id;
    const payload: UpdateWorkerPayload = {
      first_name: workerEditForm.first_name.trim(),
      last_name: workerEditForm.last_name.trim(),
      phone: workerEditForm.phone.trim(),
      email: workerEditForm.email.trim(),
      role: workerEditForm.role.trim(),
      is_active: !workerEditForm.is_active,
    };

    try {
      setIsTogglingWorkerId(employeeId);
      await updateWorker(employeeId, payload);
      const workersResponse = await getWorkers();
      setWorkers(toArray<Worker>(workersResponse.data));
      setWorkerEditForm((prev) => ({ ...prev, is_active: payload.is_active }));
      setSelectedWorker((prev) => (prev ? { ...prev, is_active: payload.is_active } : null));
      setWorkerModalMessage(
        payload.is_active
          ? t("Employee reactivated successfully.")
          : t("Employee deactivated successfully."),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("Failed to update employee status.");
      setWorkerModalMessage(message);
    } finally {
      setIsTogglingWorkerId(null);
    }
  };

  const openStructureModal = (structure: Structure) => {
    setSelectedStructure(structure);
    setStructureEditForm({
      name: structure.name,
      address_line: structure.address_line,
      city: structure.city,
      zip: structure.zip,
      client_name: structure.client_name,
      is_active: structure.is_active,
    });
    setStructureModalMessage(null);
    setStructureAssignMessage(null);
    setIsStructureAssignOpen(false);
    setStructureAssignDate(getToday());
    setStructureAssignDays("1");
    setStructureAssignShiftStart("");
    setStructureAssignShiftEnd("");
    setAvailableStructureWorkers([]);
    setSelectedStructureWorkerIds([]);
  };

  const closeStructureModal = () => {
    setSelectedStructure(null);
    setStructureModalMessage(null);
    setStructureAssignMessage(null);
    setIsStructureAssignOpen(false);
    setAvailableStructureWorkers([]);
    setSelectedStructureWorkerIds([]);
  };

  const toApiTime = (value: string) => {
    if (!value) return null;
    return value.length === 5 ? `${value}:00` : value;
  };

  const loadAvailableStructureWorkers = async (targetDate: string) => {
    try {
      setIsLoadingStructureWorkers(true);
      const response = await getAvailableEmployeesPerDay(targetDate);
      const availableWorkers = toArray<Worker>(response.data).filter(
        (worker) => worker.is_active,
      );
      setAvailableStructureWorkers(availableWorkers);
      setSelectedStructureWorkerIds((current) =>
        current.filter((id) =>
          availableWorkers.some((worker) => worker.employee_id === id),
        ),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("Failed to load assignments or available workers.");
      setStructureAssignMessage(message);
      setAvailableStructureWorkers([]);
      setSelectedStructureWorkerIds([]);
    } finally {
      setIsLoadingStructureWorkers(false);
    }
  };

  const handleStructureAssignDateChange = async (value: string) => {
    setStructureAssignDate(value);
    setStructureAssignMessage(null);
    if (!value || !isStructureAssignOpen) return;
    await loadAvailableStructureWorkers(value);
  };

  const handleToggleStructureWorkerSelection = (workerId: number) => {
    setSelectedStructureWorkerIds((current) =>
      current.includes(workerId)
        ? current.filter((id) => id !== workerId)
        : [...current, workerId],
    );
  };

  const handleToggleStructureAssignPanel = async () => {
    if (isStructureAssignOpen) {
      setIsStructureAssignOpen(false);
      return;
    }

    setIsStructureAssignOpen(true);
    setStructureAssignMessage(null);
    if (structureAssignDate) {
      await loadAvailableStructureWorkers(structureAssignDate);
    }
  };

  const handleAssignWorkersToStructure = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!selectedStructure) return;

    setStructureAssignMessage(null);

    if (selectedStructureWorkerIds.length === 0) {
      setStructureAssignMessage(t("Please select at least one worker."));
      return;
    }

    if (!structureAssignDate) {
      setStructureAssignMessage(t("Please select an assignment date first."));
      return;
    }

    const numberOfDays = Number.parseInt(structureAssignDays, 10);
    if (!Number.isInteger(numberOfDays) || numberOfDays < 1) {
      setStructureAssignMessage(t("Please enter a valid number of days."));
      return;
    }

    try {
      setIsAssigningStructure(true);
      let createdCount = 0;
      let lastErrorMessage = "";

      for (let offset = 0; offset < numberOfDays; offset += 1) {
        const targetDate = addDays(structureAssignDate, offset);
        if (!targetDate) {
          lastErrorMessage = t("Please select an assignment date first.");
          continue;
        }

        for (const workerId of selectedStructureWorkerIds) {
          try {
            await createAssignment({
              work_date: targetDate,
              employee_id: workerId,
              structure_id: getStructureId(selectedStructure),
              shift_start: toApiTime(structureAssignShiftStart),
              shift_end: toApiTime(structureAssignShiftEnd),
            });
            createdCount += 1;
          } catch (err: unknown) {
            lastErrorMessage =
              err instanceof Error ? err.message : t("Failed to create assignment.");
          }
        }
      }

      const totalRequested = numberOfDays * selectedStructureWorkerIds.length;
      if (createdCount === totalRequested) {
        setStructureAssignMessage(
          totalRequested === 1
            ? t("Assignment created.")
            : t("Created {count} assignments.", { count: createdCount }),
        );
      } else if (createdCount > 0) {
        setStructureAssignMessage(
          `${t("Created {count} assignments.", { count: createdCount })} ${t(
            "Some assignments could not be created.",
          )} ${lastErrorMessage}`.trim(),
        );
      } else {
        setStructureAssignMessage(lastErrorMessage || t("Failed to create assignment."));
      }

      const assignmentsResponse = await getAssignmentsByDay(date);
      setAssignments(toArray<Assignment>(assignmentsResponse.data));
      await loadAvailableStructureWorkers(structureAssignDate);
    } finally {
      setIsAssigningStructure(false);
    }
  };

  const handleUpdateStructure = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStructure) return;
    const structureId = getStructureId(selectedStructure);

    setStructureModalMessage(null);
    const payload: UpdateStructurePayload = {
      name: structureEditForm.name.trim(),
      address_line: structureEditForm.address_line.trim(),
      city: structureEditForm.city.trim(),
      zip: structureEditForm.zip.trim(),
      client_name: structureEditForm.client_name.trim(),
      is_active: structureEditForm.is_active,
    };

    if (!payload.name || !payload.address_line || !payload.city || !payload.zip) {
      setStructureModalMessage(t("Name, address, city, and zip are required."));
      return;
    }
    try {
      setIsUpdatingStructure(true);
      await updateStructure(structureId, payload);
      const structuresResponse = await getStructures();
      setStructures(toArray<Structure>(structuresResponse.data));
      setSelectedStructure((prev) => (prev ? { ...prev, ...payload } : null));
      setStructureModalMessage(t("Structure updated successfully."));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("Failed to update structure.");
      setStructureModalMessage(message);
    } finally {
      setIsUpdatingStructure(false);
    }
  };

  const handleToggleStructureActive = async () => {
    if (!selectedStructure) return;
    const structureId = getStructureId(selectedStructure);
    const payload: UpdateStructurePayload = {
      name: structureEditForm.name.trim(),
      address_line: structureEditForm.address_line.trim(),
      city: structureEditForm.city.trim(),
      zip: structureEditForm.zip.trim(),
      client_name: structureEditForm.client_name.trim(),
      is_active: !structureEditForm.is_active,
    };

    try {
      setIsTogglingStructureId(structureId);
      await updateStructure(structureId, payload);
      const structuresResponse = await getStructures();
      setStructures(toArray<Structure>(structuresResponse.data));
      setStructureEditForm((prev) => ({ ...prev, is_active: payload.is_active }));
      setSelectedStructure((prev) =>
        prev ? { ...prev, is_active: payload.is_active } : null,
      );
      setStructureModalMessage(
        payload.is_active
          ? t("Structure reactivated successfully.")
          : t("Structure deactivated successfully."),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("Failed to update structure status.");
      setStructureModalMessage(message);
    } finally {
      setIsTogglingStructureId(null);
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    navigate("/");
  };

  const handleSubmitWorkLog = async () => {
    if (!selectedAssignmentForWorkLogId) {
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
        assignment_id: String(selectedAssignmentForWorkLogId),
        started_at: startedAt,
        ended_at: endedAt,
        notes: workLogNotes.trim() || t("Completed by admin."),
      });

      setAssignments((current) =>
        current.map((assignment) =>
          assignment.assignment_id === selectedAssignmentForWorkLogId
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

  return {
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
    setIsStructureAssignOpen,
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
  };
}

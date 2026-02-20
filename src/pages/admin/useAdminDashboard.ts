import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignmentsByDay } from "../../services/assignments";
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
  getWorkers,
  type CreateWorkerPayload,
  type UpdateWorkerPayload,
  type Worker,
  updateWorker,
} from "../../services/workers";
import type { Assignment } from "../../types/assignments";
import { isCurrentUserAdmin } from "../../utils/auth";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getStructureId(structure: Structure): number {
  return structure.structure_id;
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
  isUpdatingStructure: boolean;
  isTogglingStructureId: number | null;
  structureModalMessage: string | null;
  selectedWorker: Worker | null;
  workerEditForm: UpdateWorkerPayload;
  setWorkerEditForm: React.Dispatch<React.SetStateAction<UpdateWorkerPayload>>;
  isUpdatingWorker: boolean;
  isTogglingWorkerId: number | null;
  workerModalMessage: string | null;
  handleCreateWorker: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleCreateStructure: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  openStructureModal: (structure: Structure) => void;
  closeStructureModal: () => void;
  handleUpdateStructure: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleToggleStructureActive: () => Promise<void>;
  openWorkerModal: (worker: Worker) => void;
  closeWorkerModal: () => void;
  handleUpdateWorker: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleToggleWorkerActive: () => Promise<void>;
  handleLogout: () => void;
};

export default function useAdminDashboard(): AdminDashboardController {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
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

        setStructures(structuresResponse.data);
        setWorkers(workersResponse.data);
        setAssignments(assignmentsResponse.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load admin dashboard.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [date]);

  const stats = useMemo(
    () => [
      { label: "Structures", value: structures.length },
      { label: "Workers", value: workers.length },
      { label: "Assignments", value: assignments.length },
    ],
    [structures.length, workers.length, assignments.length],
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
      setWorkerMessage("Please fill first name, last name, email, and role.");
      return;
    }

    try {
      setIsSavingWorker(true);
      await createWorker(payload);
      const workersResponse = await getWorkers();
      setWorkers(workersResponse.data);
      setWorkerForm({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        role: "Worker",
      });
      setWorkerMessage("Worker added successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add worker.";
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
      setStructureMessage("Please fill name, address, city, and zip.");
      return;
    }

    try {
      setIsSavingStructure(true);
      await createStructure(payload);
      const structuresResponse = await getStructures();
      setStructures(structuresResponse.data);
      setStructureForm({
        name: "",
        address_line: "",
        city: "",
        zip: "",
        client_name: "",
      });
      setStructureMessage("Structure added successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add structure.";
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
      setWorkerModalMessage("First name, last name, email, and role are required.");
      return;
    }

    try {
      setIsUpdatingWorker(true);
      await updateWorker(selectedWorker.employee_id, payload);
      const workersResponse = await getWorkers();
      setWorkers(workersResponse.data);
      setSelectedWorker((prev) => (prev ? { ...prev, ...payload } : null));
      setWorkerModalMessage("Employee updated successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update employee.";
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
      setWorkers(workersResponse.data);
      setWorkerEditForm((prev) => ({ ...prev, is_active: payload.is_active }));
      setSelectedWorker((prev) => (prev ? { ...prev, is_active: payload.is_active } : null));
      setWorkerModalMessage(
        payload.is_active
          ? "Employee reactivated successfully."
          : "Employee deactivated successfully.",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update employee status.";
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
  };

  const closeStructureModal = () => {
    setSelectedStructure(null);
    setStructureModalMessage(null);
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
      setStructureModalMessage("Name, address, city, and zip are required.");
      return;
    }
    try {
      setIsUpdatingStructure(true);
      await updateStructure(structureId, payload);
      const structuresResponse = await getStructures();
      setStructures(structuresResponse.data);
      setSelectedStructure((prev) => (prev ? { ...prev, ...payload } : null));
      setStructureModalMessage("Structure updated successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update structure.";
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
      setStructures(structuresResponse.data);
      setStructureEditForm((prev) => ({ ...prev, is_active: payload.is_active }));
      setSelectedStructure((prev) =>
        prev ? { ...prev, is_active: payload.is_active } : null,
      );
      setStructureModalMessage(
        payload.is_active
          ? "Structure reactivated successfully."
          : "Structure deactivated successfully.",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update structure status.";
      setStructureModalMessage(message);
    } finally {
      setIsTogglingStructureId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
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
  };
}

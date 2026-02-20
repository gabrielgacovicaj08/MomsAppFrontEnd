import { instance } from "./api";

export type Worker = {
  employee_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  role: string;
  is_active: boolean;
};

export type CreateWorkerPayload = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  role: string;
};

export type UpdateWorkerPayload = CreateWorkerPayload & {
  is_active: boolean;
};

export async function getWorkers() {
  try {
    return await instance.get<Worker[]>("/api/Employee/all-employees");
  } catch {
    // Fall through to legacy endpoint names if needed.
  }

  try {
    return await instance.get<Worker[]>("/api/Employee");
  } catch {
    return instance.get<Worker[]>("/api/Workers");
  }
}

export async function createWorker(payload: CreateWorkerPayload) {
  try {
    return await instance.post<Worker>(
      "/api/Employee/create-employee",
      payload,
    );
  } catch {
    // Fall through to legacy endpoint names if needed.
  }

  try {
    return await instance.post<Worker>("/api/Employee/add-employee", payload);
  } catch {
    return instance.post<Worker>("/api/Employee", payload);
  }
}

export async function updateWorker(
  employeeId: number,
  payload: UpdateWorkerPayload,
) {
  try {
    return await instance.post<boolean>(
      `/api/Employee/update-employee/${employeeId}`,
      payload,
    );
  } catch {
    // Fall through to legacy endpoint names if needed.
  }

  try {
    return await instance.put<Worker>(`/api/Employee/${employeeId}`, payload);
  } catch {
    return instance.put<Worker>("/api/Employee", payload);
  }
}

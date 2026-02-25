import { instance } from "./api";
import type { Assignment } from "../types/assignments";

export function getAssignmentsByDay(date: string) {
  return instance.get<Assignment[]>(
    `/api/Assignment/assignments-by-day/${date}`,
  );
}

export async function getAssignmentsByEmployeeId(employeeId: number) {
  try {
    return await instance.get<Assignment[]>(
      `/api/Assignment/assignment-by-empId/${employeeId}`,
    );
  } catch {
    // Fall through to alternate endpoint naming if needed.
  }

  try {
    return await instance.get<Assignment[]>(
      `/api/Assignment/assignements-by-emp-id/${employeeId}`,
    );
  } catch {
    // Fall through to legacy endpoint names if needed.
  }

  try {
    return await instance.get<Assignment[]>(
      `/api/Assignment/by-employee/${employeeId}`,
    );
  } catch {
    return instance.get<Assignment[]>(`/api/Assignments/employee/${employeeId}`);
  }
}

export type CreateAssignmentPayload = {
  work_date: string;
  employee_id: number;
  structure_id: number;
  shift_start?: string | null;
  shift_end?: string | null;
};

export async function createAssignment(payload: CreateAssignmentPayload) {
  try {
    return await instance.post<CreateAssignmentPayload>(
      "/api/Assignment/create-assignemnt",
      payload,
    );
  } catch {
    // Fall through to legacy endpoint names if needed.
  }

  try {
    return await instance.post<CreateAssignmentPayload>(
      "/api/Assignment",
      payload,
    );
  } catch {
    return instance.post<CreateAssignmentPayload>("/api/Assignments", payload);
  }
}

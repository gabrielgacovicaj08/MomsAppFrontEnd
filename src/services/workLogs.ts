import { instance } from "./api";

export type CreateWorkLogPayload = {
  assignment_id: string;
  started_at: string;
  ended_at: string;
  notes: string;
};

export async function createWorkLog(payload: CreateWorkLogPayload) {
  try {
    return await instance.post<boolean>("/api/WorkLog/create-worklog", payload);
  } catch {
    // Fall through to alternate endpoint names if needed.
  }

  try {
    return await instance.post<boolean>("/api/WorkLog/create-work-log", payload);
  } catch {
    // Fall through to alternate endpoint names if needed.
  }

  try {
    return await instance.post<boolean>("/api/WorkLog", payload);
  } catch {
    return instance.post<boolean>("/api/WorkLogs", payload);
  }
}

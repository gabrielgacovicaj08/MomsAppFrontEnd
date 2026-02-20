import { instance } from "./api";
import type { Assignment } from "../types/assignments";

export function getAssignmentsByDay(date: string) {
  return instance.get<Assignment[]>(
    `/api/Assignment/assignments-by-day/${date}`,
  );
}

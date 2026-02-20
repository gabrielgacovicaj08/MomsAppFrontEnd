export type Assignment = {
  assignment_id: number;
  work_date: string; // "YYYY-MM-DD"
  first_name: string;
  last_name: string;
  structure_name: string;
  shift_start: string | null; // "HH:mm:ss" or null
  shift_end: string | null;
  status: string;
};

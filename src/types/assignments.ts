export type Assignment = {
  assignment_id: number;
  work_date: string | null; // "YYYY-MM-DD" or null on legacy/malformed records
  first_name: string;
  last_name: string;
  structure_name: string;
  shift_start: string | null; // "HH:mm:ss" or null
  shift_end: string | null;
  status: string;
};

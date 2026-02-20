import { instance } from "./api";

export type Structure = {
  structure_id: number;
  name: string;
  address_line: string;
  city: string;
  zip: string;
  client_name: string;
  is_active: boolean;
};

export type CreateStructurePayload = {
  name: string;
  address_line: string;
  city: string;
  zip: string;
  client_name: string;
};

export type UpdateStructurePayload = CreateStructurePayload & {
  is_active: boolean;
};

export async function getStructures() {
  try {
    return await instance.get<Structure[]>("/api/Structure/all-structures");
  } catch {
    // Fall through to legacy endpoint names if needed.
  }

  try {
    return await instance.get<Structure[]>("/api/Structure");
  } catch {
    return instance.get<Structure[]>("/api/Structures");
  }
}

export async function createStructure(payload: CreateStructurePayload) {
  try {
    return await instance.post<Structure>(
      "/api/Structure/create-structure",
      payload,
    );
  } catch {
    // Fall through to legacy endpoint names if needed.
  }

  try {
    return await instance.post<Structure>("/api/Structure", payload);
  } catch {
    return instance.post<Structure>("/api/Structures", payload);
  }
}

export async function updateStructure(
  structureId: number,
  payload: UpdateStructurePayload,
) {
  try {
    return await instance.post<boolean>(
      `/api/Structure/update-structure/${structureId}`,
      payload,
    );
  } catch {
    // Fall through to legacy endpoint names if needed.
  }

  try {
    return await instance.put<Structure>(
      `/api/Structure/${structureId}`,
      payload,
    );
  } catch {
    return instance.put<Structure>("/api/Structure", payload);
  }
}

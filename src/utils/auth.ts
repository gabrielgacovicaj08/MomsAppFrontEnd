type JwtPayload = Record<string, unknown>;

function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

    const decoded = atob(payload);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function extractRoles(payload: JwtPayload): string[] {
  const roleClaims = [
    payload.role,
    payload.Role,
    payload.roles,
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
  ];

  const roles: string[] = [];

  for (const claim of roleClaims) {
    if (typeof claim === "string") {
      roles.push(claim);
    } else if (Array.isArray(claim)) {
      for (const item of claim) {
        if (typeof item === "string") roles.push(item);
      }
    }
  }

  return roles;
}

export function isTokenAdmin(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload) return false;

  const roles = extractRoles(payload).map((role) => role.toLowerCase());
  return roles.includes("admin");
}

export function isTokenWorker(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload) return false;

  const roles = extractRoles(payload).map((role) => role.toLowerCase());
  return roles.includes("worker") || roles.includes("employee");
}

export function isCurrentUserAdmin(): boolean {
  const token = localStorage.getItem("token");
  if (!token) return false;
  return isTokenAdmin(token);
}

export function getCurrentUserDisplayName(): string {
  const token = localStorage.getItem("token");
  if (!token) return "Worker";

  const payload = parseJwt(token);
  if (!payload) return "Worker";

  const firstName =
    typeof payload.given_name === "string"
      ? payload.given_name
      : typeof payload.first_name === "string"
        ? payload.first_name
        : "";
  const lastName =
    typeof payload.family_name === "string"
      ? payload.family_name
      : typeof payload.last_name === "string"
        ? payload.last_name
        : "";

  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;

  if (typeof payload.name === "string" && payload.name.trim()) return payload.name;
  if (typeof payload.unique_name === "string" && payload.unique_name.trim()) {
    return payload.unique_name;
  }

  return "Worker";
}

export function getCurrentUserNameParts(): {
  firstName: string;
  lastName: string;
} {
  const token = localStorage.getItem("token");
  if (!token) {
    return { firstName: "", lastName: "" };
  }

  const payload = parseJwt(token);
  if (!payload) {
    return { firstName: "", lastName: "" };
  }

  const firstName =
    typeof payload.given_name === "string"
      ? payload.given_name
      : typeof payload.first_name === "string"
        ? payload.first_name
        : "";

  const lastName =
    typeof payload.family_name === "string"
      ? payload.family_name
      : typeof payload.last_name === "string"
        ? payload.last_name
        : "";

  return {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
  };
}

function parseNumericClaim(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
      return null;
    }

    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function getCurrentUserEmployeeId(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = parseJwt(token);
  if (!payload) return null;

  const possibleClaims: unknown[] = [
    payload.employee_id,
    payload.employeeId,
    payload.emp_id,
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ],
    payload.sub,
  ];

  for (const claim of possibleClaims) {
    const parsed = parseNumericClaim(claim);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

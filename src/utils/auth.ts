type JwtPayload = Record<string, unknown>;
const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

function getStorageWithToken(): Storage | null {
  if (localStorage.getItem(ACCESS_TOKEN_KEY)) return localStorage;
  if (sessionStorage.getItem(ACCESS_TOKEN_KEY)) return sessionStorage;
  return null;
}

export function getStoredToken(): string | null {
  const storage = getStorageWithToken();
  if (!storage) return null;
  return storage.getItem(ACCESS_TOKEN_KEY);
}

export function persistAuthTokens(
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean,
): void {
  const selectedStorage = rememberMe ? localStorage : sessionStorage;
  const alternateStorage = rememberMe ? sessionStorage : localStorage;

  alternateStorage.removeItem(ACCESS_TOKEN_KEY);
  alternateStorage.removeItem(REFRESH_TOKEN_KEY);

  selectedStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  selectedStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

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
  const token = getStoredToken();
  if (!token) return false;
  return isTokenAdmin(token);
}

export function getCurrentUserDisplayName(): string {
  const token = getStoredToken();
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
  const token = getStoredToken();
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
  const token = getStoredToken();
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

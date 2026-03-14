export type UserRole = "authority" | "refugee" | "partner";

export type AuthSession = {
  accessToken: string;
  role: UserRole;
  username: string;
  displayName?: string | null;
  caseId?: string | null;
};

const STORAGE_KEY = "borderbridge.session";

export function getSession(): AuthSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setSession(session: AuthSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isAllowed(session: AuthSession | null, roles?: UserRole[]) {
  if (!session) {
    return false;
  }
  if (!roles || roles.length === 0) {
    return true;
  }
  return roles.includes(session.role);
}

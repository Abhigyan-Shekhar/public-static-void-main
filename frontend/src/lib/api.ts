import { clearSession, getSession, type AuthSession, type UserRole } from "./auth";

function normalizeBaseUrl(raw: string | undefined) {
  if (!raw) {
    return "http://127.0.0.1:8000";
  }

  let value = raw.trim();

  // Accept accidental JSON-array formatting from deploy dashboards.
  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && typeof parsed[0] === "string") {
        value = parsed[0];
      }
    } catch {
      // Fall through and let URL parsing surface a clearer runtime error.
    }
  }

  // Accept accidental quoted string formatting.
  value = value.replace(/^['"]|['"]$/g, "");

  return value.replace(/\/$/, "");
}

const BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);
const DEFAULT_USER = "auth_manager";
const DEMO_USER_BY_ROLE: Record<UserRole, string> = {
  authority: "auth_manager",
  partner: "partner_user",
  refugee: "refugee_user",
};

function getDemoUsername(session: AuthSession | null) {
  if (!session) {
    return DEFAULT_USER;
  }
  return DEMO_USER_BY_ROLE[session.role] ?? DEFAULT_USER;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession();
  const headers = new Headers(options.headers ?? {});
  const demoUsername = getDemoUsername(session);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("X-Demo-Username", demoUsername);

  if (session?.accessToken) {
    try {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    } catch {
      // Recover from a corrupted local session instead of blocking all requests.
      clearSession();
    }
  }

  let requestUrl: string;
  try {
    requestUrl = new URL(path, `${BASE_URL}/`).toString();
  } catch {
    throw new Error(`Invalid API base URL: ${BASE_URL}`);
  }

  let res: Response;
  try {
    res = await fetch(requestUrl, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network request failed.");
  }

  // Local demo flow: if a stored bearer token is stale, retry once with the
  // role-based demo header so the workspace does not get stuck on 401.
  if (res.status === 401 && session?.accessToken) {
    const retryHeaders = new Headers(headers);
    retryHeaders.delete("Authorization");
    res = await fetch(requestUrl, {
      ...options,
      headers: retryHeaders,
    });
  }

  return parseResponse<T>(res);
}

export function login(body: { role: UserRole; username: string; password: string }) {
  return request<{
    access_token: string;
    token_type: string;
    role: UserRole;
    username: string;
    display_name?: string | null;
    case_id?: string | null;
    redirect_to: string;
  }>("/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listCases(params?: { status?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  const q = qs.toString();
  return request<Record<string, unknown>[]>(`/cases${q ? `?${q}` : ""}`);
}

export function getCase(caseId: string) {
  return request<Record<string, unknown>>(`/cases/${caseId}`);
}

export function createCase(body: {
  person_id?: string;
  person?: {
    primary_name?: string;
    name?: string;
    nationality?: string;
    language?: string;
    date_of_birth?: string;
  };
  status?: string;
  intake_location?: string;
  owner_agency?: string;
}) {
  return request<Record<string, unknown>>("/cases", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getCaseTimeline(caseId: string) {
  return request<Record<string, unknown>[]>(`/cases/${caseId}/timeline`);
}

export function listEvidence(caseId: string) {
  return request<Record<string, unknown>[]>(`/cases/${caseId}/evidence`);
}

export function addEvidence(
  caseId: string,
  body: {
    case_id: string;
    person_id: string;
    evidence_class: string;
    evidence_type: string;
    payload: Record<string, unknown>;
  }
) {
  return request<Record<string, unknown>>(`/cases/${caseId}/evidence`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function reviewEvidence(evidenceId: string, state: "accepted" | "rejected" | "disputed") {
  return request<Record<string, unknown>>(`/evidence/${evidenceId}/review`, {
    method: "PATCH",
    body: JSON.stringify({ state }),
  });
}

export function getLatestScore(caseId: string) {
  return request<Record<string, unknown> | null>(`/cases/${caseId}/score/latest`);
}

export function recomputeScore(caseId: string) {
  return request<Record<string, unknown>>(`/cases/${caseId}/score/recompute`, {
    method: "POST",
  });
}

export function createReferral(
  caseId: string,
  body: {
    case_id: string;
    referral_type: string;
    from_agency?: string;
    to_agency?: string;
    reason?: string;
  }
) {
  return request<Record<string, unknown>>(`/cases/${caseId}/referrals`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateReferral(referralId: string, status: string) {
  return request<Record<string, unknown>>(`/referrals/${referralId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function listAnnouncements(caseId: string) {
  return request<Record<string, unknown>[]>(`/cases/${caseId}/announcements`);
}

export function createAnnouncement(body: Record<string, unknown>) {
  return request<Record<string, unknown>>("/announcements", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function healthCheck() {
  return request<{ status: string }>("/health");
}

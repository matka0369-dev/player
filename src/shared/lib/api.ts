import type {
  ActiveGame,
  AuthUser,
  LedgerEntry,
  MyRates,
  Prediction,
  PredictionType,
  RateEntry,
  RateMeta,
  SessionInfo,
  TokenRequest,
  TokenRequestKind,
  UserSummary,
} from './types';

// NOTE: this is the PLAYER build's API client. It is a deliberately reduced
// copy of the shared client — only the calls a Player actually makes are
// present, so the player bundle never ships admin/agent endpoint paths or
// method names. scripts/sync-shared.sh skips this file; keep it in sync by
// hand when a player-facing endpoint changes.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
// prediction-service (Go) — a separate process from core-service, serving
// live game listing and prediction placement. Same session cookie.
const PREDICTION_BASE_URL = import.meta.env.VITE_PREDICTION_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Which portal this build is, sent on every request so the server namespaces
 * the session cookie per portal. Absent builds fall back to the shared name.
 */
const PORTAL_ID: string | undefined = import.meta.env.VITE_PORTAL;

function withPortal(headers?: HeadersInit): HeadersInit | undefined {
  if (!PORTAL_ID) return headers;
  return { ...(headers as Record<string, string> | undefined), 'X-Portal': PORTAL_ID };
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      // Auth is a session cookie, so every request must carry credentials.
      credentials: 'include',
      headers: withPortal(init?.body ? { 'Content-Type': 'application/json' } : undefined),
      ...init,
    });
  } catch {
    throw new ApiError(`Cannot reach the API at ${BASE_URL}. Is core-service running?`, 0);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const payload = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const raw = payload?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : (raw ?? res.statusText);
    throw new ApiError(message, res.status);
  }

  return payload as T;
}

// prediction-service's errors are plain text (Go's http.Error), not the
// { message } JSON shape core-service's Nest ValidationPipe produces.
async function predictionRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${PREDICTION_BASE_URL}${path}`, {
      credentials: 'include',
      headers: withPortal(init?.body ? { 'Content-Type': 'application/json' } : undefined),
      ...init,
    });
  } catch {
    throw new ApiError(`Cannot reach the prediction service at ${PREDICTION_BASE_URL}. Is it running?`, 0);
  }

  const text = await res.text();

  if (!res.ok) {
    throw new ApiError(text.trim() || res.statusText, res.status);
  }

  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  // ---- Auth / session ----

  // `identifier` is an email address or a username — the server accepts both.
  login: (identifier: string, password: string) =>
    request<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  me: () => request<{ user: AuthUser }>('/auth/me'),

  mySessions: () => request<SessionInfo[]>('/auth/sessions'),

  revokeMySession: (id: string) =>
    request<{ success: boolean }>(`/auth/sessions/${id}`, { method: 'DELETE' }),

  revokeMyOtherSessions: () =>
    request<{ success: boolean }>('/auth/sessions', { method: 'DELETE' }),

  // ---- Own account ----

  getUser: (id: string) => request<UserSummary>(`/users/${id}`),

  // ---- Rate cards (own, read; edit calls are 403 for a Player) ----

  rateMeta: () => request<RateMeta>('/rates/meta'),

  myRates: () => request<MyRates>('/rates/me'),

  updateDefaultRates: (entries: { betType: string; multiplier: number }[]) =>
    request<RateEntry[]>('/rates/me/default', {
      method: 'PATCH',
      body: JSON.stringify({ entries }),
    }),

  updateGivingRates: (entries: { betType: string; multiplier: number }[]) =>
    request<RateEntry[]>('/rates/me/giving', {
      method: 'PATCH',
      body: JSON.stringify({ entries }),
    }),

  // ---- Token history + requests ----

  ledger: (limit?: number) =>
    request<LedgerEntry[]>(`/ledger${limit ? `?limit=${limit}` : ''}`),

  /** A Player asking for a balance change. One open request per kind at a time. */
  createTokenRequest: (body: { kind: TokenRequestKind; amount: number; note?: string }) =>
    request<TokenRequest>('/token-requests', { method: 'POST', body: JSON.stringify(body) }),

  myTokenRequests: () => request<TokenRequest[]>('/token-requests/me'),

  /** A Player withdrawing their own request before anyone acts on it. */
  cancelTokenRequest: (id: string) =>
    request<TokenRequest>(`/token-requests/${id}/cancel`, { method: 'POST' }),

  // ---- Predictions ----

  myPredictions: () => request<Prediction[]>('/predictions/me'),

  /** prediction-service (Go) — live games. */
  activeGames: () => predictionRequest<ActiveGame[]>('/games/active'),

  /** prediction-service (Go) — place a bet. */
  placePrediction: (body: { gameId: string; typeId: PredictionType; pickedNumber: string; stake: number }) =>
    predictionRequest<{ predictionId: string; oddsMultiplier: number; balanceAfter: number }>('/predictions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

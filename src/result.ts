export type Result<T, E = ProblemError> =
  | { ok: true; value: T; warnings?: ProblemError[]; raw?: unknown }
  | { ok: false; error: E; raw?: unknown };

export interface ProblemError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errorCode?: string;
  requestId?: string;
  retryAfterMs?: number;
  raw?: unknown;
}

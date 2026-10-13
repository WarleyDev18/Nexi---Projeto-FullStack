export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Calls the API, unwraps `{ data }`, and turns `{ error }` into ApiError. */
export async function request(baseUrl, path, { method = "GET", body, query } = {}) {
  const qs = query
    ? "?" + new URLSearchParams(Object.entries(query).filter(([, v]) => v != null && v !== ""))
    : "";
  const res = await fetch(`${baseUrl}${path}${qs}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = json.error ?? {};
    throw new ApiError(res.status, e.code ?? "unknown_error", e.message ?? res.statusText, e.details);
  }
  return json.data;
}

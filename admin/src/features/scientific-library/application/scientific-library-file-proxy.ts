import { createBackendUrl } from "@/core/api/laravel-url";

const DOCUMENT_ACCEPT = "application/pdf, application/octet-stream";

const documentContentType = /^application\/(?:pdf|octet-stream)(?:\s*;|$)/i;

type ScientificLibraryFileProxyDependencies = {
  backendApiUrl: string | undefined;
  fetch: typeof globalThis.fetch;
};

function jsonFailure(status: number, code: string, message: string): Response {
  return Response.json(
    { success: false, error: { code, message } },
    {
      status,
      headers: {
        "cache-control": "private, no-store, max-age=0",
        vary: "Cookie",
      },
    },
  );
}

function failureForUpstream(status: number): Response {
  if (status === 401)
    return jsonFailure(401, "AUTH_SESSION_EXPIRED", "Session expired.");
  if (status === 403)
    return jsonFailure(403, "AUTH_FORBIDDEN", "Access denied.");
  if (status === 404)
    return jsonFailure(404, "RESOURCE_NOT_FOUND", "File not found.");
  if (status === 416)
    return jsonFailure(416, "INVALID_RANGE", "Requested range is unavailable.");
  if (status === 429)
    return jsonFailure(429, "RATE_LIMIT_EXCEEDED", "Too many requests.");
  return jsonFailure(502, "BACKEND_UNAVAILABLE", "File service unavailable.");
}

function validId(id: string): boolean {
  return /^[1-9]\d*$/.test(id);
}

function safeRange(request: Request): string | null {
  const value = request.headers.get("range");
  if (!value) return null;
  return /^bytes=(?:\d+-\d*|-\d+)$/.test(value.trim()) ? value.trim() : null;
}

export async function proxyScientificLibraryFile(
  id: string,
  request: Request,
  token: string | undefined,
  dependencies: ScientificLibraryFileProxyDependencies,
): Promise<Response> {
  if (!token)
    return jsonFailure(401, "AUTH_SESSION_EXPIRED", "Session expired.");
  if (!validId(id))
    return jsonFailure(404, "RESOURCE_NOT_FOUND", "File not found.");
  if (!dependencies.backendApiUrl)
    return jsonFailure(503, "BACKEND_UNAVAILABLE", "File service unavailable.");

  let backendUrl: URL;
  try {
    backendUrl = createBackendUrl(
      dependencies.backendApiUrl,
      `/admin/scientific-library/items/${id}/file`,
    );
  } catch {
    return jsonFailure(503, "BACKEND_UNAVAILABLE", "File service unavailable.");
  }

  const requestHeaders = new Headers({
    accept: DOCUMENT_ACCEPT,
    authorization: `Bearer ${token}`,
  });
  const range = safeRange(request);
  if (range) requestHeaders.set("range", range);

  let upstream: Response;
  try {
    upstream = await dependencies.fetch(backendUrl, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
      redirect: "manual",
      signal: request.signal,
    });
  } catch {
    return jsonFailure(502, "BACKEND_UNAVAILABLE", "File service unavailable.");
  }

  if (!upstream.ok || !upstream.body) {
    return failureForUpstream(upstream.status);
  }

  const headers = new Headers({
    "cache-control": "private, no-store, max-age=0",
    "content-type": "application/octet-stream",
    "x-content-type-options": "nosniff",
    vary: "Cookie",
  });
  const contentType = upstream.headers.get("content-type");
  if (contentType && documentContentType.test(contentType)) {
    headers.set("content-type", contentType);
  }
  for (const name of [
    "content-disposition",
    "content-length",
    "content-range",
    "accept-ranges",
  ]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!headers.has("content-disposition")) {
    headers.set("content-disposition", "inline");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}

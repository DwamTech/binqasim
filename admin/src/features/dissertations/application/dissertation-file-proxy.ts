import { createBackendUrl } from "@/core/api/laravel-url";

type DissertationFileProxyDependencies = {
  backendApiUrl: string | undefined;
  fetch: typeof globalThis.fetch;
};

const safeDocumentTypes = new Set([
  "application/pdf",
  "application/octet-stream",
]);

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

function upstreamFailure(status: number): Response {
  if (status === 401)
    return jsonFailure(401, "AUTH_SESSION_EXPIRED", "Session expired.");
  if (status === 403)
    return jsonFailure(403, "AUTH_FORBIDDEN", "Access denied.");
  if (status === 404)
    return jsonFailure(404, "RESOURCE_NOT_FOUND", "File not found.");
  if (status === 416)
    return jsonFailure(416, "INVALID_RANGE", "Requested range is unavailable.");
  return jsonFailure(502, "BACKEND_UNAVAILABLE", "File service unavailable.");
}

function safeRange(request: Request): string | null {
  const value = request.headers.get("range")?.trim();
  return value && /^bytes=(?:\d+-\d*|-\d+)$/.test(value) ? value : null;
}

export async function proxyDissertationFile(
  id: string,
  request: Request,
  token: string | undefined,
  dependencies: DissertationFileProxyDependencies,
): Promise<Response> {
  if (!token)
    return jsonFailure(401, "AUTH_SESSION_EXPIRED", "Session expired.");
  if (!/^[1-9]\d*$/.test(id))
    return jsonFailure(404, "RESOURCE_NOT_FOUND", "File not found.");
  if (!dependencies.backendApiUrl)
    return jsonFailure(503, "BACKEND_UNAVAILABLE", "File service unavailable.");

  let url: URL;
  try {
    url = createBackendUrl(
      dependencies.backendApiUrl,
      `/admin/dissertations/${id}/file`,
    );
  } catch {
    return jsonFailure(503, "BACKEND_UNAVAILABLE", "File service unavailable.");
  }

  const headers = new Headers({
    accept: "application/pdf, application/octet-stream",
    authorization: `Bearer ${token}`,
  });
  const range = safeRange(request);
  if (range) headers.set("range", range);

  let upstream: Response;
  try {
    upstream = await dependencies.fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
      redirect: "manual",
      signal: request.signal,
    });
  } catch {
    return jsonFailure(502, "BACKEND_UNAVAILABLE", "File service unavailable.");
  }

  const contentType = upstream.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (
    !upstream.ok ||
    !upstream.body ||
    !contentType ||
    !safeDocumentTypes.has(contentType)
  ) {
    await upstream.body?.cancel().catch(() => undefined);
    return upstreamFailure(upstream.ok ? 502 : upstream.status);
  }

  const responseHeaders = new Headers({
    "cache-control": "private, no-store, max-age=0",
    "content-type": upstream.headers.get("content-type")!,
    "x-content-type-options": "nosniff",
    vary: "Cookie",
  });
  for (const name of [
    "content-disposition",
    "content-length",
    "content-range",
    "accept-ranges",
  ]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  if (!responseHeaders.has("content-disposition")) {
    responseHeaders.set("content-disposition", "inline");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

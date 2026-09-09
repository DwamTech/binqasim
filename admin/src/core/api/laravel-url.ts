export type QueryValue = string | number | boolean | null | undefined;
export type QueryParameters = Record<string, QueryValue | QueryValue[]>;

export function normalizeBackendApiUrl(value: string): string {
  const url = new URL(value.trim());

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("BACKEND_API_URL must use http or https.");
  }
  if (
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error(
      "BACKEND_API_URL must not include credentials, query parameters, or a fragment.",
    );
  }

  const path = url.pathname.replace(/\/+$/, "");
  url.pathname =
    path === "" || path === "/"
      ? "/api"
      : path.endsWith("/api")
        ? path
        : `${path}/api`;
  return url.toString().replace(/\/$/, "");
}

export function createBackendUrl(
  baseUrl: string,
  endpoint: string,
  query?: QueryParameters,
): URL {
  const candidate = endpoint.trim();
  if (
    candidate === "" ||
    candidate.startsWith("//") ||
    candidate.startsWith("\\") ||
    /^[a-z][a-z\d+.-]*:/i.test(candidate) ||
    candidate.includes("#")
  ) {
    throw new Error(
      "API endpoints must be safe relative paths without fragments.",
    );
  }

  const normalizedBase = normalizeBackendApiUrl(baseUrl);
  const endpointPath = candidate.replace(/^\/?api(?=\/|$)/, "") || "/";
  const url = new URL(endpointPath.replace(/^\//, ""), `${normalizedBase}/`);

  if (query === undefined) return url;

  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item !== null && item !== undefined) {
        url.searchParams.append(key, String(item));
      }
    }
  }

  return url;
}

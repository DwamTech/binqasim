import { normalizeBackendApiUrl } from "../api/laravel-url";

export function resolveMediaUrl(
  value: string | null | undefined,
  backendUrl: string,
): string | undefined {
  if (value === null || value === undefined || value.trim() === "")
    return undefined;

  const candidate = value.trim();
  if (candidate.startsWith("//")) return undefined;
  try {
    const absolute = new URL(candidate);
    return absolute.protocol === "http:" || absolute.protocol === "https:"
      ? absolute.toString()
      : undefined;
  } catch {
    const apiUrl = new URL(normalizeBackendApiUrl(backendUrl));
    const origin = apiUrl.origin;
    const relativePath = candidate.replace(/^\/+/, "");
    const path = relativePath.startsWith("storage/")
      ? `/${relativePath}`
      : `/storage/${relativePath}`;
    return new URL(path, origin).toString();
  }
}

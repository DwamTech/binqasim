export type OriginVerificationResult =
  { ok: true } | { ok: false; reason: "invalid_origin" | "missing_origin" };

export type OriginVerificationOptions = {
  requestOrigin: string;
  trustedOrigins?: readonly string[];
};

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return url.username === "" && url.password === "" ? url.origin : null;
  } catch {
    return null;
  }
}

/**
 * Intended for state-changing server requests. Callers provide the request's
 * canonical origin and any explicitly trusted cross-origin callers.
 */
export function verifyRequestOrigin(
  origin: string | null,
  options: OriginVerificationOptions,
): OriginVerificationResult {
  if (origin === null) {
    return { ok: false, reason: "missing_origin" };
  }

  const normalizedOrigin = normalizeOrigin(origin);
  const requestOrigin = normalizeOrigin(options.requestOrigin);

  if (normalizedOrigin === null || requestOrigin === null) {
    return { ok: false, reason: "invalid_origin" };
  }

  const trustedOrigins = options.trustedOrigins ?? [];
  const isTrusted = trustedOrigins.some(
    (trustedOrigin) => normalizeOrigin(trustedOrigin) === normalizedOrigin,
  );

  return normalizedOrigin === requestOrigin || isTrusted
    ? { ok: true }
    : { ok: false, reason: "invalid_origin" };
}

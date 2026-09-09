export type CsrfVerificationResult =
  | { ok: true }
  | { ok: false; reason: "invalid_csrf_token" | "missing_csrf_token" };

export type CsrfVerificationOptions = {
  enforce?: boolean;
  expectedToken: string;
  providedToken: string | null;
};

function tokensMatch(expected: string, provided: string): boolean {
  if (expected.length !== provided.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }

  return difference === 0;
}

/**
 * Contract-only helper. A future token issuer/storage adapter supplies the
 * expected token; this layer deliberately owns neither token generation nor
 * distributed storage.
 */
export function verifyCsrfToken(
  options: CsrfVerificationOptions,
): CsrfVerificationResult {
  if (options.enforce === false) {
    return { ok: true };
  }

  if (options.providedToken === null) {
    return { ok: false, reason: "missing_csrf_token" };
  }

  return tokensMatch(options.expectedToken, options.providedToken)
    ? { ok: true }
    : { ok: false, reason: "invalid_csrf_token" };
}

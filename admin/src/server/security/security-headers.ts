export type SecurityHeaderOptions = {
  contentSecurityPolicy?: string;
  environment?: "development" | "production";
  mediaOrigin?: string;
};

function normalizeMediaOrigin(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : undefined;
  } catch {
    return undefined;
  }
}

export function createContentSecurityPolicy(
  environment: "development" | "production",
  mediaOrigin?: string,
): string {
  const scriptPolicy =
    environment === "development"
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";
  const connectPolicy =
    environment === "development"
      ? "connect-src 'self' ws: wss:"
      : "connect-src 'self'";
  const externalMediaSource = normalizeMediaOrigin(mediaOrigin);
  const mediaSources = `'self' blob: data:${externalMediaSource === undefined ? "" : ` ${externalMediaSource}`}`;

  return [
    "default-src 'self'",
    scriptPolicy,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${mediaSources}`,
    `media-src ${mediaSources}`,
    "font-src 'self' data:",
    connectPolicy,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(environment === "production" ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function createSecurityHeaders(
  options: SecurityHeaderOptions = {},
): Record<string, string> {
  const environment = options.environment ?? "development";
  const headers: Record<string, string> = {
    "content-security-policy":
      options.contentSecurityPolicy ??
      createContentSecurityPolicy(environment, options.mediaOrigin),
    "permissions-policy":
      "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
  };

  if (environment === "production") {
    headers["strict-transport-security"] =
      "max-age=31536000; includeSubDomains";
  }

  return headers;
}

const nextHeaderNames: Record<string, string> = {
  "content-security-policy": "Content-Security-Policy",
  "permissions-policy": "Permissions-Policy",
  "referrer-policy": "Referrer-Policy",
  "strict-transport-security": "Strict-Transport-Security",
  "x-content-type-options": "X-Content-Type-Options",
  "x-frame-options": "X-Frame-Options",
};

export function createNextSecurityHeaders(
  environment: "development" | "production",
  options: Pick<SecurityHeaderOptions, "mediaOrigin"> = {},
): Array<{ key: string; value: string }> {
  return Object.entries(createSecurityHeaders({ environment, ...options })).map(
    ([key, value]) => ({ key: nextHeaderNames[key] ?? key, value }),
  );
}

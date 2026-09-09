import { z } from "zod";

import {
  apiFailure,
  apiSuccess,
  type ApiErrorCode,
} from "../../core/api/api-response";
import type { AuthRepository } from "../../features/auth/domain/auth.repository";
import type { AdminSummary } from "../../features/auth/domain/auth.contracts";
import {
  createSessionCookieClearOptions,
  createSessionCookieOptions,
  sessionCookieName,
} from "../cookies/session-cookie";
import type { LoginRateLimiter } from "../security/rate-limit";

const loginSchema = z.object({
  identity: z.string().trim().min(1).max(320),
  password: z.string().min(1).max(1024),
});

type CookieInstruction = { action: "clear" } | { action: "set"; token: string };

export type AuthBffResponse = {
  body: object | null;
  cookie?: CookieInstruction;
  status: number;
};
export type AuthBffDependencies = {
  authRepository: AuthRepository;
  isProduction: boolean;
  rateLimiter?: LoginRateLimiter;
};
export type AuthBffRequestContext = { rateLimitKey: string; token?: string };

function failure(status: number, code: ApiErrorCode): AuthBffResponse {
  return { status, body: apiFailure(code, { status }) };
}

export function unavailableAuthBffResponse(): AuthBffResponse {
  return failure(503, "BACKEND_UNAVAILABLE");
}

function safeAdmin(admin: AdminSummary): AdminSummary {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    isActive: true,
    dashboardPermissions: [...(admin.dashboardPermissions ?? [])],
  };
}

function errorCode(error: unknown): ApiErrorCode {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
    ? (error.code as ApiErrorCode)
    : "BACKEND_UNAVAILABLE";
}

function errorStatus(error: unknown): number | undefined {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : undefined;
}

function backendFailure(error: unknown, login = false): AuthBffResponse {
  const code = errorCode(error);
  const status = errorStatus(error);
  if (login && status === 401) return failure(401, "AUTH_INVALID_CREDENTIALS");
  if (status === 403) return failure(403, "AUTH_FORBIDDEN");
  if (status === 422) return failure(422, "VALIDATION_FAILED");
  if (status === 429) return failure(429, "RATE_LIMIT_EXCEEDED");
  if (code === "REQUEST_TIMEOUT" || code === "NETWORK_UNAVAILABLE")
    return failure(503, code);
  return unavailableAuthBffResponse();
}

async function readLoginPayload(request: Request): Promise<unknown> {
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();

  if (contentType === "application/x-www-form-urlencoded") {
    const form = new URLSearchParams(await request.text());
    return {
      identity: form.get("identity"),
      password: form.get("password"),
    };
  }

  if (contentType === "application/json") {
    return request.json();
  }

  throw new Error("Unsupported login content type.");
}

export async function handleLogin(
  request: Request,
  dependencies: AuthBffDependencies,
  context: AuthBffRequestContext,
): Promise<AuthBffResponse> {
  if (
    dependencies.rateLimiter !== undefined &&
    !(await dependencies.rateLimiter.check({ key: context.rateLimitKey }))
      .allowed
  ) {
    return failure(429, "RATE_LIMIT_EXCEEDED");
  }
  let payload: unknown;
  try {
    payload = await readLoginPayload(request);
  } catch {
    return failure(400, "VALIDATION_FAILED");
  }
  const credentials = loginSchema.safeParse(payload);
  if (!credentials.success) return failure(400, "VALIDATION_FAILED");
  try {
    const result = await dependencies.authRepository.login(credentials.data);
    return {
      status: 200,
      body: apiSuccess({ actor: safeAdmin(result.admin) }),
      cookie: { action: "set", token: result.token },
    };
  } catch (error) {
    return backendFailure(error, true);
  }
}

export function isNativeLoginFormRequest(request: Request): boolean {
  return (
    request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/x-www-form-urlencoded") === true
  );
}

export function toLoginHttpResponse(
  result: AuthBffResponse,
  isProduction: boolean,
  nativeFormRequest: boolean,
): Response {
  const response = toHttpResponse(result, isProduction);
  if (!nativeFormRequest || result.status !== 200) return response;

  const headers = new Headers(response.headers);
  headers.delete("content-type");
  headers.set("location", "/dashboard");

  return new Response(null, { status: 303, headers });
}

export async function handleSession(
  dependencies: AuthBffDependencies,
  context: AuthBffRequestContext,
): Promise<AuthBffResponse> {
  if (context.token === undefined) return failure(401, "AUTH_SESSION_EXPIRED");
  try {
    const admin = await dependencies.authRepository.getCurrentAdmin(
      context.token,
    );
    return {
      status: 200,
      body: apiSuccess({ authenticated: true, actor: safeAdmin(admin) }),
    };
  } catch (error) {
    const status = errorStatus(error);
    const code = errorCode(error);
    if (status === 401 || code === "AUTH_SESSION_EXPIRED")
      return {
        ...failure(401, "AUTH_SESSION_EXPIRED"),
        cookie: { action: "clear" },
      };
    // A 403 from the authoritative admin endpoint also terminates a non-admin/inactive session.
    if (status === 403 || code === "AUTH_FORBIDDEN")
      return { ...failure(403, "AUTH_FORBIDDEN"), cookie: { action: "clear" } };
    return backendFailure(error);
  }
}

export async function handleLogout(
  dependencies: AuthBffDependencies,
  context: AuthBffRequestContext,
): Promise<AuthBffResponse> {
  if (context.token !== undefined) {
    try {
      await dependencies.authRepository.logout(context.token);
    } catch {
      /* local logout is authoritative for this browser */
    }
  }
  return { status: 204, body: null, cookie: { action: "clear" } };
}

export function handleHealth(): AuthBffResponse {
  return { status: 200, body: apiSuccess({ status: "ok" }) };
}

function serializeCookie(
  name: string,
  value: string,
  options: ReturnType<typeof createSessionCookieOptions>,
): string {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path}`,
    `SameSite=${options.sameSite}`,
    "HttpOnly",
  ];
  if (options.secure) attributes.push("Secure");
  if (options.maxAge !== undefined)
    attributes.push(`Max-Age=${options.maxAge}`);
  return attributes.join("; ");
}

export function toHttpResponse(
  result: AuthBffResponse,
  isProduction: boolean,
): Response {
  const headers = new Headers({ "cache-control": "no-store" });
  const body = result.body === null ? null : JSON.stringify(result.body);
  if (body !== null)
    headers.set("content-type", "application/json; charset=utf-8");
  if (result.cookie?.action === "set")
    headers.set(
      "set-cookie",
      serializeCookie(
        sessionCookieName,
        result.cookie.token,
        createSessionCookieOptions(isProduction),
      ),
    );
  if (result.cookie?.action === "clear")
    headers.set(
      "set-cookie",
      serializeCookie(
        sessionCookieName,
        "",
        createSessionCookieClearOptions(isProduction),
      ),
    );
  return new Response(body, { status: result.status, headers });
}

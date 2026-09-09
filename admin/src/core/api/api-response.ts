export const apiErrorCodes = [
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_ACCOUNT_DISABLED",
  "AUTH_ACCOUNT_LOCKED",
  "AUTH_SESSION_EXPIRED",
  "AUTH_SESSION_REVOKED",
  "AUTH_FORBIDDEN",
  "AUTH_MFA_REQUIRED",
  "VALIDATION_FAILED",
  "RATE_LIMIT_EXCEEDED",
  "REQUEST_BODY_INVALID",
  "REQUEST_ABORTED",
  "REQUEST_TIMEOUT",
  "NETWORK_UNAVAILABLE",
  "BACKEND_UNAVAILABLE",
  "INVALID_BACKEND_RESPONSE",
  "UNKNOWN_ERROR",
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    requestId?: string;
  };
};

export type ApiFailure = {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
    requestId?: string;
    status?: number;
    method?: string;
    endpoint?: string;
    category?: ApiErrorCategory;
    retryable?: boolean;
    authenticationInvalid?: boolean;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type ApiFailureOptions = {
  backendCode?: unknown;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  status?: number;
  method?: string;
  endpoint?: string;
  message?: string;
};

export type ApiErrorCategory =
  | "aborted"
  | "authorization"
  | "client"
  | "network"
  | "server"
  | "timeout"
  | "validation";

const errorMessages: Record<ApiErrorCode, string> = {
  AUTH_INVALID_CREDENTIALS: "The provided credentials are invalid.",
  AUTH_ACCOUNT_DISABLED: "The account is disabled.",
  AUTH_ACCOUNT_LOCKED: "The account is locked.",
  AUTH_SESSION_EXPIRED: "The session has expired.",
  AUTH_SESSION_REVOKED: "The session has been revoked.",
  AUTH_FORBIDDEN: "The requested operation is forbidden.",
  AUTH_MFA_REQUIRED: "Additional authentication is required.",
  VALIDATION_FAILED: "The API request failed validation.",
  RATE_LIMIT_EXCEEDED: "The API rate limit was reached.",
  REQUEST_BODY_INVALID: "The API request body could not be serialized.",
  REQUEST_TIMEOUT: "The API request timed out.",
  REQUEST_ABORTED: "The API request was cancelled.",
  NETWORK_UNAVAILABLE: "The API service could not be reached.",
  BACKEND_UNAVAILABLE: "The API service is unavailable.",
  INVALID_BACKEND_RESPONSE: "The API response was invalid.",
  UNKNOWN_ERROR: "The API request could not be completed.",
};

export function apiSuccess<T>(data: T, requestId?: string): ApiSuccess<T> {
  if (requestId === undefined) {
    return { success: true, data };
  }

  return { success: true, data, meta: { requestId } };
}

export function apiFailure(
  code: ApiErrorCode,
  options: Omit<ApiFailureOptions, "backendCode"> = {},
): ApiFailure {
  const error: ApiFailure["error"] = {
    code,
    message: options.message ?? errorMessages[code],
  };

  if (options.fieldErrors !== undefined) {
    error.fieldErrors = options.fieldErrors;
  }

  if (options.requestId !== undefined) {
    error.requestId = options.requestId;
  }

  if (options.status !== undefined) {
    error.status = options.status;
  }

  if (options.method !== undefined) {
    error.method = options.method;
  }

  if (options.endpoint !== undefined) {
    error.endpoint = options.endpoint;
  }

  if (
    options.status !== undefined ||
    options.method !== undefined ||
    options.endpoint !== undefined
  ) {
    error.category = getApiErrorCategory(code, options.status);
    error.retryable = isRetryableApiFailure(code, options.status);
    error.authenticationInvalid =
      code === "AUTH_SESSION_EXPIRED" || options.status === 401;
  }

  return { success: false, error };
}

export function getApiErrorCategory(
  code: ApiErrorCode,
  status?: number,
): ApiErrorCategory {
  if (code === "REQUEST_TIMEOUT") return "timeout";
  if (code === "REQUEST_ABORTED") return "aborted";
  if (code === "NETWORK_UNAVAILABLE") return "network";
  if (code === "AUTH_SESSION_EXPIRED" || code === "AUTH_FORBIDDEN") {
    return "authorization";
  }
  if (code === "VALIDATION_FAILED") return "validation";
  if (status !== undefined && status >= 500) return "server";
  return "client";
}

export function isRetryableApiFailure(
  code: ApiErrorCode,
  status?: number,
): boolean {
  return (
    code === "NETWORK_UNAVAILABLE" ||
    code === "REQUEST_TIMEOUT" ||
    (status !== undefined && [502, 503, 504].includes(status))
  );
}

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return (
    typeof value === "string" && apiErrorCodes.includes(value as ApiErrorCode)
  );
}

export function mapHttpStatusToApiErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
    case 422:
      return "VALIDATION_FAILED";
    case 401:
      return "AUTH_SESSION_EXPIRED";
    case 403:
      return "AUTH_FORBIDDEN";
    case 429:
      return "RATE_LIMIT_EXCEEDED";
    default:
      return status >= 500 ? "BACKEND_UNAVAILABLE" : "UNKNOWN_ERROR";
  }
}

export function mapHttpFailure(
  status: number,
  options: ApiFailureOptions = {},
): ApiFailure {
  const code = isApiErrorCode(options.backendCode)
    ? options.backendCode
    : mapHttpStatusToApiErrorCode(status);

  return apiFailure(code, options);
}

export function isUnauthorizedFailure(response: ApiResponse<unknown>): boolean {
  return !response.success && response.error.authenticationInvalid === true;
}

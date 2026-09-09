import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import type {
  LoginCredentials,
  LoginFormResult,
} from "@/features/auth/presentation/components/login-form";

type BffFailureCode =
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_ACCOUNT_DISABLED"
  | "AUTH_ACCOUNT_LOCKED"
  | "RATE_LIMIT_EXCEEDED"
  | "REQUEST_TIMEOUT"
  | "NETWORK_UNAVAILABLE"
  | "BACKEND_UNAVAILABLE"
  | "INVALID_BACKEND_RESPONSE"
  | "UNKNOWN_ERROR"
  | "VALIDATION_FAILED";

type BffLoginResponse =
  | { success: true; data: { actor: AdminSummary } }
  | {
      success: false;
      error: {
        code: BffFailureCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

type Fetcher = typeof fetch;
type LoginFailure = Extract<LoginFormResult, { success: false }>;

const bffFailureCodes = [
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_ACCOUNT_DISABLED",
  "AUTH_ACCOUNT_LOCKED",
  "RATE_LIMIT_EXCEEDED",
  "REQUEST_TIMEOUT",
  "NETWORK_UNAVAILABLE",
  "BACKEND_UNAVAILABLE",
  "INVALID_BACKEND_RESPONSE",
  "UNKNOWN_ERROR",
  "VALIDATION_FAILED",
] as const;

const loginErrorCodes: Record<BffFailureCode, LoginFailure> = {
  AUTH_INVALID_CREDENTIALS: {
    success: false,
    code: "INVALID_CREDENTIALS",
    message: "بيانات تسجيل الدخول غير صحيحة",
  },
  AUTH_ACCOUNT_DISABLED: {
    success: false,
    code: "ACCOUNT_DISABLED",
    message: "هذا الحساب معطّل",
  },
  AUTH_ACCOUNT_LOCKED: {
    success: false,
    code: "ACCOUNT_LOCKED",
    message: "هذا الحساب مقفل مؤقتًا",
  },
  RATE_LIMIT_EXCEEDED: {
    success: false,
    code: "RATE_LIMITED",
    message: "عدد المحاولات كبير",
  },
  REQUEST_TIMEOUT: {
    success: false,
    code: "NETWORK_ERROR",
    message: "تعذّر الاتصال بالخدمة",
  },
  NETWORK_UNAVAILABLE: {
    success: false,
    code: "NETWORK_ERROR",
    message: "تعذّر الاتصال بالخدمة",
  },
  BACKEND_UNAVAILABLE: {
    success: false,
    code: "UNKNOWN_ERROR",
    message: "تعذّر إتمام تسجيل الدخول الآن",
  },
  INVALID_BACKEND_RESPONSE: {
    success: false,
    code: "UNKNOWN_ERROR",
    message: "تعذّر إتمام تسجيل الدخول الآن",
  },
  UNKNOWN_ERROR: {
    success: false,
    code: "UNKNOWN_ERROR",
    message: "تعذّر إتمام تسجيل الدخول الآن",
  },
  VALIDATION_FAILED: {
    success: false,
    code: "INVALID_CREDENTIALS",
    message: "راجع بيانات تسجيل الدخول",
  },
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAdminSummary(value: unknown): value is AdminSummary {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    isNonEmptyString(value.id) &&
    "name" in value &&
    isNonEmptyString(value.name) &&
    "email" in value &&
    isNonEmptyString(value.email) &&
    "role" in value &&
    ["admin", "editor", "author", "reviewer"].includes(value.role as string) &&
    "isActive" in value &&
    value.isActive === true &&
    "dashboardPermissions" in value &&
    Array.isArray(value.dashboardPermissions)
  );
}

function isBffLoginResponse(value: unknown): value is BffLoginResponse {
  if (typeof value !== "object" || value === null || !("success" in value))
    return false;
  if (value.success === true)
    return (
      "data" in value &&
      typeof value.data === "object" &&
      value.data !== null &&
      "actor" in value.data &&
      isAdminSummary(value.data.actor)
    );
  if (value.success !== false || !("error" in value)) return false;
  const error = value.error;
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    bffFailureCodes.includes(error.code as BffFailureCode)
  );
}

export function mapBffLoginFailure(
  code: BffFailureCode,
  fieldErrors?: Record<string, string[]>,
): LoginFormResult {
  const result = loginErrorCodes[code];
  return result.success || fieldErrors === undefined
    ? result
    : { ...result, fieldErrors };
}

export async function submitLoginToBff(
  credentials: LoginCredentials,
  fetcher: Fetcher = fetch,
): Promise<LoginFormResult> {
  let response: Response;
  try {
    response = await fetcher("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "same-origin",
    });
  } catch {
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "تعذّر الاتصال بالخدمة",
    };
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      message: "تعذّر إتمام تسجيل الدخول الآن",
    };
  }
  if (!isBffLoginResponse(payload))
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      message: "تعذّر إتمام تسجيل الدخول الآن",
    };
  if (payload.success)
    return response.ok
      ? { success: true }
      : {
          success: false,
          code: "UNKNOWN_ERROR",
          message: "تعذّر إتمام تسجيل الدخول الآن",
        };
  return mapBffLoginFailure(payload.error.code, payload.error.fieldErrors);
}

export function createBffLoginSubmitHandler(
  navigateToDashboard: () => void | Promise<void>,
  fetcher: Fetcher = fetch,
): (credentials: LoginCredentials) => Promise<LoginFormResult> {
  return async (credentials) => {
    const result = await submitLoginToBff(credentials, fetcher);
    if (!result.success) return result;
    try {
      await navigateToDashboard();
      return { success: true };
    } catch {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        message: "تعذّر الانتقال إلى لوحة التحكم",
      };
    }
  };
}

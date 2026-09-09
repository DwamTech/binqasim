export type AuthOperation = "login" | "logout" | "get_current_admin";

export type AuthApplicationError = {
  code: "AUTH_OPERATION_FAILED";
  operation: AuthOperation;
  message: string;
};

export type AuthApplicationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: AuthApplicationError;
    };

export function authSuccess<T>(data: T): AuthApplicationResult<T> {
  return { ok: true, data };
}

export function authFailure(
  operation: AuthOperation,
): AuthApplicationResult<never> {
  return {
    ok: false,
    error: {
      code: "AUTH_OPERATION_FAILED",
      operation,
      message: "The authentication operation could not be completed.",
    },
  };
}

import type { LoginCredentials } from "./login-form.schema";

export const loginFormContract = {
  action: "/api/auth/login",
  method: "post",
} as const;

export function createLoginFallbackRequest(
  credentials: LoginCredentials,
  origin: string,
): Request {
  return new Request(new URL(loginFormContract.action, origin), {
    method: loginFormContract.method.toUpperCase(),
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(credentials),
  });
}

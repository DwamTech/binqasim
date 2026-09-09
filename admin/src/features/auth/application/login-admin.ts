import type { AuthRepository } from "../domain/auth.repository";
import type {
  AdminSessionResult,
  LoginCredentials,
} from "../domain/auth.contracts";
import {
  authFailure,
  authSuccess,
  type AuthApplicationResult,
} from "./auth.result";

export async function loginAdmin(
  repository: AuthRepository,
  credentials: LoginCredentials,
): Promise<AuthApplicationResult<AdminSessionResult>> {
  try {
    return authSuccess(await repository.login(credentials));
  } catch {
    return authFailure("login");
  }
}

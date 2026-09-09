import type { AuthRepository } from "../domain/auth.repository";
import {
  authFailure,
  authSuccess,
  type AuthApplicationResult,
} from "./auth.result";

export async function logoutAdmin(
  repository: AuthRepository,
  token: string,
): Promise<AuthApplicationResult<void>> {
  try {
    await repository.logout(token);

    return authSuccess(undefined);
  } catch {
    return authFailure("logout");
  }
}

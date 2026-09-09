import type { AuthRepository } from "../domain/auth.repository";
import type { AdminSummary } from "../domain/auth.contracts";
import {
  authFailure,
  authSuccess,
  type AuthApplicationResult,
} from "./auth.result";

export async function getCurrentAdmin(
  repository: AuthRepository,
  token: string,
): Promise<AuthApplicationResult<AdminSummary>> {
  try {
    return authSuccess(await repository.getCurrentAdmin(token));
  } catch {
    return authFailure("get_current_admin");
  }
}

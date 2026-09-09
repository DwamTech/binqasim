import type { AuthRepository } from "../../features/auth/domain/auth.repository";
import type { AuthBffDependencies } from "./auth-bff.core";

export type AuthBffRuntimeResult =
  { ok: true; dependencies: AuthBffDependencies } | { ok: false };
export type CreateAuthBffRuntimeOptions = {
  authRepository: AuthRepository;
  isProduction: boolean;
};

export function createAuthBffRuntime(
  options: CreateAuthBffRuntimeOptions,
): AuthBffRuntimeResult {
  return {
    ok: true,
    dependencies: {
      authRepository: options.authRepository,
      isProduction: options.isProduction,
    },
  };
}

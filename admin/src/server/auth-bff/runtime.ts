import "server-only";

import { serverEnv } from "@/core/env/server";
import { BackendAuthRepository } from "@/features/auth/infrastructure/backend-auth.repository";

import {
  createAuthBffRuntime,
  type AuthBffRuntimeResult,
} from "./runtime.core";

export function getAuthBffRuntime(): AuthBffRuntimeResult {
  if (serverEnv.BACKEND_API_URL === undefined) {
    return { ok: false };
  }

  const isProduction = serverEnv.NODE_ENV === "production";

  return createAuthBffRuntime({
    authRepository: new BackendAuthRepository(),
    isProduction,
  });
}

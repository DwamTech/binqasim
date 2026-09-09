import "server-only";

import { serverEnv } from "@/core/env/server";

import { createServerApiClient } from "./server-api-client.core";
import { normalizeBackendApiUrl } from "./laravel-url";

export type {
  ApiErrorCode,
  ApiFailure,
  ApiResponse,
  ApiSuccess,
} from "./api-response";
export type {
  ApiRequestOptions,
  ServerApiClient,
  ValidatedApiRequestOptions,
} from "./server-api-client.core";

// BFF route handlers must use this configured, server-only client.
export const serverApiClient = createServerApiClient({
  baseUrl: () =>
    serverEnv.BACKEND_API_URL === undefined
      ? undefined
      : normalizeBackendApiUrl(serverEnv.BACKEND_API_URL),
  defaultLocale: "en",
  defaultTimeoutMs: 10_000,
  fetch: globalThis.fetch,
  normalizeApiBase: true,
});

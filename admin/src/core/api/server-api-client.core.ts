import type { ZodIssue, ZodType } from "zod";

import {
  apiFailure,
  apiSuccess,
  mapHttpFailure,
  type ApiFailure,
  type ApiResponse,
} from "./api-response";
import { createBackendUrl, type QueryParameters } from "./laravel-url";

export type ApiRequestOptions = {
  method?: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: HeadersInit;
  body?: unknown;
  /** Streams an incoming request body without buffering large uploads in Next.js. */
  bodyStream?: ReadableStream<Uint8Array>;
  query?: QueryParameters;
  /** Explicit extension point for a future server-side session adapter. */
  authorization?: string;
  /** Laravel-compatible multipart updates are sent as POST with _method. */
  multipartMethodOverride?: "PUT" | "PATCH" | "DELETE";
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
  locale?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type ValidatedApiRequestOptions<T> = ApiRequestOptions & {
  responseSchema: ZodType<T>;
};

export type ServerApiClientOptions = {
  baseUrl: () => string | undefined;
  defaultLocale?: string;
  defaultTimeoutMs?: number;
  fetch: typeof globalThis.fetch;
  normalizeApiBase?: boolean;
};

export interface ServerApiClient {
  request<T>(
    path: string,
    options: ValidatedApiRequestOptions<T>,
  ): Promise<ApiResponse<T>>;
  request(
    path: string,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<unknown>>;
}

function createRequestUrl(
  baseUrl: string,
  path: string,
  query: QueryParameters | undefined,
  normalizeApiBase: boolean | undefined,
): URL | ApiFailure {
  if (!normalizeApiBase && (!path.startsWith("/") || path.startsWith("//"))) {
    return apiFailure("UNKNOWN_ERROR");
  }

  try {
    return normalizeApiBase
      ? createBackendUrl(baseUrl, path, query)
      : appendQuery(new URL(path, `${baseUrl.replace(/\/$/, "")}/`), query);
  } catch {
    return apiFailure("UNKNOWN_ERROR");
  }
}

function appendQuery(url: URL, query: QueryParameters | undefined): URL {
  if (query === undefined) return url;
  for (const [key, rawValue] of Object.entries(query)) {
    for (const value of Array.isArray(rawValue) ? rawValue : [rawValue]) {
      if (value !== undefined && value !== null)
        url.searchParams.append(key, String(value));
    }
  }
  return url;
}

function createHeaders(
  body: unknown,
  headers: HeadersInit | undefined,
  locale: string | undefined,
): Headers {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("accept", "application/json");

  if (
    locale !== undefined &&
    locale.trim() !== "" &&
    !requestHeaders.has("accept-language")
  ) {
    requestHeaders.set("accept-language", locale);
  }

  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    !requestHeaders.has("content-type")
  ) {
    requestHeaders.set("content-type", "application/json");
  }

  return requestHeaders;
}

function cloneFormData(source: FormData): FormData {
  const copy = new FormData();
  for (const [key, value] of source.entries()) copy.append(key, value);
  return copy;
}

function getRequestId(response: Response): string | undefined {
  return response.headers.get("x-request-id") ?? undefined;
}

function createFailureOptions(
  backendCode: unknown,
  fieldErrors: Record<string, string[]> | undefined,
  requestId: string | undefined,
): {
  backendCode?: unknown;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
} {
  const options: {
    backendCode?: unknown;
    fieldErrors?: Record<string, string[]>;
    requestId?: string;
  } = {};

  if (backendCode !== undefined) {
    options.backendCode = backendCode;
  }

  if (fieldErrors !== undefined) {
    options.fieldErrors = fieldErrors;
  }

  if (requestId !== undefined) {
    options.requestId = requestId;
  }

  return options;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getFieldErrors(value: unknown): Record<string, string[]> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const candidate = isRecord(value.errors)
    ? value.errors
    : isRecord(value.fieldErrors)
      ? value.fieldErrors
      : undefined;
  if (candidate === undefined) return undefined;

  const fieldErrors: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(candidate)) {
    if (
      Array.isArray(messages) &&
      messages.every((message) => typeof message === "string")
    ) {
      fieldErrors[field] = messages;
    }
  }

  return Object.keys(fieldErrors).length === 0 ? undefined : fieldErrors;
}

function getBackendErrorCode(value: unknown): unknown {
  if (!isRecord(value)) {
    return undefined;
  }

  if ("code" in value) {
    return value.code;
  }

  return isRecord(value.error) ? value.error.code : undefined;
}

function getSchemaFieldErrors(
  issues: ZodIssue[],
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "response";
    errors[field] = [...(errors[field] ?? []), issue.message];
  }

  return errors;
}

async function parseJson(response: Response): Promise<unknown | undefined> {
  try {
    const body = await response.text();
    return body.trim() === "" ? undefined : JSON.parse(body);
  } catch {
    return undefined;
  }
}

function getBackendMessage(value: unknown): string | undefined {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : undefined;
}

function createTimeoutSignal(
  signal: AbortSignal | undefined,
  timeoutMs: number,
): {
  didTimeout: () => boolean;
  dispose: () => void;
  signal: AbortSignal;
} {
  const controller = new AbortController();
  let timedOut = false;
  const abortForCaller = () => controller.abort();

  if (signal !== undefined) {
    if (signal.aborted) {
      abortForCaller();
    } else {
      signal.addEventListener("abort", abortForCaller, { once: true });
    }
  }

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  return {
    didTimeout: () => timedOut,
    dispose: () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abortForCaller);
    },
    signal: controller.signal,
  };
}

class DefaultServerApiClient implements ServerApiClient {
  constructor(private readonly options: ServerApiClientOptions) {}

  request<T>(
    path: string,
    options: ValidatedApiRequestOptions<T>,
  ): Promise<ApiResponse<T>>;
  request(
    path: string,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<unknown>>;
  async request(
    path: string,
    options: ApiRequestOptions & { responseSchema?: ZodType } = {},
  ): Promise<ApiResponse<unknown>> {
    const configuredBaseUrl = this.options.baseUrl();

    if (configuredBaseUrl === undefined) {
      return apiFailure("UNKNOWN_ERROR");
    }

    const requestUrl = createRequestUrl(
      configuredBaseUrl,
      path,
      options.query,
      this.options.normalizeApiBase,
    );

    if (requestUrl instanceof URL === false) {
      return requestUrl;
    }

    const timeoutMs =
      options.timeoutMs ?? this.options.defaultTimeoutMs ?? 10_000;

    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      return apiFailure("UNKNOWN_ERROR");
    }

    if (options.body !== undefined && options.bodyStream !== undefined) {
      return apiFailure("REQUEST_BODY_INVALID", {
        method: options.method ?? "GET",
        endpoint: requestUrl.pathname,
      });
    }

    const timeoutSignal = createTimeoutSignal(options.signal, timeoutMs);
    let response: Response;

    const requestMethod = options.method ?? "GET";
    const endpoint = requestUrl.pathname;
    try {
      let body = options.body;
      let method = requestMethod;
      if (
        body instanceof FormData &&
        options.multipartMethodOverride !== undefined
      ) {
        const multipartBody = cloneFormData(body);
        multipartBody.set("_method", options.multipartMethodOverride);
        body = multipartBody;
        method = "POST";
      }
      const requestHeaders = createHeaders(
        body,
        options.headers,
        options.locale ?? this.options.defaultLocale,
      );
      if (options.authorization !== undefined) {
        requestHeaders.set("authorization", options.authorization);
      }

      const requestInit: RequestInit & {
        duplex?: "half";
        next?: ApiRequestOptions["next"];
      } = {
        method,
        headers: requestHeaders,
        signal: timeoutSignal.signal,
      };
      if (options.cache !== undefined) requestInit.cache = options.cache;
      if (options.next !== undefined) requestInit.next = options.next;

      if (body !== undefined && method !== "GET" && method !== "HEAD") {
        if (body instanceof FormData) {
          requestInit.body = body;
        } else {
          try {
            requestInit.body = JSON.stringify(body);
          } catch {
            return apiFailure("REQUEST_BODY_INVALID", {
              method: requestMethod,
              endpoint,
            });
          }
        }
      }
      if (
        options.bodyStream !== undefined &&
        method !== "GET" &&
        method !== "HEAD"
      ) {
        requestInit.body = options.bodyStream;
        requestInit.duplex = "half";
      }

      response = await this.options.fetch(requestUrl, requestInit);
    } catch {
      return timeoutSignal.didTimeout()
        ? apiFailure("REQUEST_TIMEOUT", { method: requestMethod, endpoint })
        : options.signal?.aborted
          ? apiFailure("REQUEST_ABORTED", { method: requestMethod, endpoint })
          : apiFailure("NETWORK_UNAVAILABLE", {
              method: requestMethod,
              endpoint,
            });
    } finally {
      timeoutSignal.dispose();
    }

    const requestId = getRequestId(response);
    const payload =
      response.status === 204 ? undefined : await parseJson(response);

    if (!response.ok) {
      const backendMessage = getBackendMessage(payload);
      return mapHttpFailure(response.status, {
        ...createFailureOptions(
          getBackendErrorCode(payload),
          getFieldErrors(payload),
          requestId,
        ),
        status: response.status,
        method: requestMethod,
        endpoint,
        ...(backendMessage === undefined ? {} : { message: backendMessage }),
      });
    }

    if (response.status !== 204 && payload === undefined) {
      return apiFailure("INVALID_BACKEND_RESPONSE", {
        ...createFailureOptions(undefined, undefined, requestId),
        method: requestMethod,
        endpoint,
      });
    }

    if (options.responseSchema !== undefined) {
      const result = options.responseSchema.safeParse(payload);

      if (!result.success) {
        return apiFailure("INVALID_BACKEND_RESPONSE", {
          ...createFailureOptions(
            undefined,
            getSchemaFieldErrors(result.error.issues),
            requestId,
          ),
          method: requestMethod,
          endpoint,
          message:
            "استجابة الخادم لا تطابق بيانات العملية المتوقعة. راجع الحقول الموضحة.",
        });
      }

      return apiSuccess(result.data, requestId);
    }

    return apiSuccess(payload, requestId);
  }
}

export function createServerApiClient(
  options: ServerApiClientOptions,
): ServerApiClient {
  return new DefaultServerApiClient(options);
}

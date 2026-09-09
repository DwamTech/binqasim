import {
  apiFailure,
  type ApiErrorCode,
  type ApiResponse,
} from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  hadithCardBulkMutationSchema,
  hadithCardDeleteSchema,
  hadithCardDetailSchema,
  hadithCardMutationSchema,
  hadithCardProjectDetailSchema,
  hadithCardProjectMutationSchema,
  hadithCardProjectPageSchema,
  hadithCardProjectQuerySchema,
} from "../domain/hadith-cards";
import {
  presentHadithCard,
  presentHadithCardProject,
  presentHadithCardProjectPage,
} from "./hadith-cards.presenter";

export type HadithCardsBffResponse = { status: number; body: object };

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function validId(id: string): string | null {
  return /^[1-9]\d*$/.test(id) ? id : null;
}

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): HadithCardsBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): HadithCardsBffResponse {
  const code: ApiErrorCode =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : status === 400
          ? "REQUEST_BODY_INVALID"
          : status === 429
            ? "RATE_LIMIT_EXCEEDED"
            : "VALIDATION_FAILED";
  return { status, body: apiFailure(code, { status }) };
}

async function readFormData(request: Request): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

function galleryFileCount(form: FormData): number {
  return form
    .getAll("gallery_files[]")
    .filter((value) => typeof File !== "undefined" && value instanceof File)
    .length;
}

export async function listHadithCardProjectsBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const parsed = hadithCardProjectQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );
  if (!parsed.success) return failure(422);
  const result = await client.request("/admin/hadith-cards/projects", {
    ...auth(token),
    query: parsed.data,
    responseSchema: hadithCardProjectPageSchema,
    cache: "no-store",
  });
  return response(
    result.success
      ? { ...result, data: presentHadithCardProjectPage(result.data) }
      : result,
  );
}

export async function getHadithCardProjectBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const projectId = validId(id);
  if (!projectId) return failure(404);
  const result = await client.request(
    `/admin/hadith-cards/projects/${projectId}`,
    {
      ...auth(token),
      responseSchema: hadithCardProjectDetailSchema,
      cache: "no-store",
    },
  );
  return response(
    result.success
      ? { ...result, data: presentHadithCardProject(result.data) }
      : result,
  );
}

export async function createHadithCardProjectBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const body = await readFormData(request);
  if (!body) return failure(400);
  const result = await client.request("/admin/hadith-cards/projects", {
    method: "POST",
    ...auth(token),
    body,
    responseSchema: hadithCardProjectMutationSchema,
    cache: "no-store",
    timeoutMs: 120_000,
  });
  return response(
    result.success
      ? {
          ...result,
          data: {
            ...result.data,
            data: presentHadithCardProject(result.data.data),
          },
        }
      : result,
    201,
  );
}

export async function updateHadithCardProjectBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const projectId = validId(id);
  if (!projectId) return failure(404);
  const body = await readFormData(request);
  if (!body) return failure(400);

  // Laravel/PHP only populates uploaded multipart files reliably on POST.
  // The API client adds `_method=PATCH` and forwards this request as POST.
  const result = await client.request(
    `/admin/hadith-cards/projects/${projectId}`,
    {
      method: "POST",
      multipartMethodOverride: "PATCH",
      ...auth(token),
      body,
      responseSchema: hadithCardProjectMutationSchema,
      cache: "no-store",
      timeoutMs: 120_000,
    },
  );
  return response(
    result.success
      ? {
          ...result,
          data: {
            ...result.data,
            data: presentHadithCardProject(result.data.data),
          },
        }
      : result,
  );
}

export async function deleteHadithCardProjectBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const projectId = validId(id);
  if (!projectId) return failure(404);
  return response(
    await client.request(`/admin/hadith-cards/projects/${projectId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: hadithCardDeleteSchema,
      cache: "no-store",
    }),
  );
}

/**
 * The browser chunks an arbitrary selection into fifty-file requests. Keeping
 * the same boundary in the BFF also protects the backend if a custom client
 * calls this endpoint directly.
 */
export async function bulkCreateHadithCardsBff(
  projectId: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const validProjectId = validId(projectId);
  if (!validProjectId) return failure(404);
  const body = await readFormData(request);
  if (!body) return failure(400);
  const count = galleryFileCount(body);
  if (count < 1 || count > 50) return failure(422);

  const result = await client.request(
    `/admin/hadith-cards/projects/${validProjectId}/cards/bulk`,
    {
      method: "POST",
      ...auth(token),
      body,
      responseSchema: hadithCardBulkMutationSchema,
      cache: "no-store",
      timeoutMs: 120_000,
    },
  );
  return response(
    result.success
      ? {
          ...result,
          data: {
            ...result.data,
            data: {
              ...result.data.data,
              cards: result.data.data.cards.map(presentHadithCard),
            },
          },
        }
      : result,
    201,
  );
}

export async function getHadithCardBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const cardId = validId(id);
  if (!cardId) return failure(404);
  const result = await client.request(`/admin/hadith-cards/cards/${cardId}`, {
    ...auth(token),
    responseSchema: hadithCardDetailSchema,
    cache: "no-store",
  });
  return response(
    result.success
      ? { ...result, data: presentHadithCard(result.data) }
      : result,
  );
}

export async function createHadithCardBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const body = await readFormData(request);
  if (!body) return failure(400);
  const result = await client.request("/admin/hadith-cards/cards", {
    method: "POST",
    ...auth(token),
    body,
    responseSchema: hadithCardMutationSchema,
    cache: "no-store",
    timeoutMs: 120_000,
  });
  return response(
    result.success
      ? {
          ...result,
          data: { ...result.data, data: presentHadithCard(result.data.data) },
        }
      : result,
    201,
  );
}

export async function updateHadithCardBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const cardId = validId(id);
  if (!cardId) return failure(404);
  const body = await readFormData(request);
  if (!body) return failure(400);

  // See updateHadithCardProjectBff: multipart PATCH is method-spoofed safely.
  const result = await client.request(`/admin/hadith-cards/cards/${cardId}`, {
    method: "POST",
    multipartMethodOverride: "PATCH",
    ...auth(token),
    body,
    responseSchema: hadithCardMutationSchema,
    cache: "no-store",
    timeoutMs: 120_000,
  });
  return response(
    result.success
      ? {
          ...result,
          data: { ...result.data, data: presentHadithCard(result.data.data) },
        }
      : result,
  );
}

export async function deleteHadithCardBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<HadithCardsBffResponse> {
  if (!token) return failure(401);
  const cardId = validId(id);
  if (!cardId) return failure(404);
  return response(
    await client.request(`/admin/hadith-cards/cards/${cardId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: hadithCardDeleteSchema,
      cache: "no-store",
    }),
  );
}

export function toHadithCardsHttpResponse(
  result: HadithCardsBffResponse,
): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}

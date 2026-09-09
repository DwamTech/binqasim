import {
  apiFailure,
  apiSuccess,
  type ApiResponse,
} from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import type { LibraryIndexSubmission } from "../domain/library-indexes.contracts";
import {
  libraryIndexRejectionSchema,
  libraryIndexSubmissionResponseSchema,
  isLibraryIndexSubmissionType,
} from "../domain/library-indexes.schemas";
import { presentLibraryIndexSubmission } from "./library-indexes.presenter";

export type LibraryIndexesBffResponse = { status: number; body: object };

function failure(status: number): LibraryIndexesBffResponse {
  const code =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : "VALIDATION_FAILED";
  return { status, body: apiFailure(code, { status }) };
}

function response(result: ApiResponse<unknown>): LibraryIndexesBffResponse {
  return {
    status: result.success ? 200 : (result.error.status ?? 503),
    body: result,
  };
}

function validId(value: string): string | null {
  return /^[1-9]\d*$/.test(value) ? value : null;
}

async function readRejectionReason(
  request: Request,
): Promise<{ rejection_reason: string } | null> {
  try {
    const parsed = libraryIndexRejectionSchema.safeParse(await request.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function reviewLibraryIndexSubmissionBff(
  type: string,
  id: string,
  action: "approve" | "reject",
  request: Request,
  client: ServerApiClient,
  token?: string,
  backendApiUrl?: string,
): Promise<LibraryIndexesBffResponse> {
  if (!token) return failure(401);
  if (!isLibraryIndexSubmissionType(type)) return failure(404);
  const submissionId = validId(id);
  if (!submissionId) return failure(404);

  const body = action === "reject" ? await readRejectionReason(request) : {};
  if (body === null) return failure(422);

  const result = await client.request<LibraryIndexSubmission>(
    `/admin/library-indexes/submissions/${type}/${submissionId}/${action}`,
    {
      method: "POST",
      authorization: `Bearer ${token}`,
      body,
      responseSchema: libraryIndexSubmissionResponseSchema,
      cache: "no-store",
    },
  );
  return result.success
    ? {
        status: 200,
        body: apiSuccess(
          presentLibraryIndexSubmission(result.data, backendApiUrl),
          result.meta?.requestId,
        ),
      }
    : response(result);
}

export function toLibraryIndexesHttpResponse(
  result: LibraryIndexesBffResponse,
): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}

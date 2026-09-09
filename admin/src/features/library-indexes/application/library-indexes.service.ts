import "server-only";

import { cookies } from "next/headers";

import { apiFailure, apiSuccess } from "@/core/api/api-response";
import { serverEnv } from "@/core/env/server";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import type {
  LibraryIndexSubmissionsQuery,
  LibraryIndexSubmissionType,
} from "../domain/library-indexes.contracts";
import { LibraryIndexesRepository } from "../infrastructure/library-indexes.repository";
import { presentLibraryIndexSubmission } from "./library-indexes.presenter";

const repository = new LibraryIndexesRepository();

async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get(sessionCookieName)?.value;
}

export async function getLibraryIndexSubmissions(
  query: LibraryIndexSubmissionsQuery,
) {
  const token = await sessionToken();
  if (!token) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  const result = await repository.list(query, token);
  return result.success
    ? apiSuccess(
        {
          ...result.data,
          data: result.data.data.map((item) =>
            presentLibraryIndexSubmission(item, serverEnv.BACKEND_API_URL),
          ),
        },
        result.meta?.requestId,
      )
    : result;
}

export async function getLibraryIndexSubmission(
  type: LibraryIndexSubmissionType,
  id: string,
) {
  const token = await sessionToken();
  if (!token) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  const result = await repository.detail(type, id, token);
  return result.success
    ? apiSuccess(
        presentLibraryIndexSubmission(result.data, serverEnv.BACKEND_API_URL),
        result.meta?.requestId,
      )
    : result;
}

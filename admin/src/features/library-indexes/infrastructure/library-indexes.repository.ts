import "server-only";

import {
  serverApiClient,
  type ServerApiClient,
} from "@/core/api/server-api-client";
import type {
  LibraryIndexSubmissionsPage,
  LibraryIndexSubmissionsQuery,
  LibraryIndexSubmission,
  LibraryIndexSubmissionType,
} from "../domain/library-indexes.contracts";
import {
  libraryIndexSubmissionResponseSchema,
  libraryIndexSubmissionsResponseSchema,
} from "../domain/library-indexes.schemas";

export class LibraryIndexesRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  list(
    query: LibraryIndexSubmissionsQuery,
    token: string,
    options?: { timeoutMs?: number },
  ) {
    return this.client.request<LibraryIndexSubmissionsPage>(
      "/admin/library-indexes/submissions",
      {
        query,
        authorization: `Bearer ${token}`,
        responseSchema: libraryIndexSubmissionsResponseSchema,
        cache: "no-store",
        ...(options?.timeoutMs === undefined
          ? {}
          : { timeoutMs: options.timeoutMs }),
      },
    );
  }

  detail(type: LibraryIndexSubmissionType, id: string, token: string) {
    return this.client.request<LibraryIndexSubmission>(
      `/admin/library-indexes/submissions/${type}/${encodeURIComponent(id)}`,
      {
        authorization: `Bearer ${token}`,
        responseSchema: libraryIndexSubmissionResponseSchema,
        cache: "no-store",
      },
    );
  }
}

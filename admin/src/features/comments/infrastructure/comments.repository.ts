import "server-only";

import {
  serverApiClient,
  type ServerApiClient,
} from "@/core/api/server-api-client";
import type { CommentsQuery } from "../domain/comments.contracts";
import {
  commentDetailSchema,
  commentOptionsSchema,
  commentsPageSchema,
  commentsStatsSchema,
} from "../domain/comments.schemas";
import { commentsBackendEndpoints } from "./comments.endpoints";
import { commentsQueryToBackend } from "./comments.query";

export class CommentsRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  private auth(token: string) {
    return { authorization: `Bearer ${token}` };
  }

  list(query: CommentsQuery, token: string) {
    return this.client.request(commentsBackendEndpoints.list, {
      query: commentsQueryToBackend(query),
      responseSchema: commentsPageSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }

  detail(id: string, token: string) {
    return this.client.request(commentsBackendEndpoints.detail(id), {
      responseSchema: commentDetailSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }

  options(token: string) {
    return this.client.request(commentsBackendEndpoints.options, {
      responseSchema: commentOptionsSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }

  stats(token: string, options?: { timeoutMs?: number }) {
    return this.client.request(commentsBackendEndpoints.stats, {
      responseSchema: commentsStatsSchema,
      cache: "no-store",
      ...(options?.timeoutMs === undefined
        ? {}
        : { timeoutMs: options.timeoutMs }),
      ...this.auth(token),
    });
  }
}

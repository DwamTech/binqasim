import "server-only";

import {
  serverApiClient,
  type ServerApiClient,
} from "@/core/api/server-api-client";
import type {
  FatwaInboxDetail,
  FatwaInboxPage,
  FatwaInboxQuery,
  FatwaInboxSummary,
} from "../domain/fatwa-inbox.contracts";
import {
  fatwaInboxDetailSchema,
  fatwaInboxPageSchema,
  fatwaInboxSummarySchema,
} from "../domain/fatwa-inbox.schemas";

export class FatwaInboxRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  list(query: FatwaInboxQuery, token: string) {
    return this.client.request<FatwaInboxPage>("/admin/fatwas", {
      query,
      authorization: `Bearer ${token}`,
      responseSchema: fatwaInboxPageSchema,
      cache: "no-store",
    });
  }

  summary(token: string) {
    return this.client.request<FatwaInboxSummary>("/admin/fatwas/summary", {
      authorization: `Bearer ${token}`,
      responseSchema: fatwaInboxSummarySchema,
      cache: "no-store",
    });
  }

  get(id: string, token: string) {
    return this.client.request<FatwaInboxDetail>(
      `/admin/fatwas/${encodeURIComponent(id)}`,
      {
        authorization: `Bearer ${token}`,
        responseSchema: fatwaInboxDetailSchema,
        cache: "no-store",
      },
    );
  }
}

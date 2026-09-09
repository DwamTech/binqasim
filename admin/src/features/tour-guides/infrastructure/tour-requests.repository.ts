import "server-only";

import type { ApiResponse } from "@/core/api/api-response";
import {
  serverApiClient,
  type ServerApiClient,
} from "@/core/api/server-api-client";

import type { TourRequestsSummary } from "../domain/tour-guides.contracts";
import { tourRequestsSummarySchema } from "../domain/tour-guides.schemas";

export class TourRequestsRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  summary(
    token: string,
    options: { timeoutMs?: number } = {},
  ): Promise<ApiResponse<TourRequestsSummary>> {
    return this.client.request("/admin/tour-requests/summary", {
      authorization: `Bearer ${token}`,
      responseSchema: tourRequestsSummarySchema,
      cache: "no-store",
      ...options,
    });
  }
}

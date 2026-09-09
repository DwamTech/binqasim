import "server-only";

import type {
  ApiResponse,
  ServerApiClient,
} from "@/core/api/server-api-client";
import { serverApiClient } from "@/core/api/server-api-client";

import type { ContentViewsSummary } from "../domain/content-views.contracts";
import { dashboardSummaryEnvelopeSchema } from "../domain/content-views.schemas";

type DashboardSummaryEnvelope = {
  data: {
    content_views?: ContentViewsSummary;
  };
};

export class DashboardSummaryRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  async getContentViews(
    token?: string,
  ): Promise<ApiResponse<ContentViewsSummary | null>> {
    const result = await this.client.request("/admin/dashboard/summary", {
      method: "GET",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      responseSchema: dashboardSummaryEnvelopeSchema,
      cache: "no-store",
    });

    return result.success
      ? {
          ...result,
          data:
            (result.data as DashboardSummaryEnvelope).data.content_views ??
            null,
        }
      : result;
  }
}

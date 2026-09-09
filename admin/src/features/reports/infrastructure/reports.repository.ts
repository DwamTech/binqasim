import "server-only";

import type {
  ApiResponse,
  ServerApiClient,
} from "@/core/api/server-api-client";
import { serverApiClient } from "@/core/api/server-api-client";

import type {
  ReportPayload,
  ReportQuery,
} from "../domain/reports.contracts";
import { reportEnvelopeSchema } from "../domain/reports.schemas";

type ReportEnvelope = { message: string; data: ReportPayload };

export class ReportsRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  async get(
    endpoint: string,
    query: ReportQuery,
    token?: string,
  ): Promise<ApiResponse<ReportPayload>> {
    const result = await this.client.request(endpoint, {
      method: "GET",
      query,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      responseSchema: reportEnvelopeSchema,
      cache: "no-store",
    });

    return result.success
      ? { ...result, data: (result.data as ReportEnvelope).data }
      : result;
  }
}

import "server-only";

import { serverApiClient } from "@/core/api/server-api-client";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import type { DissertationQuery } from "../domain/dissertations.contracts";
import {
  dissertationDetailResponseSchema,
  dissertationPageSchema,
} from "../domain/dissertations.schemas";

export class DissertationsRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  private auth(token: string) {
    return { authorization: `Bearer ${token}` };
  }

  list(query: DissertationQuery, token: string) {
    return this.client.request("/admin/dissertations", {
      method: "GET",
      query,
      responseSchema: dissertationPageSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }

  detail(id: string, token: string) {
    return this.client.request(
      `/admin/dissertations/${encodeURIComponent(id)}`,
      {
        method: "GET",
        responseSchema: dissertationDetailResponseSchema,
        cache: "no-store",
        ...this.auth(token),
      },
    );
  }
}

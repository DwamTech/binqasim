import "server-only";

import { serverApiClient } from "@/core/api/server-api-client";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  scientificVideoDetailSchema,
  scientificVideoOptionsSchema,
  scientificVideoPageSchema,
  type ScientificVideoQuery,
} from "../domain/scientific-videos";

export class ScientificVideosRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}
  private auth(token: string) {
    return { authorization: `Bearer ${token}` };
  }

  list(query: ScientificVideoQuery, token: string) {
    return this.client.request("/admin/scientific-videos/items", {
      method: "GET",
      query,
      responseSchema: scientificVideoPageSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }
  detail(id: string, token: string) {
    return this.client.request(
      `/admin/scientific-videos/items/${encodeURIComponent(id)}`,
      {
        method: "GET",
        responseSchema: scientificVideoDetailSchema,
        cache: "no-store",
        ...this.auth(token),
      },
    );
  }
  options(token: string) {
    return this.client.request("/admin/scientific-videos/options", {
      method: "GET",
      responseSchema: scientificVideoOptionsSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }
}

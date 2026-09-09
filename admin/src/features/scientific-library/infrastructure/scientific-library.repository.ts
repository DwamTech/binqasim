import "server-only";

import { serverApiClient } from "@/core/api/server-api-client";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import type { ScientificLibraryQuery } from "../domain/scientific-library.contracts";
import {
  scientificLibraryDetailResponseSchema,
  scientificLibraryOptionsResponseSchema,
  scientificLibraryPageSchema,
} from "../domain/scientific-library.schemas";

export class ScientificLibraryRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  private auth(token: string) {
    return { authorization: `Bearer ${token}` };
  }

  list(query: ScientificLibraryQuery, token: string) {
    return this.client.request("/admin/scientific-library/items", {
      method: "GET",
      query,
      responseSchema: scientificLibraryPageSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }

  detail(id: string, token: string) {
    return this.client.request(
      `/admin/scientific-library/items/${encodeURIComponent(id)}`,
      {
        method: "GET",
        responseSchema: scientificLibraryDetailResponseSchema,
        cache: "no-store",
        ...this.auth(token),
      },
    );
  }

  options(token: string) {
    return this.client.request("/admin/scientific-library/options", {
      method: "GET",
      responseSchema: scientificLibraryOptionsResponseSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }
}

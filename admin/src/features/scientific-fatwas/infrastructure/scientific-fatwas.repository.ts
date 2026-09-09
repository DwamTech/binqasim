import "server-only";

import {
  serverApiClient,
  type ServerApiClient,
} from "@/core/api/server-api-client";
import type {
  ScientificFatwaCategory,
  ScientificFatwaItem,
  ScientificFatwaPage,
  ScientificFatwaQuery,
} from "../domain/scientific-fatwas.contracts";
import {
  scientificFatwaCategoriesResponseSchema,
  scientificFatwaDetailSchema,
  scientificFatwaPageSchema,
} from "../domain/scientific-fatwas.schemas";

export class ScientificFatwasRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  list(query: ScientificFatwaQuery, token?: string) {
    return this.client.request<ScientificFatwaPage>(
      "/admin/scientific-fatwas/items",
      {
        query,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        responseSchema: scientificFatwaPageSchema,
        cache: "no-store",
      },
    );
  }

  get(id: string, token?: string) {
    return this.client.request<ScientificFatwaItem>(
      `/admin/scientific-fatwas/items/${encodeURIComponent(id)}`,
      {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        responseSchema: scientificFatwaDetailSchema,
        cache: "no-store",
      },
    );
  }

  categories(token?: string) {
    return this.client.request<{ data: ScientificFatwaCategory[] }>(
      "/admin/scientific-fatwas/categories",
      {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        responseSchema: scientificFatwaCategoriesResponseSchema,
        cache: "no-store",
      },
    );
  }
}

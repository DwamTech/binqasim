import "server-only";

import { z } from "zod";

import {
  serverApiClient,
  type ApiResponse,
  type ServerApiClient,
} from "@/core/api/server-api-client";
import type {
  AdminSummary,
  LaravelPaginator,
} from "@/core/api/laravel-contracts";

const sectionSchema = z
  .object({ id: z.number().or(z.string()), name: z.string() })
  .passthrough();
const adminSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});
const articleSchema = z.object({ id: z.number().or(z.string()) }).passthrough();
const articlePageSchema = z
  .object({
    current_page: z.number(),
    data: z.array(articleSchema),
    per_page: z.number(),
    total: z.number(),
  })
  .passthrough();

export type SectionSummary = z.infer<typeof sectionSchema>;
export type ArticleSummary = z.infer<typeof articleSchema>;

/** Representative adapters only; feature modules own any response unwrapping. */
export class LaravelApi {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  listSections(): Promise<ApiResponse<SectionSummary[]>> {
    return this.client.request("/sections", {
      responseSchema: z.array(sectionSchema),
    });
  }

  listArticles(
    page?: number,
  ): Promise<ApiResponse<LaravelPaginator<ArticleSummary>>> {
    return this.client.request("/articles", {
      ...(page === undefined ? {} : { query: { page } }),
      responseSchema: articlePageSchema,
    });
  }

  getCurrentAdmin(
    bearerToken: string,
  ): Promise<ApiResponse<{ admin: AdminSummary }>> {
    return this.client.request("/admin/me", {
      authorization: `Bearer ${bearerToken}`,
      responseSchema: z.object({ admin: adminSchema }),
    });
  }

  createMultipartUpdate(
    path: string,
    form: FormData,
    method: "PUT" | "PATCH" = "PUT",
  ): Promise<ApiResponse<unknown>> {
    return this.client.request(path, {
      method: "POST",
      body: form,
      multipartMethodOverride: method,
    });
  }
}

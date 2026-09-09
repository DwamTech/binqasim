import "server-only";

import type {
  ApiResponse,
  ServerApiClient,
} from "@/core/api/server-api-client";
import { serverApiClient } from "@/core/api/server-api-client";

import type {
  CreateVisualInput,
  UpdateVisualInput,
  VisualDetail,
  VisualListQuery,
  VisualPaginator,
} from "../domain/visuals.contracts";
import {
  visualMutationSchema,
  visualPaginatorSchema,
  visualSchema,
  visualSectionSchema,
} from "../domain/visuals.schemas";
import {
  compactVisualQuery,
  createVisualFormData,
  createVisualJson,
} from "../domain/visuals.request";

type MutationPayload = { message: string; visual?: VisualDetail | undefined };

export class VisualsRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  list(query: VisualListQuery = {}): Promise<ApiResponse<VisualPaginator>> {
    return this.client.request("/visuals", {
      method: "GET",
      query: compactVisualQuery(query),
      responseSchema: visualPaginatorSchema,
      cache: "no-store",
    });
  }

  sections() {
    return this.client.request("/sections", {
      method: "GET",
      query: { module: "visuals" },
      responseSchema: visualSectionSchema.array(),
      cache: "no-store",
    });
  }

  detail(id: string): Promise<ApiResponse<VisualDetail>> {
    return this.client.request(`/visuals/${encodeURIComponent(id)}`, {
      method: "GET",
      responseSchema: visualSchema,
      cache: "no-store",
    });
  }

  create(
    input: CreateVisualInput,
    token: string,
  ): Promise<ApiResponse<MutationPayload>> {
    const body =
      input.type === "link" && input.thumbnail === undefined
        ? createVisualJson(input)
        : createVisualFormData(input);
    return this.client.request("/visuals", {
      method: "POST",
      body,
      authorization: `Bearer ${token}`,
      responseSchema: visualMutationSchema,
    });
  }

  update(
    id: string,
    input: UpdateVisualInput,
    token: string,
  ): Promise<ApiResponse<MutationPayload>> {
    const hasFiles = input.file !== undefined || input.thumbnail !== undefined;
    return this.client.request(`/visuals/${encodeURIComponent(id)}`, {
      method: hasFiles ? "POST" : "PUT",
      body: hasFiles ? createVisualFormData(input) : createVisualJson(input),
      ...(hasFiles ? { multipartMethodOverride: "PUT" as const } : {}),
      authorization: `Bearer ${token}`,
      responseSchema: visualMutationSchema,
    });
  }

  remove(id: string, token: string): Promise<ApiResponse<unknown>> {
    return this.client.request(`/visuals/${encodeURIComponent(id)}`, {
      method: "DELETE",
      authorization: `Bearer ${token}`,
    });
  }
}

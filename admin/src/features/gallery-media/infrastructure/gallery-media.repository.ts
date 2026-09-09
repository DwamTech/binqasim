import "server-only";
import type {
  ApiResponse,
  ServerApiClient,
} from "@/core/api/server-api-client";
import { serverApiClient } from "@/core/api/server-api-client";
import type {
  GalleryMediaListQuery,
  GalleryMediaPaginator,
} from "../domain/gallery-media.contracts";
import {
  galleryMediaPaginatorSchema,
  galleryMediaUploadSchema,
} from "../domain/gallery-media.schemas";
import { compactGalleryMediaQuery } from "./gallery-media.query";

export class GalleryMediaRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}
  list(
    query: GalleryMediaListQuery = {},
    token?: string,
  ): Promise<ApiResponse<GalleryMediaPaginator>> {
    return this.client.request("/admin/gallery-media", {
      method: "GET",
      query: compactGalleryMediaQuery(query),
      responseSchema: galleryMediaPaginatorSchema,
      cache: "no-store",
      ...(token === undefined ? {} : { authorization: `Bearer ${token}` }),
    });
  }
  upload(file: File, token: string) {
    const body = new FormData();
    body.append("files[]", file);
    return this.client.request("/admin/gallery-media", {
      method: "POST",
      body,
      authorization: `Bearer ${token}`,
      responseSchema: galleryMediaUploadSchema,
    });
  }
  remove(id: number, token: string) {
    return this.client.request(
      `/admin/gallery-media/${encodeURIComponent(String(id))}`,
      { method: "DELETE", authorization: `Bearer ${token}` },
    );
  }
}

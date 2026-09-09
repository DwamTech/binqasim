import "server-only";
import type { ServerApiClient } from "@/core/api/server-api-client";
import { serverApiClient } from "@/core/api/server-api-client";
import {
  adminBookDetailResponseSchema,
  adminBooksPaginatorSchema,
  bookAuthorsSchema,
  libraryCategoriesResponseSchema,
  bookSeriesSchema,
} from "../domain/books.schemas";
import type { AdminBooksQuery } from "../domain/books.contracts";
import { compactBooksQuery } from "./books.query";
import {
  sectionPageSchema,
  sectionSchema,
} from "@/features/sections/sections.contracts";
export class BooksRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}
  private auth(token: string) {
    return { authorization: `Bearer ${token}` };
  }
  list(query: AdminBooksQuery, token: string) {
    const compacted = compactBooksQuery(query);
    const path = compacted.area
      ? `/admin/library/areas/${compacted.area}/books`
      : "/admin/library/books";
    const backendQuery = { ...compacted };
    delete backendQuery.area;
    return this.client.request(path, {
      method: "GET",
      query: backendQuery,
      responseSchema: adminBooksPaginatorSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }
  detail(id: string, token: string, area?: AdminBooksQuery["area"]) {
    return this.client.request(
      area
        ? `/admin/library/areas/${area}/books/${encodeURIComponent(id)}`
        : `/admin/library/books/${encodeURIComponent(id)}`,
      {
        method: "GET",
        responseSchema: adminBookDetailResponseSchema,
        cache: "no-store",
        ...this.auth(token),
      },
    );
  }
  series(token: string) {
    return this.client.request("/admin/library/series", {
      method: "GET",
      responseSchema: bookSeriesSchema.array(),
      cache: "no-store",
      ...this.auth(token),
    });
  }
  seriesItem(id: string, token: string) {
    return this.client.request(
      `/admin/library/series/${encodeURIComponent(id)}`,
      {
        method: "GET",
        responseSchema: bookSeriesSchema,
        cache: "no-store",
        ...this.auth(token),
      },
    );
  }
  authors(token: string) {
    return this.client.request("/admin/library/books/authors", {
      method: "GET",
      responseSchema: bookAuthorsSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }
  adminSections(token: string) {
    return this.client.request("/admin/sections", {
      method: "GET",
      query: { module: "books" },
      responseSchema: sectionPageSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }
  publicSections() {
    return this.client.request("/sections", {
      method: "GET",
      query: { module: "books" },
      responseSchema: sectionSchema.array(),
      cache: "no-store",
    });
  }
  categories(area: AdminBooksQuery["area"], token: string) {
    return this.client.request(`/admin/library/areas/${area}/categories`, {
      method: "GET",
      responseSchema: libraryCategoriesResponseSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }
}

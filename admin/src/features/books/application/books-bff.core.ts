import {
  apiFailure,
  apiSuccess,
  type ApiResponse,
} from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import { sectionSchema } from "@/features/sections/sections.contracts";
import {
  adminBookDetailResponseSchema,
  adminBooksPaginatorSchema,
  bookAuthorsSchema,
  bookDeleteResponseSchema,
  bookMutationResponseSchema,
  bookSeriesMutationResponseSchema,
  bookSeriesSchema,
  libraryCategoriesResponseSchema,
  libraryCategoryMutationResponseSchema,
} from "../domain/books.schemas";
import { isLibraryAreaSlug } from "../domain/library-areas";

export type BooksBffResponse = { status: number; body: object };

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): BooksBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): BooksBffResponse {
  const code =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : "VALIDATION_FAILED";
  return { status, body: apiFailure(code, { status }) };
}

function validId(id: string): string | null {
  return /^[1-9]\d*$/.test(id) ? id : null;
}

async function requestFormData(request: Request): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

export async function listBooks(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  const params = new URL(request.url).searchParams;
  const area = params.get("area");
  if (area && !isLibraryAreaSlug(area)) return failure(422);
  const query: Record<string, string> = {};
  for (const key of ["section_id", "series_id", "page"]) {
    const value = params.get(key);
    if (value && !/^[1-9]\d*$/.test(value)) return failure(422);
    if (value) query[key] = value;
  }
  const type = params.get("type");
  if (type && type !== "single" && type !== "part") return failure(422);
  if (type) query.type = type;
  return response(
    await client.request(
      area ? `/admin/library/areas/${area}/books` : "/admin/library/books",
      {
        ...auth(token),
        query,
        responseSchema: adminBooksPaginatorSchema,
        cache: "no-store",
      },
    ),
  );
}

export async function getBook(
  id: string,
  client: ServerApiClient,
  token?: string,
  area?: string | null,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  const bookId = validId(id);
  if (!bookId) return failure(404);
  if (area && !isLibraryAreaSlug(area)) return failure(422);
  return response(
    await client.request(
      area
        ? `/admin/library/areas/${area}/books/${bookId}`
        : `/admin/library/books/${bookId}`,
      {
        ...auth(token),
        responseSchema: adminBookDetailResponseSchema,
        cache: "no-store",
      },
    ),
  );
}

export async function createBook(
  request: Request,
  client: ServerApiClient,
  token?: string,
  area?: string | null,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  if (area && !isLibraryAreaSlug(area)) return failure(422);
  const body = await requestFormData(request);
  if (!body) return failure(400);
  return response(
    await client.request(
      area ? `/admin/library/areas/${area}/books` : "/admin/library/books",
      {
        method: "POST",
        ...auth(token),
        body,
        responseSchema: bookMutationResponseSchema,
        cache: "no-store",
        timeoutMs: 120_000,
      },
    ),
    201,
  );
}

export async function updateBook(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
  area?: string | null,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  if (area && !isLibraryAreaSlug(area)) return failure(422);
  const bookId = validId(id);
  if (!bookId) return failure(404);
  const body = await requestFormData(request);
  if (!body) return failure(400);
  return response(
    await client.request(
      area
        ? `/admin/library/areas/${area}/books/${bookId}`
        : `/admin/library/books/${bookId}`,
      {
        method: "POST",
        multipartMethodOverride: "PATCH",
        ...auth(token),
        body,
        responseSchema: bookMutationResponseSchema,
        cache: "no-store",
        timeoutMs: 120_000,
      },
    ),
  );
}

export async function deleteBook(
  id: string,
  client: ServerApiClient,
  token?: string,
  area?: string | null,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  if (area && !isLibraryAreaSlug(area)) return failure(422);
  const bookId = validId(id);
  if (!bookId) return failure(404);
  return response(
    await client.request(
      area
        ? `/admin/library/areas/${area}/books/${bookId}`
        : `/admin/library/books/${bookId}`,
      {
        method: "DELETE",
        ...auth(token),
        responseSchema: bookDeleteResponseSchema,
        cache: "no-store",
      },
    ),
  );
}

export async function getBookCatalogs(
  client: ServerApiClient,
  token?: string,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  const [authors, series, sections] = await Promise.all([
    client.request("/admin/library/books/authors", {
      ...auth(token),
      responseSchema: bookAuthorsSchema,
      cache: "no-store",
    }),
    client.request("/admin/library/series", {
      ...auth(token),
      responseSchema: bookSeriesSchema.array(),
      cache: "no-store",
    }),
    client.request("/sections", {
      query: { module: "books" },
      responseSchema: sectionSchema.array(),
      cache: "no-store",
    }),
  ]);
  if (!authors.success) return response(authors);
  if (!series.success) return response(series);
  const sectionItems = sections.success
    ? sections.data.map((section) => ({
        id: section.id,
        name: section.name,
        is_active: section.is_active,
      }))
    : [];
  return response(
    apiSuccess({
      authors: authors.data,
      series: series.data,
      sections: sectionItems,
      sectionsWarning: sections.success
        ? null
        : "تعذر تحميل الأقسام؛ يمكنك حفظ الكتاب بدون قسم.",
    }),
  );
}

async function jsonBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function createBookSeries(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  const body = await jsonBody(request);
  if (!body) return failure(400);
  return response(
    await client.request("/admin/library/series", {
      method: "POST",
      ...auth(token),
      body,
      responseSchema: bookSeriesMutationResponseSchema,
      cache: "no-store",
    }),
    201,
  );
}

export async function updateBookSeries(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  const seriesId = validId(id);
  if (!seriesId) return failure(404);
  const body = await jsonBody(request);
  if (!body) return failure(400);
  return response(
    await client.request(`/admin/library/series/${seriesId}`, {
      method: "PATCH",
      ...auth(token),
      body,
      responseSchema: bookSeriesMutationResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function deleteBookSeries(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  const seriesId = validId(id);
  if (!seriesId) return failure(404);
  return response(
    await client.request(`/admin/library/series/${seriesId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: bookDeleteResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function listLibraryCategories(
  area: string,
  client: ServerApiClient,
  token?: string,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  if (!isLibraryAreaSlug(area)) return failure(404);
  return response(
    await client.request(`/admin/library/areas/${area}/categories`, {
      ...auth(token),
      responseSchema: libraryCategoriesResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function createLibraryCategory(
  area: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  if (!isLibraryAreaSlug(area)) return failure(404);
  const body = await jsonBody(request);
  if (!body) return failure(400);
  return response(
    await client.request(`/admin/library/areas/${area}/categories`, {
      method: "POST",
      ...auth(token),
      body,
      responseSchema: libraryCategoryMutationResponseSchema,
      cache: "no-store",
    }),
    201,
  );
}

export async function updateLibraryCategory(
  area: string,
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  if (!isLibraryAreaSlug(area)) return failure(404);
  const categoryId = validId(id);
  if (!categoryId) return failure(404);
  const body = await jsonBody(request);
  if (!body) return failure(400);
  return response(
    await client.request(
      `/admin/library/areas/${area}/categories/${categoryId}`,
      {
        method: "PATCH",
        ...auth(token),
        body,
        responseSchema: libraryCategoryMutationResponseSchema,
        cache: "no-store",
      },
    ),
  );
}

export async function deleteLibraryCategory(
  area: string,
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<BooksBffResponse> {
  if (!token) return failure(401);
  if (!isLibraryAreaSlug(area)) return failure(404);
  const categoryId = validId(id);
  if (!categoryId) return failure(404);
  return response(
    await client.request(
      `/admin/library/areas/${area}/categories/${categoryId}`,
      {
        method: "DELETE",
        ...auth(token),
        responseSchema: bookDeleteResponseSchema,
        cache: "no-store",
      },
    ),
  );
}

export function toBooksHttpResponse(result: BooksBffResponse): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}

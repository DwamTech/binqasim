"use client";

import type {
  AdminBookDetailResponse,
  AdminBooksPaginator,
  AdminBooksQuery,
  BookCatalogs,
  BookDeleteResponse,
  BookFormFiles,
  BookFormValues,
  BookMutationResponse,
  BookSeries,
  LibraryCategoriesResponse,
  LibraryCategory,
} from "../domain/books.contracts";
import { createBookFormData } from "./books.form";
import { compactBooksQuery } from "../infrastructure/books.query";
import type { LibraryAreaSlug } from "../domain/library-areas";

type Failure = {
  success: false;
  error?: { fieldErrors?: Record<string, string[]> };
};

export class BooksClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(bookErrorMessage(status));
    this.name = "BooksClientError";
  }
}

export function bookErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (status === 404) return "الكتاب غير موجود أو تم حذفه.";
  if (status === 413) return "حجم الملف أكبر من الحد المسموح.";
  if (status === 422) return "راجع البيانات والملفات ثم حاول مرة أخرى.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500) return "خدمة الكتب غير متاحة الآن.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "AbortError")
      throw reason;
    throw new BooksClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new BooksClientError(response.status, failure?.error?.fieldErrors);
  }
  return payload.data;
}

export function listBooks(
  query: AdminBooksQuery,
  signal?: AbortSignal,
): Promise<AdminBooksPaginator> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(compactBooksQuery(query)))
    params.set(key, String(value));
  return request(`/api/books${params.size ? `?${params}` : ""}`, {
    ...(signal ? { signal } : {}),
  });
}

export function getBook(
  id: string,
  signal?: AbortSignal,
  area?: LibraryAreaSlug,
): Promise<AdminBookDetailResponse> {
  return request(
    `/api/books/${encodeURIComponent(id)}${area ? `?area=${area}` : ""}`,
    {
      ...(signal ? { signal } : {}),
    },
  );
}

export function getBookCatalogs(signal?: AbortSignal): Promise<BookCatalogs> {
  return request("/api/books/catalogs", {
    ...(signal ? { signal } : {}),
  });
}

export function createBook(
  values: BookFormValues,
  files: BookFormFiles,
  area?: LibraryAreaSlug,
  includePublicMetadata = false,
): Promise<BookMutationResponse> {
  return request(`/api/books${area ? `?area=${area}` : ""}`, {
    method: "POST",
    body: createBookFormData(values, files, includePublicMetadata),
  });
}

export function updateBook(
  id: string,
  values: BookFormValues,
  files: BookFormFiles,
  area?: LibraryAreaSlug,
  includePublicMetadata = false,
): Promise<BookMutationResponse> {
  return request(
    `/api/books/${encodeURIComponent(id)}${area ? `?area=${area}` : ""}`,
    {
      method: "PATCH",
      body: createBookFormData(values, files, includePublicMetadata),
    },
  );
}

export function deleteBook(
  id: string,
  area?: LibraryAreaSlug,
): Promise<BookDeleteResponse> {
  return request(
    `/api/books/${encodeURIComponent(id)}${area ? `?area=${area}` : ""}`,
    {
      method: "DELETE",
    },
  );
}

export function createBookSeries(values: {
  name: string;
  description: string;
}): Promise<{ message: string; data: BookSeries }> {
  return request("/api/books/series", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function updateBookSeries(
  id: string,
  values: { name: string; description: string },
): Promise<{ message: string; data: BookSeries }> {
  return request(`/api/books/series/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function deleteBookSeries(id: string): Promise<BookDeleteResponse> {
  return request(`/api/books/series/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function createLibraryCategory(
  area: LibraryAreaSlug,
  values: {
    name: string;
    slug?: string;
    description: string;
    is_active: boolean;
    sort_order: number;
  },
): Promise<{ message: string; data: LibraryCategory }> {
  return request(`/api/books/categories?area=${area}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function listLibraryCategories(
  area: LibraryAreaSlug,
): Promise<LibraryCategoriesResponse> {
  return request(`/api/books/categories?area=${area}`);
}

export function updateLibraryCategory(
  area: LibraryAreaSlug,
  id: number,
  values: Partial<{
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    sort_order: number;
  }>,
): Promise<{ message: string; data: LibraryCategory }> {
  return request(`/api/books/categories/${id}?area=${area}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function deleteLibraryCategory(
  area: LibraryAreaSlug,
  id: number,
): Promise<BookDeleteResponse> {
  return request(`/api/books/categories/${id}?area=${area}`, {
    method: "DELETE",
  });
}

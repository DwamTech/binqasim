"use client";

import type {
  PaginatedResource,
  TourGuide,
  TourGuideFormValues,
  TourGuidesQuery,
  TourGuidesSummary,
  TourRequest,
  TourRequestsQuery,
  TourRequestsSummary,
  TourRequestStatus,
} from "../domain/tour-guides.contracts";

type Success<T> = { success: true; data: T };
type Failure = {
  success: false;
  error?: {
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export class TourGuidesClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
    backendMessage?: string,
  ) {
    super(
      backendMessage && /[\u0600-\u06ff]/.test(backendMessage)
        ? backendMessage
        : tourGuidesErrorMessage(status),
    );
    this.name = "TourGuidesClientError";
  }
}

export function tourGuidesErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية إدارة الرحلات السياحية.";
  if (status === 404) return "العنصر المطلوب غير موجود.";
  if (status === 409) return "تعذر تنفيذ العملية بسبب ارتباطات قائمة.";
  if (status === 422) return "راجع البيانات المدخلة ثم حاول مرة أخرى.";
  if (status === 429) return "تم إرسال طلبات كثيرة. حاول لاحقًا.";
  if (status >= 500) return "خدمة الرحلات السياحية غير متاحة الآن.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        ...(options?.body && !(options.body instanceof FormData)
          ? { "content-type": "application/json" }
          : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new TourGuidesClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    Success<T> | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new TourGuidesClientError(
      response.status,
      failure?.error?.fieldErrors,
      failure?.error?.message,
    );
  }
  return payload.data;
}

function guideFormData(values: TourGuideFormValues, photo?: File): FormData {
  const form = new FormData();
  form.set("name", values.name);
  form.set("slug", values.slug);
  form.set("title", values.title);
  form.set("bio", values.bio);
  form.set("experience_years", String(values.experience_years));
  values.languages.forEach((value) => form.append("languages[]", value));
  values.tour_routes.forEach((value) => form.append("tour_routes[]", value));
  form.set("is_active", values.is_active ? "1" : "0");
  form.set("display_order", String(values.display_order));
  form.set("license_number", values.license_number);
  form.set("phone", values.phone);
  form.set("email", values.email);
  if (photo) form.set("photo", photo);
  return form;
}

export function listTourGuides(
  query: TourGuidesQuery,
  signal?: AbortSignal,
): Promise<PaginatedResource<TourGuide>> {
  const params = new URLSearchParams({
    page: String(query.page),
    per_page: String(query.per_page),
  });
  if (query.search) params.set("search", query.search);
  if (query.is_active) params.set("is_active", query.is_active);
  return request(`/api/tour-guides/guides?${params}`, {
    ...(signal ? { signal } : {}),
  });
}

const FILTER_GUIDES_MAX_PAGES = 25;

export async function listTourGuidesForFilter(
  signal?: AbortSignal,
): Promise<TourGuide[]> {
  const first = await listTourGuides({ page: 1, per_page: 100 }, signal);
  const lastPage = Math.min(first.meta.last_page, FILTER_GUIDES_MAX_PAGES);
  if (lastPage <= 1) return first.data;

  const remaining = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
      listTourGuides({ page: index + 2, per_page: 100 }, signal),
    ),
  );
  const guides = [first, ...remaining].flatMap((page) => page.data);
  return [...new Map(guides.map((guide) => [guide.id, guide])).values()];
}

export const getTourGuidesSummary = (signal?: AbortSignal) =>
  request<TourGuidesSummary>("/api/tour-guides/guides/summary", {
    ...(signal ? { signal } : {}),
  });

export const getTourGuide = (id: string | number, signal?: AbortSignal) =>
  request<TourGuide>(
    `/api/tour-guides/guides/${encodeURIComponent(String(id))}`,
    {
      ...(signal ? { signal } : {}),
    },
  );

export const createTourGuide = (values: TourGuideFormValues, photo: File) =>
  request<TourGuide>("/api/tour-guides/guides", {
    method: "POST",
    body: guideFormData(values, photo),
  });

export const updateTourGuide = (
  id: string | number,
  values: TourGuideFormValues,
  photo?: File,
) =>
  request<TourGuide>(
    `/api/tour-guides/guides/${encodeURIComponent(String(id))}`,
    {
      method: "PATCH",
      body: guideFormData(values, photo),
    },
  );

export const deleteTourGuide = (id: string | number) =>
  request<{ message?: string }>(
    `/api/tour-guides/guides/${encodeURIComponent(String(id))}`,
    { method: "DELETE" },
  );

export function listTourRequests(
  query: TourRequestsQuery,
  signal?: AbortSignal,
): Promise<PaginatedResource<TourRequest>> {
  const params = new URLSearchParams({
    page: String(query.page),
    per_page: String(query.per_page),
  });
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.guide_id) params.set("guide_id", String(query.guide_id));
  if (query.date_from) params.set("date_from", query.date_from);
  if (query.date_to) params.set("date_to", query.date_to);
  return request(`/api/tour-guides/requests?${params}`, {
    ...(signal ? { signal } : {}),
  });
}

export const getTourRequestsSummary = (signal?: AbortSignal) =>
  request<TourRequestsSummary>("/api/tour-guides/requests/summary", {
    ...(signal ? { signal } : {}),
  });

export const getTourRequest = (id: string | number, signal?: AbortSignal) =>
  request<TourRequest>(
    `/api/tour-guides/requests/${encodeURIComponent(String(id))}`,
    {
      ...(signal ? { signal } : {}),
    },
  );

export const updateTourRequestStatus = (
  id: string | number,
  status: TourRequestStatus,
  adminNote: string,
) =>
  request<TourRequest>(
    `/api/tour-guides/requests/${encodeURIComponent(String(id))}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        admin_note: adminNote.trim() || null,
      }),
    },
  );

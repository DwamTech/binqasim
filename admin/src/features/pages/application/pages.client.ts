"use client";

import type {
  CreatePageInput,
  PageDetail,
  PageList,
  PageMedia,
  PagePreview,
  PageRevisionDetail,
  PageRevisionList,
  SavePageDraftInput,
} from "../domain/pages.contracts";

type Failure = {
  success: false;
  error?: { message?: string; fieldErrors?: Record<string, string[]> };
};
type Success<T> = { success: true; data: T };

function pagesErrorMessage(status: number): string {
  if (status === 401) return "انتهت جلسة الدخول. سجّل الدخول ثم حاول مرة أخرى.";
  if (status === 403) return "لا تملك الصلاحية المطلوبة.";
  if (status === 404) return "لم تعد الصفحة أو العنصر المطلوب متاحًا.";
  if (status === 409) return "تغيّرت بيانات الصفحة. حدّث الصفحة قبل المحاولة مجددًا.";
  if (status === 413) return "حجم الملف أكبر من الحد المسموح.";
  if (status === 422) return "راجع الحقول المعلّمة ثم حاول مرة أخرى.";
  if (status === 429) return "توجد محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.";
  if (status >= 500) return "خدمة الصفحات غير متاحة الآن. حاول مرة أخرى بعد قليل.";
  return "تعذر إكمال العملية. حاول مرة أخرى.";
}

function fieldMessage(field: string): string {
  if (field === "title" || field.endsWith(".title"))
    return "أدخل عنوانًا واضحًا.";
  if (field === "slug")
    return "استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطات فقط.";
  if (field === "parent_id") return "اختر صفحة أم صالحة.";
  if (field === "file" || field.includes("media"))
    return "اختر ملفًا صالحًا ومتوافقًا مع نوع الوسائط.";
  if (field === "type") return "اختر نوع الوسائط الصحيح.";
  if (field.startsWith("seo_data")) return "راجع إعداد تحسين الظهور هذا.";
  if (field.startsWith("content")) return "راجع محتوى هذا القسم وأكمل بياناته.";
  return "راجع هذا الحقل ثم حاول مرة أخرى.";
}

export function localizePagesFieldErrors(
  errors?: Record<string, string[]>,
): Record<string, string[]> | undefined {
  if (!errors) return undefined;
  return Object.fromEntries(
    Object.keys(errors).map((field) => [field, [fieldMessage(field)]]),
  );
}

export class PagesClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
    message?: string,
  ) {
    super(
      message || pagesErrorMessage(status),
    );
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, credentials: "same-origin" });
  } catch {
    throw new PagesClientError(503, undefined, "خدمة الصفحات غير متاحة الآن.");
  }
  const payload = (await response.json().catch(() => null)) as
    Success<T> | Failure | null;
  if (!response.ok || !payload || !payload.success) {
    throw new PagesClientError(
      response.status,
      payload && !payload.success
        ? localizePagesFieldErrors(payload.error?.fieldErrors)
        : undefined,
    );
  }
  return payload.data;
}

export function listPages(
  query: URLSearchParams,
  signal?: AbortSignal,
): Promise<PageList> {
  return request(`/api/pages${query.size ? `?${query}` : ""}`, {
    ...(signal ? { signal } : {}),
  });
}
export function getPage(id: string, signal?: AbortSignal): Promise<PageDetail> {
  return request<{ data: PageDetail }>(`/api/pages/${encodeURIComponent(id)}`, {
    ...(signal ? { signal } : {}),
  }).then((response) => response.data);
}
export function deletePage(id: string): Promise<void> {
  return request(`/api/pages/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).then(() => undefined);
}
export function createPage(input: CreatePageInput): Promise<PageDetail> {
  return request<{ data: PageDetail }>("/api/pages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  }).then((response) => response.data);
}
export function savePageDraft(
  id: string,
  input: SavePageDraftInput,
): Promise<PageDetail> {
  return request<{ data: PageDetail }>(
    `/api/pages/${encodeURIComponent(id)}/draft`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  ).then((response) => response.data);
}
export function pageLifecycle(
  id: string,
  action: "publish" | "archive" | "restore-from-archive",
): Promise<PageDetail> {
  return request<{ data: PageDetail }>(
    `/api/pages/${encodeURIComponent(id)}/${action}`,
    { method: "POST" },
  ).then((response) => response.data);
}
export function uploadPageMedia(
  id: string,
  file: File,
  type: PageMedia["type"],
): Promise<PageMedia> {
  const body = new FormData();
  body.set("file", file);
  body.set("type", type);
  return request<{ data: PageMedia }>(
    `/api/pages/${encodeURIComponent(id)}/media`,
    { method: "POST", body },
  ).then((response) => response.data);
}

export function uploadPageImage(id: string, file: File): Promise<PageMedia> {
  return uploadPageMedia(id, file, "image");
}
export function createPagePreview(id: string): Promise<PagePreview> {
  return request<{ data: PagePreview }>(
    `/api/pages/${encodeURIComponent(id)}/preview`,
    { method: "POST" },
  ).then((response) => response.data);
}
export function listPageRevisions(
  id: string,
  page = 1,
): Promise<PageRevisionList> {
  return request<PageRevisionList>(
    `/api/pages/${encodeURIComponent(id)}/revisions?page=${page}`,
  );
}
export function getPageRevision(
  id: string,
  revisionId: string,
): Promise<PageRevisionDetail> {
  return request<{ data: PageRevisionDetail }>(
    `/api/pages/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revisionId)}`,
  ).then((x) => x.data);
}
export function restorePageRevision(
  id: string,
  revisionId: string,
): Promise<PageDetail> {
  return request<{ data: PageDetail }>(
    `/api/pages/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revisionId)}/restore`,
    { method: "POST" },
  ).then((x) => x.data);
}

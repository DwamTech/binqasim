"use client";

import {
  createScientificVideoFormData,
  type ScientificVideoDeleteResponse,
  type ScientificVideoFormFiles,
  type ScientificVideoFormValues,
  type ScientificVideoMutationResponse,
} from "./scientific-videos.client.types";

type Failure = {
  success: false;
  error?: { fieldErrors?: Record<string, string[]> };
};

export class ScientificVideoClientError extends Error {
  fieldErrors?: Record<string, string[]>;
  constructor(
    readonly status: number,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(
      status === 401
        ? "انتهت الجلسة. سجّل الدخول مرة أخرى."
        : status === 403
          ? "لا تملك صلاحية تنفيذ هذا الإجراء."
          : status === 404
            ? "المادة المرئية غير موجودة."
            : status === 413
              ? "حجم الملف أكبر من الحد المسموح."
              : status === 422
                ? "راجع البيانات والملفات ثم حاول مرة أخرى."
                : status >= 500
                  ? "خدمة المرئيات غير متاحة الآن."
                  : "تعذر إكمال العملية.",
    );
    this.name = "ScientificVideoClientError";
    if (fieldErrors) this.fieldErrors = fieldErrors;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch {
    throw new ScientificVideoClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true)
    throw new ScientificVideoClientError(
      response.status,
      (payload as Failure | null)?.error?.fieldErrors,
    );
  return payload.data;
}

export function createScientificVideo(
  values: ScientificVideoFormValues,
  files: ScientificVideoFormFiles,
) {
  return request<ScientificVideoMutationResponse>(
    "/api/scientific-videos/items",
    { method: "POST", body: createScientificVideoFormData(values, files) },
  );
}
export function updateScientificVideo(
  id: string,
  values: ScientificVideoFormValues,
  files: ScientificVideoFormFiles,
) {
  return request<ScientificVideoMutationResponse>(
    `/api/scientific-videos/items/${encodeURIComponent(id)}`,
    { method: "PATCH", body: createScientificVideoFormData(values, files) },
  );
}
export function deleteScientificVideo(id: string) {
  return request<ScientificVideoDeleteResponse>(
    `/api/scientific-videos/items/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

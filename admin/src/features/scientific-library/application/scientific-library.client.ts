"use client";

import type {
  ScientificLibraryDeleteResponse,
  ScientificLibraryFormFiles,
  ScientificLibraryFormValues,
  ScientificLibraryMutationResponse,
} from "../domain/scientific-library.contracts";
import { createScientificLibraryFormData } from "./scientific-library.form";

type Failure = {
  success: false;
  error?: { fieldErrors?: Record<string, string[]> };
};

export class ScientificLibraryClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(scientificLibraryErrorMessage(status));
    this.name = "ScientificLibraryClientError";
  }
}

export function scientificLibraryErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (status === 404) return "المصنَّف غير موجود أو تم حذفه.";
  if (status === 413) return "حجم الملف أكبر من الحد المسموح.";
  if (status === 422) return "راجع البيانات والملفات ثم حاول مرة أخرى.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500) return "خدمة المكتبة العلمية غير متاحة الآن.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch {
    throw new ScientificLibraryClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new ScientificLibraryClientError(
      response.status,
      failure?.error?.fieldErrors,
    );
  }
  return payload.data;
}

export function createScientificLibraryItem(
  values: ScientificLibraryFormValues,
  files: ScientificLibraryFormFiles,
): Promise<ScientificLibraryMutationResponse> {
  return request("/api/scientific-library/items", {
    method: "POST",
    body: createScientificLibraryFormData(values, files),
  });
}

export function updateScientificLibraryItem(
  id: string,
  values: ScientificLibraryFormValues,
  files: ScientificLibraryFormFiles,
): Promise<ScientificLibraryMutationResponse> {
  return request(`/api/scientific-library/items/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: createScientificLibraryFormData(values, files),
  });
}

export function deleteScientificLibraryItem(
  id: string,
): Promise<ScientificLibraryDeleteResponse> {
  return request(`/api/scientific-library/items/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

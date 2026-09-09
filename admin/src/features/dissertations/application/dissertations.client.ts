"use client";

import type {
  Dissertation,
  DissertationDeleteResponse,
  DissertationFormFiles,
  DissertationFormValues,
  DissertationMutationResponse,
  DissertationPage,
  DissertationQuery,
} from "../domain/dissertations.contracts";
import { dissertationQueryParams } from "../infrastructure/dissertations.query";
import { createDissertationFormData } from "./dissertations.form";

type Failure = {
  success: false;
  error?: {
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export class DissertationsClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
    message?: string,
  ) {
    super(message?.trim() || dissertationErrorMessage(status));
    this.name = "DissertationsClientError";
  }
}

function dissertationErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (status === 404) return "الرسالة العلمية غير موجودة أو تم حذفها.";
  if (status === 413) return "حجم الملف أكبر من الحد المسموح.";
  if (status === 422) return "راجع البيانات والملف ثم حاول مرة أخرى.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500) return "خدمة الرسائل العلمية غير متاحة الآن.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "AbortError")
      throw reason;
    throw new DissertationsClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new DissertationsClientError(
      response.status,
      failure?.error?.fieldErrors,
      failure?.error?.message,
    );
  }
  return payload.data;
}

export function listDissertations(
  query: DissertationQuery,
  signal?: AbortSignal,
): Promise<DissertationPage> {
  const params = dissertationQueryParams(query);
  return request(`/api/dissertations${params.size ? `?${params}` : ""}`, {
    ...(signal ? { signal } : {}),
  });
}

export function getDissertation(
  id: string,
  signal?: AbortSignal,
): Promise<Dissertation> {
  return request(`/api/dissertations/${encodeURIComponent(id)}`, {
    ...(signal ? { signal } : {}),
  });
}

export function createDissertation(
  values: DissertationFormValues,
  files: DissertationFormFiles,
): Promise<DissertationMutationResponse> {
  return request("/api/dissertations", {
    method: "POST",
    body: createDissertationFormData(values, files),
  });
}

export function updateDissertation(
  id: string,
  values: DissertationFormValues,
  files: DissertationFormFiles,
): Promise<DissertationMutationResponse> {
  return request(`/api/dissertations/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: createDissertationFormData(values, files),
  });
}

export function deleteDissertation(
  id: string,
): Promise<DissertationDeleteResponse> {
  return request(`/api/dissertations/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

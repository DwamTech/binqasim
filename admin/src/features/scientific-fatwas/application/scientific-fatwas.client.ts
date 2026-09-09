"use client";

import type {
  ScientificFatwaDeleteResponse,
  ScientificFatwaCategory,
  ScientificFatwaFormValues,
  ScientificFatwaItem,
  ScientificFatwaMutationResponse,
} from "../domain/scientific-fatwas.contracts";
import { createScientificFatwaFormData } from "./scientific-fatwas.form";

type Failure = {
  success: false;
  error?: { message?: string; fieldErrors?: Record<string, string[]> };
};

export class ScientificFatwaClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
    message?: string,
  ) {
    super(message?.trim() || errorMessage(status));
    this.name = "ScientificFatwaClientError";
  }
}

function errorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (status === 404) return "المسألة غير موجودة أو تم حذفها.";
  if (status === 409)
    return "لا يمكن تنفيذ العملية لارتباط السجل ببيانات أخرى.";
  if (status === 422) return "راجع بيانات المسألة ثم حاول مرة أخرى.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500) return "خدمة الفتاوى غير متاحة الآن.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch {
    throw new ScientificFatwaClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new ScientificFatwaClientError(
      response.status,
      failure?.error?.fieldErrors,
      failure?.error?.message,
    );
  }
  return payload.data;
}

export function createScientificFatwa(
  values: ScientificFatwaFormValues,
): Promise<ScientificFatwaMutationResponse> {
  return request("/api/scientific-fatwas/items", {
    method: "POST",
    body: createScientificFatwaFormData(values),
  });
}

export function updateScientificFatwa(
  id: string,
  values: ScientificFatwaFormValues,
): Promise<ScientificFatwaMutationResponse> {
  return request(`/api/scientific-fatwas/items/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: createScientificFatwaFormData(values),
  });
}

export function deleteScientificFatwa(
  id: string,
): Promise<ScientificFatwaDeleteResponse> {
  return request(`/api/scientific-fatwas/items/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getScientificFatwa(id: string): Promise<ScientificFatwaItem> {
  return request(`/api/scientific-fatwas/items/${encodeURIComponent(id)}`);
}

export function createScientificFatwaCategory(values: {
  name: string;
  is_active: boolean;
  sort_order: number;
}): Promise<{ message: string; data: ScientificFatwaCategory }> {
  return request("/api/scientific-fatwas/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function updateScientificFatwaCategory(
  id: string,
  values: { name: string; is_active: boolean; sort_order: number },
): Promise<{ message: string; data: ScientificFatwaCategory }> {
  return request(
    `/api/scientific-fatwas/categories/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}

export function deleteScientificFatwaCategory(
  id: string,
): Promise<ScientificFatwaDeleteResponse> {
  return request(
    `/api/scientific-fatwas/categories/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

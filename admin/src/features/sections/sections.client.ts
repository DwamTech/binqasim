"use client";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import type {
  Section,
  SectionFormValues,
  SectionPage,
  SectionQuery,
} from "./sections.contracts";

type Success<T> = { success: true; data: T };
type Failure = {
  success: false;
  error?: {
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export class SectionsClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(sectionErrorMessage(status));
    this.name = "SectionsClientError";
  }
}

export function sectionErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403)
    return `لا تملك صلاحية ${dashboardCopy.modules.sections.navigation}.`;
  if (status === 404) return "القسم غير موجود أو تم حذفه.";
  if (status === 409)
    return "لا يمكن حذف هذا القسم لأنه مرتبط بمحتوى حالي. انقل أو احذف المحتوى المرتبط أولًا، ثم أعد المحاولة.";
  if (status === 422) return "راجع البيانات المدخلة ثم حاول مرة أخرى.";
  if (status >= 500) return "خدمة الأقسام غير متاحة الآن. حاول مرة أخرى.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        ...(options?.body ? { "content-type": "application/json" } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new SectionsClientError(503);
  }

  const payload = (await response.json().catch(() => null)) as
    Success<T> | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failurePayload = payload as Failure | null;
    throw new SectionsClientError(
      response.status,
      failurePayload?.error?.fieldErrors,
    );
  }
  return payload.data;
}

export function listSections(
  query: SectionQuery,
  signal?: AbortSignal,
): Promise<SectionPage> {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.search) params.set("search", query.search);
  if (query.module) params.set("module", query.module);
  return request<SectionPage>(`/api/sections?${params}`, {
    ...(signal ? { signal } : {}),
  });
}

export function getSection(id: string, signal?: AbortSignal): Promise<Section> {
  return request<Section>(`/api/sections/${encodeURIComponent(id)}`, {
    ...(signal ? { signal } : {}),
  });
}

export function createSection(
  values: SectionFormValues,
): Promise<{ message: string; section: Section }> {
  return request("/api/sections", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateSection(
  id: string,
  values: SectionFormValues,
): Promise<{ message: string; section: Section }> {
  return request(`/api/sections/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export function deleteSection(id: string): Promise<{ message: string }> {
  return request(`/api/sections/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

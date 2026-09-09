"use client";

import type {
  BusinessSettings,
  PhoneSettings,
  SiteContact,
  SiteStatus,
  SocialSettings,
  SupportSettingKey,
  SupportSettings,
  SystemContentKey,
} from "./settings.contracts";

type Success<T> = { success: true; data: T };
type Failure = {
  success: false;
  error?: {
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export class SettingsClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(settingsErrorMessage(status));
    this.name = "SettingsClientError";
  }
}

export function settingsErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذه العملية.";
  if (status === 404) return "الإعداد المطلوب غير موجود.";
  if (status === 422) return "راجع القيم المدخلة ثم حاول مرة أخرى.";
  if (status >= 500) return "خدمة الإعدادات غير متاحة الآن. حاول مرة أخرى.";
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
    throw new SettingsClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    Success<T> | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new SettingsClientError(response.status, failure?.error?.fieldErrors);
  }
  return payload.data;
}

export const getContact = (signal?: AbortSignal) =>
  request<SiteContact>("/api/settings/contact", {
    ...(signal ? { signal } : {}),
  });

export const updateContact = (values: object) =>
  request<{ message: string; data: object }>("/api/settings/contact", {
    method: "PUT",
    body: JSON.stringify(values),
  });

export const updateContactFamily = (
  family: "social" | "phones" | "business",
  values: SocialSettings | PhoneSettings | BusinessSettings,
) =>
  request<{ message: string; data: object }>(
    `/api/settings/contact/${family}`,
    { method: "PUT", body: JSON.stringify(values) },
  );

export const getSupport = (signal?: AbortSignal) =>
  request<SupportSettings>("/api/settings/support", {
    ...(signal ? { signal } : {}),
  });

export const updateSupport = (key: SupportSettingKey, value: boolean) =>
  request<{ message: string }>("/api/settings/support", {
    method: "POST",
    body: JSON.stringify({ key, value }),
  });

export const updateSupportBulk = (value: boolean) =>
  request<{ message: string }>("/api/settings/support/bulk", {
    method: "POST",
    body: JSON.stringify({ value }),
  });

export const getSiteStatus = (signal?: AbortSignal) =>
  request<{ status: SiteStatus }>("/api/settings/status", {
    ...(signal ? { signal } : {}),
  });

export const updateSiteStatus = (status: SiteStatus) =>
  request<{ message: string; status: SiteStatus }>("/api/settings/status", {
    method: "POST",
    body: JSON.stringify({ status }),
  });

export const getSystemContent = (key: SystemContentKey, signal?: AbortSignal) =>
  request<{ key: SystemContentKey; content: string; exists?: boolean }>(
    `/api/settings/content/${key}`,
    { ...(signal ? { signal } : {}) },
  );

export const updateSystemContent = (key: SystemContentKey, content: string) =>
  request<{ message: string; data: object }>(`/api/settings/content/${key}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

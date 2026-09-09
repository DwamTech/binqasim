"use client";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import type {
  CreateSupervisorValues,
  EditSupervisorValues,
  Supervisor,
  SupervisorPage,
  SupervisorQuery,
} from "./supervisors.contracts";

type Success<T> = { success: true; data: T };
type Failure = {
  success: false;
  error?: { fieldErrors?: Record<string, string[]> };
};

export class SupervisorsClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(supervisorsErrorMessage(status));
    this.name = "SupervisorsClientError";
  }
}

export function supervisorsErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403)
    return `${dashboardCopy.modules.supervisors.navigation} متاحة لمدير النظام فقط.`;
  if (status === 404) return "حساب المشرف غير موجود.";
  if (status === 409)
    return "لا يمكن تنفيذ العملية لأنها ستؤدي إلى عدم وجود مدير نشط للنظام.";
  if (status === 422) return "راجع البيانات المدخلة ثم حاول مرة أخرى.";
  if (status === 429) return "تم إرسال طلبات كثيرة. حاول لاحقًا.";
  if (status >= 500) return "خدمة المشرفين غير متاحة الآن.";
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
    throw new SupervisorsClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    Success<T> | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new SupervisorsClientError(
      response.status,
      failure?.error?.fieldErrors,
    );
  }
  return payload.data;
}

export function listSupervisors(
  query: SupervisorQuery,
  signal?: AbortSignal,
): Promise<SupervisorPage> {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.search) params.set("search", query.search);
  if (query.role) params.set("role", query.role);
  if (query.is_active) params.set("is_active", query.is_active);
  if (query.permission) params.set("permission", query.permission);
  return request(`/api/supervisors?${params}`, {
    ...(signal ? { signal } : {}),
  });
}

export const getSupervisor = (id: string, signal?: AbortSignal) =>
  request<Supervisor>(`/api/supervisors/${encodeURIComponent(id)}`, {
    ...(signal ? { signal } : {}),
  });

export const createSupervisor = (values: CreateSupervisorValues) =>
  request<{ user: Supervisor }>("/api/supervisors", {
    method: "POST",
    body: JSON.stringify(values),
  });

export const updateSupervisor = (id: string, values: EditSupervisorValues) =>
  request<{ user: Supervisor }>(`/api/supervisors/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });

export const setSupervisorActive = (id: string, active: boolean) =>
  request<{ user: Supervisor }>(
    `/api/supervisors/${encodeURIComponent(id)}/${active ? "activate" : "deactivate"}`,
    { method: "POST" },
  );

export const deleteSupervisor = (id: string) =>
  request<{ message: string }>(`/api/supervisors/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const changeSupervisorPassword = (
  id: string,
  values: { password: string; password_confirmation: string },
) =>
  request<{ message: string }>(
    `/api/supervisors/${encodeURIComponent(id)}/password`,
    { method: "POST", body: JSON.stringify(values) },
  );

"use client";

import {
  joinApplicationPageSchema,
  joinApplicationSchema,
  type JoinApplication,
  type JoinApplicationPage,
  type JoinApplicationStatus,
  type JoinApplicationType,
} from "./join-applications.contracts";

type Envelope<T> = {
  success?: boolean;
  data?: T;
  error?: { message?: string };
};

async function request<T>(
  path: string,
  schema: { parse(value: unknown): T },
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.body instanceof FormData
        ? {}
        : { "content-type": "application/json" }),
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as Envelope<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(
      response.status === 403
        ? "هذه الصفحة متاحة لمدير النظام فقط."
        : payload.error?.message || "تعذر إتمام العملية.",
    );
  }
  return schema.parse(payload.data ?? payload);
}

export async function listJoinApplications(
  type: JoinApplicationType,
  query: URLSearchParams,
): Promise<JoinApplicationPage> {
  return request(
    `/api/join-applications/${type}?${query.toString()}`,
    joinApplicationPageSchema,
  );
}

export async function getJoinApplication(
  type: JoinApplicationType,
  id: string,
): Promise<JoinApplication> {
  return request(`/api/join-applications/${type}/${id}`, joinApplicationSchema);
}

export async function saveJoinApplication(
  type: JoinApplicationType,
  formData: FormData,
  id?: string,
): Promise<JoinApplication> {
  return request(
    `/api/join-applications/${type}${id ? `/${id}` : ""}`,
    joinApplicationSchema,
    { method: id ? "PATCH" : "POST", body: formData },
  );
}

export async function setJoinApplicationStatus(
  type: JoinApplicationType,
  id: number,
  status: JoinApplicationStatus,
  adminNote?: string,
): Promise<JoinApplication> {
  return request(
    `/api/join-applications/${type}/${id}/status`,
    joinApplicationSchema,
    {
      method: "PATCH",
      body: JSON.stringify({ status, admin_note: adminNote }),
    },
  );
}

export async function removeJoinApplication(
  type: JoinApplicationType,
  id: number,
): Promise<void> {
  const response = await fetch(`/api/join-applications/${type}/${id}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error("تعذر حذف الطلب.");
}

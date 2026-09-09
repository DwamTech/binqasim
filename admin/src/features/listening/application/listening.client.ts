"use client";

import { dashboardCopy } from "@/core/config/dashboard-copy";

import type {
  ListeningDeleteResponse,
  ListeningSeries,
  ListeningSeriesFormFiles,
  ListeningSeriesFormValues,
  ListeningSeriesMutationResponse,
  ListeningSeriesPage,
  ListeningSeriesQuery,
  ListeningSession,
  ListeningSessionFormFiles,
  ListeningSessionFormValues,
  ListeningSessionMutationResponse,
  ListeningSessionPage,
  ListeningSessionQuery,
} from "../domain/listening.contracts";
import {
  listeningSeriesQueryParams,
  listeningSessionQueryParams,
} from "../infrastructure/listening.query";
import {
  createListeningSeriesFormData,
  createListeningSessionFormData,
} from "./listening.form";

type Failure = {
  success: false;
  error?: { message?: string; fieldErrors?: Record<string, string[]> };
};

export class ListeningClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
    message?: string,
  ) {
    super(message?.trim() || listeningErrorMessage(status));
    this.name = "ListeningClientError";
  }
}

function listeningErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (status === 404) return "السجل المطلوب غير موجود أو تم حذفه.";
  if (status === 413) return "حجم الملف أكبر من الحد المسموح.";
  if (status === 422) return "راجع البيانات والملف ثم حاول مرة أخرى.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500)
    return `خدمة ${dashboardCopy.modules.listening.navigation} غير متاحة الآن.`;
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "AbortError") {
      throw reason;
    }
    throw new ListeningClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new ListeningClientError(
      response.status,
      failure?.error?.fieldErrors,
      failure?.error?.message,
    );
  }
  return payload.data;
}

export function listListeningSeries(
  query: ListeningSeriesQuery,
  signal?: AbortSignal,
): Promise<ListeningSeriesPage> {
  const params = listeningSeriesQueryParams(query);
  return request(`/api/listening/series${params.size ? `?${params}` : ""}`, {
    ...(signal ? { signal } : {}),
  });
}

export function getListeningSeries(
  id: string,
  signal?: AbortSignal,
): Promise<ListeningSeries> {
  return request(`/api/listening/series/${encodeURIComponent(id)}`, {
    ...(signal ? { signal } : {}),
  });
}

export function createListeningSeries(
  values: ListeningSeriesFormValues,
  files: ListeningSeriesFormFiles,
): Promise<ListeningSeriesMutationResponse> {
  return request("/api/listening/series", {
    method: "POST",
    body: createListeningSeriesFormData(values, files),
  });
}

export function updateListeningSeries(
  id: string,
  values: ListeningSeriesFormValues,
  files: ListeningSeriesFormFiles,
): Promise<ListeningSeriesMutationResponse> {
  return request(`/api/listening/series/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: createListeningSeriesFormData(values, files),
  });
}

export function deleteListeningSeries(
  id: string,
): Promise<ListeningDeleteResponse> {
  return request(`/api/listening/series/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function listListeningSessions(
  query: ListeningSessionQuery,
  signal?: AbortSignal,
): Promise<ListeningSessionPage> {
  const params = listeningSessionQueryParams(query);
  return request(`/api/listening/sessions${params.size ? `?${params}` : ""}`, {
    ...(signal ? { signal } : {}),
  });
}

export function getListeningSession(id: string): Promise<ListeningSession> {
  return request(`/api/listening/sessions/${encodeURIComponent(id)}`);
}

export function createListeningSession(
  values: ListeningSessionFormValues,
  files: ListeningSessionFormFiles,
): Promise<ListeningSessionMutationResponse> {
  return request("/api/listening/sessions", {
    method: "POST",
    body: createListeningSessionFormData(values, files),
  });
}

export function updateListeningSession(
  id: string,
  values: ListeningSessionFormValues,
  files: ListeningSessionFormFiles,
): Promise<ListeningSessionMutationResponse> {
  return request(`/api/listening/sessions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: createListeningSessionFormData(values, files),
  });
}

export function deleteListeningSession(
  id: string,
): Promise<ListeningDeleteResponse> {
  return request(`/api/listening/sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

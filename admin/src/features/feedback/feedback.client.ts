"use client";

import type {
  FeedbackItem,
  FeedbackPage,
  FeedbackQuery,
  FeedbackStatus,
} from "./feedback.contracts";
import { normalizeFeedbackQuery } from "./feedback.contracts";

type Failure = {
  success: false;
  error?: { fieldErrors?: Record<string, string[]> };
};

export class FeedbackClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(feedbackErrorMessage(status));
    this.name = "FeedbackClientError";
  }
}

export function feedbackErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "هذه الصفحة متاحة للمدير فقط.";
  if (status === 404) return "الطلب غير موجود أو تم حذفه.";
  if (status === 422) return "الحالة أو البيانات المرسلة غير صالحة.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم حاول مجددًا.";
  if (status >= 500) return "خدمة الشكاوى والمقترحات غير متاحة الآن.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "AbortError")
      throw reason;
    throw new FeedbackClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new FeedbackClientError(response.status, failure?.error?.fieldErrors);
  }
  return payload.data;
}

export function listFeedback(
  query: FeedbackQuery,
  signal?: AbortSignal,
): Promise<FeedbackPage> {
  const normalized = normalizeFeedbackQuery(query);
  const params = new URLSearchParams({
    type: normalized.type,
    page: String(normalized.page),
    per_page: String(normalized.per_page),
  });
  if (normalized.status) params.set("status", normalized.status);
  if (normalized.search) params.set("search", normalized.search);
  return request(`/api/feedback?${params}`, {
    ...(signal ? { signal } : {}),
  });
}

export function getFeedback(
  id: string,
  signal?: AbortSignal,
): Promise<FeedbackItem> {
  return request(`/api/feedback/${encodeURIComponent(id)}`, {
    ...(signal ? { signal } : {}),
  });
}

export function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
  adminNote?: string,
): Promise<FeedbackItem> {
  return request(`/api/feedback/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      status,
      ...(adminNote === undefined ? {} : { admin_note: adminNote }),
    }),
  });
}

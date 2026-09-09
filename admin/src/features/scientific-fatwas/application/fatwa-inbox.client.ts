"use client";

import type {
  FatwaAnswerValues,
  FatwaInboxMutation,
} from "../domain/fatwa-inbox.contracts";

type Failure = {
  success: false;
  error?: { message?: string; fieldErrors?: Record<string, string[]> };
};

export class FatwaInboxClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
    message?: string,
  ) {
    super(message?.trim() || inboxErrorMessage(status));
    this.name = "FatwaInboxClientError";
  }
}

function inboxErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (status === 404) return "السؤال غير موجود أو تم حذفه.";
  if (status === 409)
    return "تغيرت بيانات السؤال أو حالته. حدّث الصفحة ثم أعد المحاولة.";
  if (status === 422) return "راجع بيانات الجواب ثم حاول مرة أخرى.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500) return "خدمة صندوق الأسئلة غير متاحة الآن.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch {
    throw new FatwaInboxClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new FatwaInboxClientError(
      response.status,
      failure?.error?.fieldErrors,
      failure?.error?.message,
    );
  }
  return payload.data;
}

function answerPayload(values: FatwaAnswerValues, updating: boolean) {
  return {
    answer: values.answer.trim(),
    visibility: values.visibility,
    ...(values.visibility === "public"
      ? {
          question_title: values.question_title.trim(),
          category_id: values.category_id,
          is_listed: values.is_listed,
        }
      : {}),
    ...(updating
      ? {
          notify_user: values.notify_user,
          expected_updated_at: values.expected_updated_at,
        }
      : {}),
  };
}

export function answerFatwaInbox(
  id: string,
  values: FatwaAnswerValues,
): Promise<FatwaInboxMutation> {
  return request(
    `/api/scientific-fatwas/inbox/${encodeURIComponent(id)}/answer`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(answerPayload(values, false)),
    },
  );
}

export function updateFatwaInboxAnswer(
  id: string,
  values: FatwaAnswerValues,
): Promise<FatwaInboxMutation> {
  return request(
    `/api/scientific-fatwas/inbox/${encodeURIComponent(id)}/answer`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(answerPayload(values, true)),
    },
  );
}

export function archiveFatwaInbox(id: string): Promise<FatwaInboxMutation> {
  return request(
    `/api/scientific-fatwas/inbox/${encodeURIComponent(id)}/archive`,
    { method: "POST" },
  );
}

export function restoreFatwaInbox(id: string): Promise<FatwaInboxMutation> {
  return request(
    `/api/scientific-fatwas/inbox/${encodeURIComponent(id)}/restore`,
    { method: "POST" },
  );
}

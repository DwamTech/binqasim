"use client";

import type {
  LibraryIndexSubmission,
  LibraryIndexSubmissionType,
} from "../domain/library-indexes.contracts";

type FailurePayload = {
  success: false;
  error?: {
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export class LibraryIndexesClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(libraryIndexesErrorMessage(status));
    this.name = "LibraryIndexesClientError";
  }
}

function libraryIndexesErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية مراجعة هذا الطلب.";
  if (status === 404) return "الطلب غير موجود أو لم يعد متاحًا.";
  if (status === 409) return "تغيّرت حالة الطلب. حدّث الصفحة ثم أعد المحاولة.";
  if (status === 422) return "أدخل سبب رفض واضحًا ثم حاول مرة أخرى.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500) return "خدمة سجلات المكتبة غير متاحة الآن.";
  return "تعذر إكمال مراجعة الطلب.";
}

async function mutate(
  type: LibraryIndexSubmissionType,
  id: number,
  action: "approve" | "reject",
  rejectionReason?: string,
): Promise<LibraryIndexSubmission> {
  let response: Response;
  try {
    response = await fetch(
      `/api/library-indexes/submissions/${type}/${id}/${action}`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          action === "reject"
            ? { rejection_reason: rejectionReason?.trim() ?? "" }
            : {},
        ),
      },
    );
  } catch {
    throw new LibraryIndexesClientError(503);
  }

  const payload = (await response.json().catch(() => null)) as
    { success: true; data: LibraryIndexSubmission } | FailurePayload | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as FailurePayload | null;
    throw new LibraryIndexesClientError(
      response.status,
      failure?.error?.fieldErrors,
    );
  }
  return payload.data;
}

export function approveLibraryIndexSubmission(
  type: LibraryIndexSubmissionType,
  id: number,
): Promise<LibraryIndexSubmission> {
  return mutate(type, id, "approve");
}

export function rejectLibraryIndexSubmission(
  type: LibraryIndexSubmissionType,
  id: number,
  rejectionReason: string,
): Promise<LibraryIndexSubmission> {
  return mutate(type, id, "reject", rejectionReason);
}

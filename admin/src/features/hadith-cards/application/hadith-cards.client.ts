"use client";

import type {
  HadithCard,
  HadithCardBulkMutation,
  HadithCardFormFiles,
  HadithCardFormValues,
  HadithCardProject,
  HadithCardProjectFormValues,
  HadithCardProjectFormFiles,
  HadithCardProjectPage,
  HadithCardProjectQuery,
} from "../domain/hadith-cards";
import {
  createHadithCardFormData,
  createHadithCardGalleryFormData,
  createHadithCardProjectFormData,
} from "../domain/hadith-cards";

type Mutation<T> = { message: string; data: T };
type DeleteResponse = { message: string };

export type HadithCardGalleryUploadProgress = {
  completed: number;
  total: number;
  batch: number;
  batches: number;
};

/** Browser-side payload limit; deliberately below the backend's hard cap of 50
 * to stay within common PHP/aaPanel post_max_size deployments. */
export const hadithCardGalleryUploadBatchSize = 10;
type Failure = {
  success: false;
  error?: { message?: string; fieldErrors?: Record<string, string[]> };
};

export class HadithCardsClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
    message?: string,
  ) {
    super(message?.trim() || hadithCardsErrorMessage(status));
    this.name = "HadithCardsClientError";
  }
}

function hadithCardsErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (status === 404) return "العنصر المطلوب غير موجود أو تم حذفه.";
  if (status === 413) return "حجم الصورة أكبر من الحد المسموح.";
  if (status === 422) return "راجع الحقول ثم حاول الحفظ مرة أخرى.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500) return "خدمة البطاقات الحديثية غير متاحة الآن.";
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
    throw new HadithCardsClientError(503);
  }

  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new HadithCardsClientError(
      response.status,
      failure?.error?.fieldErrors,
      failure?.error?.message,
    );
  }
  return payload.data;
}

function projectQueryParams(query: HadithCardProjectQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    if (key === "page" && value === 1) continue;
    if (key === "per_page" && value === 50) continue;
    params.set(key, String(value));
  }
  return params;
}

export function listHadithCardProjects(
  query: HadithCardProjectQuery,
  signal?: AbortSignal,
): Promise<HadithCardProjectPage> {
  const params = projectQueryParams(query);
  return request(
    `/api/hadith-cards/projects${params.size ? `?${params.toString()}` : ""}`,
    signal ? { signal } : undefined,
  );
}

export function getHadithCardProject(
  id: string,
  signal?: AbortSignal,
): Promise<HadithCardProject> {
  return request(`/api/hadith-cards/projects/${encodeURIComponent(id)}`, {
    ...(signal ? { signal } : {}),
  });
}

export function createHadithCardProject(
  values: HadithCardProjectFormValues,
  files: HadithCardProjectFormFiles = {},
): Promise<Mutation<HadithCardProject>> {
  return request("/api/hadith-cards/projects", {
    method: "POST",
    body: createHadithCardProjectFormData(values, files),
  });
}

export function updateHadithCardProject(
  id: string,
  values: HadithCardProjectFormValues,
  files: HadithCardProjectFormFiles = {},
): Promise<Mutation<HadithCardProject>> {
  return request(`/api/hadith-cards/projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: createHadithCardProjectFormData(values, files),
  });
}

export function deleteHadithCardProject(id: string): Promise<DeleteResponse> {
  return request(`/api/hadith-cards/projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function createHadithCard(
  values: HadithCardFormValues,
  files: HadithCardFormFiles,
): Promise<Mutation<HadithCard>> {
  return request("/api/hadith-cards/cards", {
    method: "POST",
    body: createHadithCardFormData(values, files),
  });
}

export function updateHadithCard(
  id: string,
  values: HadithCardFormValues,
  files: HadithCardFormFiles,
): Promise<Mutation<HadithCard>> {
  return request(`/api/hadith-cards/cards/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: createHadithCardFormData(values, files),
  });
}

export function deleteHadithCard(id: string): Promise<DeleteResponse> {
  return request(`/api/hadith-cards/cards/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Keeps request payloads small enough for common PHP upload limits.
 * Progress is batch-based (not an unreliable synthetic byte percentage), so a
 * failed request leaves the caller with an exact completed count.
 */
export async function uploadHadithCardGallery(
  projectId: string,
  sourceFiles: readonly File[],
  options: {
    onProgress?: (progress: HadithCardGalleryUploadProgress) => void;
    onBatchComplete?: (
      result: HadithCardBulkMutation,
      progress: HadithCardGalleryUploadProgress,
    ) => void | Promise<void>;
    signal?: AbortSignal;
  } = {},
): Promise<HadithCardBulkMutation> {
  const files = [...sourceFiles];
  const batches = Math.ceil(files.length / hadithCardGalleryUploadBatchSize);
  const cards: HadithCard[] = [];
  let message = "تم رفع صور الجاليري بنجاح.";
  let completed = 0;

  for (
    let index = 0;
    index < files.length;
    index += hadithCardGalleryUploadBatchSize
  ) {
    const batchFiles = files.slice(
      index,
      index + hadithCardGalleryUploadBatchSize,
    );
    const result = await request<HadithCardBulkMutation>(
      `/api/hadith-cards/projects/${encodeURIComponent(projectId)}/cards/bulk`,
      {
        method: "POST",
        body: createHadithCardGalleryFormData(batchFiles),
        ...(options.signal ? { signal: options.signal } : {}),
      },
    );
    cards.push(...result.data.cards);
    message = result.message || message;
    completed += batchFiles.length;
    const progress = {
      completed,
      total: files.length,
      batch: Math.floor(index / hadithCardGalleryUploadBatchSize) + 1,
      batches,
    };
    options.onProgress?.(progress);
    await options.onBatchComplete?.(result, progress);
  }

  return {
    message,
    data: {
      cards,
      created_count: cards.length || completed,
    },
  };
}

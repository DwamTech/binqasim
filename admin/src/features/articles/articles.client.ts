"use client";

import type {
  Article,
  ArticleCatalogs,
  ArticleFormFiles,
  ArticleFormValues,
  ArticlePage,
  ArticleQuery,
  ArticleStatus,
} from "./articles.contracts";
import { createArticleFormData } from "./articles.media";
import { articleQueryParams } from "./articles.query";

type Success<T> = { success: true; data: T };
type Failure = {
  success: false;
  error?: {
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export class ArticlesClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
    public readonly backendMessage?: string,
  ) {
    super(backendMessage?.trim() || articleErrorMessage(status));
    this.name = "ArticlesClientError";
  }
}

export function articleErrorMessage(status: number): string {
  if (status === 400) return "الطلب غير صالح.";
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (status === 404) return "المقال أو الوسيط غير موجود.";
  if (status === 409) return "تعذر التنفيذ بسبب تعارض في حالة المقال.";
  if (status === 413) return "حجم ملفات الطلب يتجاوز الحد المسموح.";
  if (status === 422) return "راجع البيانات والملفات ثم حاول مرة أخرى.";
  if (status === 429)
    return "تم إرسال طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500) return "خدمة المقالات غير متاحة الآن. حاول مرة أخرى.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: "same-origin",
    });
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "AbortError")
      throw reason;
    throw new ArticlesClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    Success<T> | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failurePayload = payload as Failure | null;
    throw new ArticlesClientError(
      response.status,
      failurePayload?.error?.fieldErrors,
      failurePayload?.error?.message,
    );
  }
  return payload.data;
}

async function appendArticleMedia(
  articleId: string,
  files: ArticleFormFiles,
  traceId?: string,
): Promise<{ message: string; article: Article } | null> {
  let latest: { message: string; article: Article } | null = null;
  const uploads = [
    ...files.galleryImages.map((file) => ({
      field: "gallery_images[]",
      kind: "gallery",
      file,
    })),
    ...(files.audioFiles ?? []).map((file) => ({
      field: "audio_files[]",
      kind: "audio",
      file,
    })),
    ...(files.documents ?? []).map((file) => ({
      field: "documents[]",
      kind: "document",
      file,
    })),
    ...(files.videos ?? []).map((file) => ({
      field: "videos[]",
      kind: "video",
      file,
    })),
  ];

  for (const [index, upload] of uploads.entries()) {
    const body = new FormData();
    body.append(upload.field, upload.file);
    console.info("[ARTICLE TRACE][ADMIN CREATE] media upload started", {
      traceId,
      articleId,
      index: index + 1,
      total: uploads.length,
      kind: upload.kind,
      file: {
        name: upload.file.name,
        size: upload.file.size,
        type: upload.file.type,
      },
    });
    latest = await request(`/api/articles/${encodeURIComponent(articleId)}`, {
      method: "PATCH",
      body,
      ...(traceId ? { headers: { "x-article-trace-id": traceId } } : {}),
    });
    console.info("[ARTICLE TRACE][ADMIN CREATE] media upload completed", {
      traceId,
      articleId,
      index: index + 1,
      kind: upload.kind,
    });
  }
  return latest;
}

export function listArticles(
  query: ArticleQuery,
  signal?: AbortSignal,
): Promise<ArticlePage> {
  const params = articleQueryParams(query);
  return request(`/api/articles${params.size ? `?${params}` : ""}`, {
    ...(signal ? { signal } : {}),
  });
}

export function getArticle(
  id: string,
  signal?: AbortSignal,
): Promise<{ data: Article }> {
  return request(`/api/articles/${encodeURIComponent(id)}`, {
    ...(signal ? { signal } : {}),
  });
}

export function getArticleCatalogs(
  signal?: AbortSignal,
): Promise<ArticleCatalogs> {
  return request("/api/articles/catalogs", {
    ...(signal ? { signal } : {}),
  });
}

export function createArticle(
  values: ArticleFormValues,
  files: ArticleFormFiles,
): Promise<{ message: string; article: Article }> {
  const traceId = globalThis.crypto?.randomUUID?.() ?? `article-${Date.now()}`;
  const startedAt = performance.now();
  const fileSummary = {
    featuredImage: files.featuredImage
      ? {
          name: files.featuredImage.name,
          size: files.featuredImage.size,
          type: files.featuredImage.type,
        }
      : null,
    galleryImages: files.galleryImages.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
    audioFiles: (files.audioFiles ?? []).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
    documents: (files.documents ?? []).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
    videos: (files.videos ?? []).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
  };

  console.groupCollapsed(`[ARTICLE TRACE][ADMIN CREATE] ${traceId}`);
  console.info("1. submit started", {
    traceId,
    article: {
      title: values.title,
      slug: values.slug,
      status: values.status,
      sectionId: values.section_id,
      publishedAt: values.published_at || null,
      contentLength: values.content.length,
    },
    files: fileSummary,
  });

  return request<{ message: string; article: Article }>("/api/articles", {
    method: "POST",
    body: createArticleFormData(values, {
      featuredImage: files.featuredImage,
      galleryImages: [],
      audioFiles: [],
      documents: [],
      videos: [],
    }),
    headers: { "x-article-trace-id": traceId },
  })
    .then(async (created) => {
      console.info("2. primary article created", {
        traceId,
        article: created.article,
      });
      const latest = await appendArticleMedia(
        created.article.id,
        files,
        traceId,
      );
      const result = latest
        ? { message: created.message, article: latest.article }
        : created;
      console.info("3. create flow completed", {
        traceId,
        elapsedMs: Math.round(performance.now() - startedAt),
        article: result.article,
        publicUrl: `/articles/${encodeURIComponent(result.article.slug)}`,
      });
      console.groupEnd();
      return result;
    })
    .catch((error: unknown) => {
      console.error("[ARTICLE TRACE][ADMIN CREATE] failed", {
        traceId,
        elapsedMs: Math.round(performance.now() - startedAt),
        error,
      });
      console.groupEnd();
      throw error;
    });
}

export function updateArticle(
  id: string,
  values: ArticleFormValues,
  files: ArticleFormFiles,
): Promise<{ message: string; article: Article }> {
  return request<{ message: string; article: Article }>(
    `/api/articles/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: createArticleFormData(values, {
        featuredImage: files.featuredImage,
        galleryImages: [],
        audioFiles: [],
        documents: [],
        videos: [],
      }),
    },
  ).then(async (updated) => {
    const latest = await appendArticleMedia(id, files);
    return latest
      ? { message: updated.message, article: latest.article }
      : updated;
  });
}

export function deleteArticle(id: string): Promise<{ message: string }> {
  return request(`/api/articles/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function deleteArticleMedia(
  articleId: string,
  mediaId: string,
): Promise<{ message: string }> {
  return request(
    `/api/articles/${encodeURIComponent(articleId)}/media/${encodeURIComponent(mediaId)}`,
    { method: "DELETE" },
  );
}

export function deleteArticleFeaturedImage(
  articleId: string,
): Promise<{ message: string }> {
  return request(
    `/api/articles/${encodeURIComponent(articleId)}/featured-image`,
    { method: "DELETE" },
  );
}

export function toggleArticleStatus(
  id: string,
): Promise<{ message: string; status: ArticleStatus }> {
  return request(`/api/articles/${encodeURIComponent(id)}/status`, {
    method: "POST",
  });
}

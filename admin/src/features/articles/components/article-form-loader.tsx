"use client";

import { useEffect, useState } from "react";

import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import { ErrorState, PageSkeleton } from "@/shared/components/ui";

import { getArticle, getArticleCatalogs } from "../articles.client";
import type { Article, ArticleCatalogs } from "../articles.contracts";
import { canCreateArticle, canEditArticle } from "../articles.permissions";
import { ArticleForm } from "./article-form";

export function ArticleFormLoader({
  actor,
  articleId,
}: {
  actor: AdminSummary;
  articleId?: string;
}) {
  const [article, setArticle] = useState<Article | null>(null);
  const [catalogs, setCatalogs] = useState<ArticleCatalogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const requests = [
      getArticleCatalogs(controller.signal),
      ...(articleId ? [getArticle(articleId, controller.signal)] : []),
    ] as const;
    void Promise.all(requests)
      .then((results) => {
        if (!active) return;
        setCatalogs(results[0] as ArticleCatalogs);
        if (articleId) setArticle((results[1] as { data: Article }).data);
      })
      .catch((reason: unknown) => {
        if (
          active &&
          !(reason instanceof DOMException && reason.name === "AbortError")
        )
          setError(
            reason instanceof Error
              ? reason.message
              : "تعذر تحميل بيانات المقال.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [articleId, reloadKey]);

  if (
    (!articleId && !canCreateArticle(actor)) ||
    (articleId && article && !canEditArticle(actor, article))
  )
    return (
      <ErrorState
        title="غير مصرح بالتعديل"
        description="هذا المسار متاح للمدير أو للكاتب مالك المقال فقط. جلستك ما زالت فعّالة."
      />
    );
  if (loading) return <PageSkeleton />;
  if (error || !catalogs || (articleId && !article))
    return (
      <ErrorState
        title="تعذر تجهيز النموذج"
        description={error ?? "المقال غير موجود."}
        onRetry={() => {
          setLoading(true);
          setError(null);
          setReloadKey((value) => value + 1);
        }}
      />
    );
  return (
    <ArticleForm
      actor={actor}
      catalogs={catalogs}
      {...(article ? { initial: article } : {})}
    />
  );
}

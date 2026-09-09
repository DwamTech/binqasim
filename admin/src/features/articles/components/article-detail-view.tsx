"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import {
  Button,
  Card,
  Dialog,
  ErrorState,
  HeroSection,
  PageSkeleton,
} from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  deleteArticle,
  deleteArticleMedia,
  getArticle,
  toggleArticleStatus,
} from "../articles.client";
import {
  formatArticleDate,
  formatFileSize,
  type Article,
  type ArticleMedia,
} from "../articles.contracts";
import {
  canDeleteArticle,
  canDeleteArticleMedia,
  canEditArticle,
  canToggleArticleStatus,
} from "../articles.permissions";
import { ArticleStatusBadge } from "./article-status-badge";
import styles from "./articles.module.css";

function MediaCard({
  media,
  deletable,
  pending,
  onDelete,
}: {
  media: ArticleMedia;
  deletable: boolean;
  pending: boolean;
  onDelete: () => void;
}) {
  const isImage = media.type === "gallery_image";
  return (
    <article className={styles.mediaCard}>
      {isImage && (
        // Backend URLs are public media URLs; no internal path is rendered.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={media.original_name ?? "صورة من معرض المقال"}
        />
      )}
      <div>
        <strong>{media.original_name ?? "ملف بدون اسم"}</strong>
        <span>{media.mime_type ?? media.type}</span>
        <small>{formatFileSize(media.size)}</small>
      </div>
      <div className={styles.actions}>
        <a
          className="ui-button ui-button--secondary ui-focus"
          href={media.url}
          target="_blank"
          rel="noreferrer"
        >
          {media.type === "file"
            ? "فتح المستند"
            : media.type === "audio"
              ? "تشغيل الصوت"
              : media.type === "video"
                ? "فتح الفيديو"
                : "عرض"}
        </a>
        {deletable && (
          <Button variant="danger" disabled={pending} onClick={onDelete}>
            حذف الوسيط
          </Button>
        )}
      </div>
    </article>
  );
}

export function ArticleDetailView({
  articleId,
  actor,
}: {
  articleId: string;
  actor: AdminSummary;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<ArticleMedia | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    searchParams.get("notice") === "created"
      ? "تم إنشاء المقال بنجاح."
      : searchParams.get("notice") === "updated"
        ? "تم حفظ تعديلات المقال."
        : null,
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void getArticle(articleId, controller.signal)
      .then((result) => {
        if (active) setArticle(result.data);
      })
      .catch((reason: unknown) => {
        if (
          active &&
          !(reason instanceof DOMException && reason.name === "AbortError")
        )
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل المقال.",
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

  async function removeArticle() {
    if (!article || pending) return;
    setPending(true);
    setActionError(null);
    try {
      await deleteArticle(article.id);
      router.replace("/dashboard/articles?notice=deleted");
      router.refresh();
    } catch (reason) {
      setActionError(
        reason instanceof Error
          ? reason.message
          : `تعذر حذف ${dashboardCopy.modules.articles.singular}.`,
      );
    } finally {
      setPending(false);
    }
  }

  async function changeStatus() {
    if (!article || pending) return;
    setPending(true);
    setActionError(null);
    try {
      await toggleArticleStatus(article.id);
      const refreshed = await getArticle(article.id);
      setArticle(refreshed.data);
      setStatusOpen(false);
      setNotice("تم تحديث حالة المقال حسب استجابة الخادم.");
    } catch (reason) {
      setActionError(
        reason instanceof Error ? reason.message : "تعذر تحديث الحالة.",
      );
    } finally {
      setPending(false);
    }
  }

  async function removeMedia() {
    if (!article || !mediaTarget || pending) return;
    setPending(true);
    setActionError(null);
    try {
      await deleteArticleMedia(article.id, mediaTarget.id);
      setArticle({
        ...article,
        media: article.media.filter((media) => media.id !== mediaTarget.id),
      });
      setMediaTarget(null);
      setNotice("تم حذف الوسيط بنجاح.");
    } catch (reason) {
      setActionError(
        reason instanceof Error ? reason.message : "تعذر حذف الوسيط.",
      );
    } finally {
      setPending(false);
    }
  }

  if (loading)
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  if (error || !article)
    return (
      <PageContainer>
        <ErrorState
          title="تعذر عرض المقال"
          description={error ?? "المقال غير موجود."}
          onRetry={() => {
            setLoading(true);
            setError(null);
            setReloadKey((value) => value + 1);
          }}
        />
      </PageContainer>
    );

  const editable = canEditArticle(actor, article);
  const deletable = canDeleteArticle(actor, article);
  const mediaDeletable = canDeleteArticleMedia(actor, article);
  const statusAllowed = canToggleArticleStatus(actor);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.articles.navigation}
          title={article.title}
          description="عرض المحتوى والبيانات والوسائط المرتبطة بالمقال."
          actions={
            <div className={styles.headerActions}>
              <Link
                className="ui-button ui-button--secondary ui-focus"
                href="/dashboard/articles"
              >
                العودة للقائمة
              </Link>
              {editable && (
                <Link
                  className="ui-button ui-button--primary ui-focus"
                  href={`/dashboard/articles/${article.id}/edit`}
                >
                  تعديل
                </Link>
              )}
              {statusAllowed && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setActionError(null);
                    setStatusOpen(true);
                  }}
                >
                  تغيير الحالة
                </Button>
              )}
              {deletable && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setActionError(null);
                    setDeleteOpen(true);
                  }}
                >
                  حذف
                </Button>
              )}
            </div>
          }
        />
      }
    >
      {notice && (
        <div className={styles.notice} role="status">
          {notice}
        </div>
      )}
      <div className={styles.detailLayout}>
        <Card className={styles.contentCard ?? ""}>
          <div className={styles.titleLine}>
            <ArticleStatusBadge status={article.status} />
            <code dir="ltr">{article.slug}</code>
          </div>
          {article.featured_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.featuredImage}
              src={article.featured_image}
              alt={`الصورة الرئيسية لمقال ${article.title}`}
            />
          )}
          {article.excerpt && (
            <p className={styles.excerpt}>{article.excerpt}</p>
          )}
          <div
            className={styles.articleContent}
            // Laravel applies an allow-list sanitizer to legacy and new content.
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Card>
        <Card className={styles.metadataCard ?? ""}>
          <h2>بيانات المقال</h2>
          <dl>
            <div>
              <dt>القسم</dt>
              <dd>{article.section?.name ?? "بدون قسم"}</dd>
            </div>
            <div>
              <dt>الكاتب</dt>
              <dd>
                {article.author?.name ?? article.author_name ?? "غير محدد"}
              </dd>
            </div>
            <div>
              <dt>المشاهدات</dt>
              <dd>{formatArabicNumber(article.views_count)}</dd>
            </div>
            <div>
              <dt>تاريخ النشر</dt>
              <dd>{formatArticleDate(article.published_at)}</dd>
            </div>
            <div>
              <dt>التاريخ الميلادي</dt>
              <dd>{article.gregorian_date ?? "غير محدد"}</dd>
            </div>
            <div>
              <dt>التاريخ الهجري</dt>
              <dd>{article.hijri_date ?? "غير محدد"}</dd>
            </div>
            <div>
              <dt>المدة</dt>
              <dd>{article.duration ?? "غير محدد"}</dd>
            </div>
            <div>
              <dt>الموقع</dt>
              <dd>{article.location ?? "غير محدد"}</dd>
            </div>
            <div>
              <dt>الكلمات المفتاحية</dt>
              <dd>{article.keywords ?? "غير محدد"}</dd>
            </div>
          </dl>
          {article.references && (
            <div className={styles.references}>
              <h3>المراجع</h3>
              <p>{article.references}</p>
            </div>
          )}
        </Card>
      </div>
      <section className={styles.mediaSection}>
        <div>
          <h2>الوسائط الموجودة</h2>
          <p>الحذف لا يتم إلا بعد تأكيد واستجابة ناجحة من الخادم.</p>
        </div>
        {article.media.length === 0 ? (
          <p className={styles.emptyMedia}>لا توجد وسائط إضافية لهذا المقال.</p>
        ) : (
          <div className={styles.mediaGrid}>
            {article.media.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                deletable={mediaDeletable}
                pending={pending}
                onDelete={() => {
                  setActionError(null);
                  setMediaTarget(media);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !pending && setDeleteOpen(open)}
        title={`حذف ${dashboardCopy.modules.articles.singular}`}
        dismissible={!pending}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => setDeleteOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              loading={pending}
              disabled={pending}
              onClick={() => void removeArticle()}
            >
              حذف {dashboardCopy.modules.articles.singular}
            </Button>
          </div>
        }
      >
        <p>
          سيتم حذف «{article.title}» حذفًا مرنًا. وسائطه لن تُحذف تلقائيًا وفق
          العقد الحالي.
        </p>
        {actionError && (
          <p role="alert" className={styles.errorText}>
            {actionError}
          </p>
        )}
      </Dialog>
      <Dialog
        open={statusOpen}
        onOpenChange={(open) => !pending && setStatusOpen(open)}
        title="تغيير حالة المقال"
        dismissible={!pending}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => setStatusOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              loading={pending}
              disabled={pending}
              onClick={() => void changeStatus()}
            >
              تأكيد التغيير
            </Button>
          </div>
        }
      >
        <p>
          الحالة الحالية:{" "}
          <strong>
            <ArticleStatusBadge status={article.status} />
          </strong>
          . قد يؤثر التغيير على ظهور المقال للعامة.
        </p>
        {actionError && (
          <p role="alert" className={styles.errorText}>
            {actionError}
          </p>
        )}
      </Dialog>
      <Dialog
        open={mediaTarget !== null}
        onOpenChange={(open) => !pending && !open && setMediaTarget(null)}
        title="حذف الوسيط"
        dismissible={!pending}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => setMediaTarget(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              loading={pending}
              disabled={pending}
              onClick={() => void removeMedia()}
            >
              حذف الوسيط
            </Button>
          </div>
        }
      >
        <p>
          سيُحذف الملف «{mediaTarget?.original_name ?? "بدون اسم"}» من التخزين
          والمقال بعد نجاح الخادم.
        </p>
        {actionError && (
          <p role="alert" className={styles.errorText}>
            {actionError}
          </p>
        )}
      </Dialog>
    </PageContainer>
  );
}

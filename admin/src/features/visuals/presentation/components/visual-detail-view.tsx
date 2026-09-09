"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type {
  VisualDetail,
  VisualMutationResult,
} from "../../domain/visuals.contracts";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  InlineError,
} from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  ARABIC_DISPLAY_LOCALE,
  formatArabicNumber,
} from "@/shared/lib/arabic-format";

import styles from "./visuals.module.css";
import { getVisualDetailPreview } from "./visual-detail.helpers";
import { VisualThumbnail } from "./visual-thumbnail";

type DeleteAction = (id: string) => Promise<VisualMutationResult>;

export function VisualDetailView({
  visual,
  deleteAction,
}: {
  visual: VisualDetail;
  deleteAction: DeleteAction;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const [failedVideoSource, setFailedVideoSource] = useState<string>();
  const preview = getVisualDetailPreview(visual, failedVideoSource);
  const keywords =
    visual.keywords
      ?.split(/[,،]/)
      .map((keyword) => keyword.trim())
      .filter(Boolean) ?? [];
  const deleteVisual = () => {
    if (isPending) return;
    startTransition(async () => {
      const result = await deleteAction(String(visual.id));
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.replace("/dashboard/visuals");
      router.refresh();
    });
  };
  return (
    <div className={styles.stack}>
      {error && <InlineError>{error}</InlineError>}
      <Card className={styles.detailCard ?? ""}>
        <header className={styles.detailHeader}>
          <div className={styles.detailHeading}>
            <Badge variant={visual.type === "upload" ? "success" : "warning"}>
              {visual.type === "upload" ? "فيديو مرفوع" : "رابط خارجي"}
            </Badge>
            <h2>{visual.title}</h2>
            <p>
              {visual.description || "لا يوجد وصف مضاف لهذه المرئية حتى الآن."}
            </p>
          </div>
          <div className={styles.detailActions}>
            <Link
              href={`/dashboard/visuals/${visual.id}/edit`}
              className="ui-button ui-button--primary ui-focus"
            >
              تعديل
            </Link>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              حذف
            </Button>
            <Link
              href="/dashboard/visuals"
              className="ui-button ui-button--secondary ui-focus"
            >
              رجوع للقائمة
            </Link>
          </div>
        </header>

        <div className={styles.detailLayout}>
          <section className={styles.previewPanel}>
            <div className={styles.detailSectionTitle}>
              <span aria-hidden="true">▶</span>
              <div>
                <h3>معاينة المرئية</h3>
                <p>عرض المحتوى كما سيظهر للمستخدم.</p>
              </div>
            </div>
            <div className={styles.detailMediaFrame}>
              {visual.type === "upload" &&
                (preview.kind !== "video" ? (
                  <div className={styles.unavailableMedia}>
                    <VisualThumbnail
                      src={visual.thumbnail}
                      alt={`صورة مصغرة للمرئية ${visual.title}`}
                      variant="detail"
                      fallbackLabel="لا توجد معاينة متاحة"
                    />
                    <p className={styles.mediaError} role="status">
                      تعذر تحميل ملف الفيديو.
                    </p>
                  </div>
                ) : (
                  <video
                    className={styles.video}
                    controls
                    playsInline
                    preload="metadata"
                    src={preview.src}
                    poster={preview.poster}
                    title={`معاينة ${visual.title}`}
                    onError={() => setFailedVideoSource(preview.src)}
                  >
                    المتصفح لا يدعم عرض الفيديو.
                  </video>
                ))}
              {visual.type === "link" &&
                (preview.kind === "link" ? (
                  <VisualThumbnail
                    src={visual.thumbnail}
                    alt={`صورة مصغرة للمرئية ${visual.title}`}
                    variant="detail"
                    fallbackLabel="لا توجد صورة مصغرة للرابط"
                  />
                ) : (
                  <div className={styles.unavailableMedia}>
                    <VisualThumbnail
                      src={visual.thumbnail}
                      alt={`صورة مصغرة للمرئية ${visual.title}`}
                      variant="detail"
                      fallbackLabel="لا توجد معاينة متاحة"
                    />
                    <p className={styles.mediaError} role="status">
                      رابط المرئية غير متاح حاليًا.
                    </p>
                  </div>
                ))}
            </div>
            {preview.kind === "link" && (
              <a
                className={`ui-button ui-button--secondary ui-focus ${styles.externalLink}`}
                href={preview.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">↗</span>
                فتح الرابط في نافذة جديدة
              </a>
            )}
          </section>

          <aside className={styles.detailSidebar}>
            <section className={styles.infoPanel}>
              <div className={styles.detailSectionTitle}>
                <span aria-hidden="true">i</span>
                <div>
                  <h3>بيانات المرئية</h3>
                  <p>المعلومات الأساسية المرتبطة بالمحتوى.</p>
                </div>
              </div>
              <dl className={styles.metadata}>
                <div>
                  <dt>النوع</dt>
                  <dd>
                    {visual.type === "upload" ? "فيديو مرفوع" : "رابط خارجي"}
                  </dd>
                </div>
                <div>
                  <dt>القسم</dt>
                  <dd>{visual.section?.name ?? "غير محدد"}</dd>
                </div>
                {visual.created_at && (
                  <div>
                    <dt>تاريخ الإنشاء</dt>
                    <dd>
                      {new Intl.DateTimeFormat(ARABIC_DISPLAY_LOCALE, {
                        dateStyle: "medium",
                      }).format(new Date(visual.created_at))}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <div className={styles.statsGrid}>
              <div>
                <span aria-hidden="true">★</span>
                <small>التقييم</small>
                <strong>{visual.rating ?? "—"}</strong>
              </div>
              <div>
                <span aria-hidden="true">◉</span>
                <small>المشاهدات</small>
                <strong>
                  {visual.views_count === null ||
                  visual.views_count === undefined
                    ? "—"
                    : formatArabicNumber(visual.views_count)}
                </strong>
              </div>
            </div>

            <section className={styles.keywordsPanel}>
              <h3>الكلمات المفتاحية</h3>
              {keywords.length > 0 ? (
                <div className={styles.keywordList}>
                  {keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              ) : (
                <p>لا توجد كلمات مفتاحية مضافة.</p>
              )}
            </section>
          </aside>
        </div>
      </Card>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`حذف ${dashboardCopy.modules.visuals.singular}`}
        destructive
        confirmLabel={
          isPending
            ? "جارٍ الحذف…"
            : `حذف ${dashboardCopy.modules.visuals.singular}`
        }
        onConfirm={deleteVisual}
      >
        <p>سيتم حذف «{visual.title}». لا يمكن التراجع عن هذا الإجراء.</p>
      </ConfirmDialog>
    </div>
  );
}

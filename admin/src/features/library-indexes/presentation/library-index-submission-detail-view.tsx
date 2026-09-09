"use client";

import Link from "next/link";
import { useState } from "react";

import { Alert, Card } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import {
  formatLibraryIndexDate,
  libraryIndexSubmissionTypeLabels,
  type LibraryIndexSubmission,
} from "../domain/library-indexes.contracts";
import { LibraryIndexReviewActions } from "./library-index-review-actions";
import { LibraryIndexStatusBadge } from "./library-index-status-badge";
import styles from "./library-indexes.module.css";

export function LibraryIndexSubmissionDetailView({
  initialItem,
  notice,
}: {
  initialItem: LibraryIndexSubmission;
  notice?: "approved" | "rejected";
}) {
  const [item, setItem] = useState(initialItem);
  const [localNotice, setLocalNotice] = useState(notice);

  function reviewed(updated: LibraryIndexSubmission) {
    setItem(updated);
    setLocalNotice(updated.status === "approved" ? "approved" : "rejected");
  }

  return (
    <main className={styles.detailPage} dir="rtl">
      {localNotice && (
        <div className={styles.successNotice} role="status">
          {localNotice === "approved"
            ? "تم اعتماد الطلب وأصبح السجل متاحًا للظهور في الجدول العام."
            : "تم رفض الطلب وحفظ سبب الرفض للمراجعة الداخلية."}
        </div>
      )}

      <section className={styles.detailHero}>
        {item.image_url ? (
          // The backend origin is deployment-specific; a native image avoids
          // coupling the shared dashboard build to Next remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.detailImage}
            src={item.image_url}
            alt={`صورة ${item.name}`}
            width={116}
            height={116}
          />
        ) : (
          <div className={styles.detailMark} aria-hidden="true">
            {item.type === "golden_visit" ? "✦" : "◌"}
          </div>
        )}
        <div className={styles.detailHeading}>
          <span>{libraryIndexSubmissionTypeLabels[item.type]}</span>
          <h1>{item.name}</h1>
          <p>{item.title || "طلب تسجيل زيارة في السجل الذهبي"}</p>
          <small>رقم الطلب #{formatArabicNumber(item.id)}</small>
        </div>
        <LibraryIndexStatusBadge status={item.status} />
      </section>

      {item.status === "rejected" && item.rejection_reason && (
        <Alert variant="error" title="سبب الرفض المسجل">
          {item.rejection_reason}
        </Alert>
      )}

      <div className={styles.detailGrid}>
        <section className={styles.detailMain}>
          <Card className={styles.detailCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>٠١</span>
              <div>
                <h2>بيانات السجل</h2>
                <p>البيانات كما أرسلها الزائر من نموذج الموقع.</p>
              </div>
            </div>
            <dl className={styles.metadataList}>
              <div>
                <dt>الاسم</dt>
                <dd>{item.name}</dd>
              </div>
              <div>
                <dt>نوع السجل</dt>
                <dd>{libraryIndexSubmissionTypeLabels[item.type]}</dd>
              </div>
              {item.type === "guest" && (
                <div>
                  <dt>الصفة أو اللقب</dt>
                  <dd>{item.title || "—"}</dd>
                </div>
              )}
              <div>
                <dt>تاريخ الزيارة</dt>
                <dd>{formatLibraryIndexDate(item.visit_date)}</dd>
              </div>
            </dl>
          </Card>

          <Card className={styles.detailCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>٠٢</span>
              <div>
                <h2>سجل المراجعة</h2>
                <p>حالة الطلب ووقت المراجعة والمسؤول عنها.</p>
              </div>
            </div>
            <dl className={styles.metadataList}>
              <div>
                <dt>تاريخ الاستلام</dt>
                <dd>{formatLibraryIndexDate(item.created_at, true)}</dd>
              </div>
              <div>
                <dt>تاريخ المراجعة</dt>
                <dd>{formatLibraryIndexDate(item.reviewed_at, true)}</dd>
              </div>
              <div>
                <dt>المراجع</dt>
                <dd>{item.reviewer?.name ?? "لم تتم المراجعة بعد"}</dd>
              </div>
              <div>
                <dt>الحالة الحالية</dt>
                <dd>
                  <LibraryIndexStatusBadge status={item.status} />
                </dd>
              </div>
            </dl>
          </Card>
        </section>

        <aside className={styles.reviewPanel}>
          <Card className={styles.reviewCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>٠٣</span>
              <div>
                <h2>قرار المراجعة</h2>
                <p>القبول ينشر السجل، والرفض يحتفظ به داخليًا.</p>
              </div>
            </div>
            {item.status === "pending" ? (
              <>
                <p className={styles.reviewHint}>
                  راجع الاسم والصورة أو الصفة والتاريخ قبل اتخاذ القرار.
                </p>
                <LibraryIndexReviewActions item={item} onReviewed={reviewed} />
              </>
            ) : (
              <Alert title="تمت مراجعة الطلب">
                لا توجد إجراءات معلّقة على هذا السجل حاليًا.
              </Alert>
            )}
          </Card>
        </aside>
      </div>

      <Link
        href={`/dashboard/library-indexes?type=${item.type}`}
        className={styles.backLink}
      >
        العودة إلى {libraryIndexSubmissionTypeLabels[item.type]}
      </Link>
    </main>
  );
}

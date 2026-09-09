"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Button,
  Dialog,
  ErrorState,
  HeroSection,
  Skeleton,
} from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  deleteTourGuide,
  getTourGuide,
} from "../application/tour-guides.client";
import {
  formatTourDate,
  type TourGuide,
} from "../domain/tour-guides.contracts";
import styles from "./tour-guides.module.css";

export function TourGuideDetailView({ guideId }: { guideId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [guide, setGuide] = useState<TourGuide>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const result = await getTourGuide(guideId, controller.signal);
        if (!active) return;
        setGuide(result);
        setError("");
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل المرشد.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [guideId, reloadKey]);

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteTourGuide(guideId);
      router.replace("/dashboard/tour-guides/guides");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تعذرت أرشفة المرشد.",
      );
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading)
    return (
      <PageContainer>
        <div className={styles.detailSkeletons}>
          <Skeleton style={{ minBlockSize: "13rem" }} />
          <Skeleton style={{ minBlockSize: "24rem" }} />
        </div>
      </PageContainer>
    );
  if (error || !guide)
    return (
      <PageContainer>
        <ErrorState
          title="تعذر تحميل بيانات المرشد"
          description={error || "بيانات المرشد غير متاحة."}
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      </PageContainer>
    );

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة المرشدين السياحيين"
          title={guide.name}
          description={guide.title}
          leading={
            guide.photo_url ? (
              <img
                className={styles.heroGuidePhoto}
                src={guide.photo_url}
                alt={`صورة ${guide.name}`}
              />
            ) : (
              <span className={styles.heroGuideInitial} aria-hidden="true">
                {guide.name.charAt(0)}
              </span>
            )
          }
          actions={
            <div className={styles.heroActions}>
              <Link
                className="ui-button ui-button--primary ui-focus"
                href={`/dashboard/tour-guides/guides/${guide.id}/edit`}
              >
                تعديل بيانات المرشد
              </Link>
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                أرشفة
              </Button>
            </div>
          }
        />
      }
    >
      <main className={styles.page}>
        {searchParams.get("saved") === "1" && (
          <p className={styles.successNotice} role="status">
            تم حفظ بيانات المرشد بنجاح.
          </p>
        )}
        <section className={styles.profileGrid}>
          <article className={`${styles.detailCard} ${styles.profileCard}`}>
            <header>
              <small>الملف المهني</small>
              <span
                className={`${styles.visibilityBadge} ${guide.is_active ? styles.active : styles.inactive}`}
              >
                {guide.is_active ? "نشط ويظهر للزوار" : "غير نشط"}
              </span>
            </header>
            <p className={styles.guideBio}>
              {guide.bio || "لم تُضف نبذة عن المرشد بعد."}
            </p>
            <dl className={styles.metadataGrid}>
              <Meta
                label="سنوات الخبرة"
                value={`${formatArabicNumber(guide.experience_years)} سنوات`}
              />
              <Meta
                label="ترتيب الظهور"
                value={formatArabicNumber(guide.display_order)}
              />
              <Meta
                label="رقم الترخيص"
                value={guide.license_number || "—"}
                ltr
              />
              <Meta label="الرابط المختصر" value={guide.slug} ltr />
              <Meta label="رقم الجوال" value={guide.phone || "—"} ltr />
              <Meta label="البريد الإلكتروني" value={guide.email || "—"} ltr />
              <Meta
                label="تاريخ الإضافة"
                value={formatTourDate(guide.created_at)}
              />
              <Meta
                label="آخر تحديث"
                value={formatTourDate(guide.updated_at)}
              />
            </dl>
          </article>
          <aside className={styles.detailAside}>
            <ChipCard
              title="اللغات"
              values={guide.languages}
              empty="لم تُضف لغات."
            />
            <ChipCard
              title="المسارات السياحية"
              values={guide.tour_routes}
              empty="لم تُضف مسارات."
            />
          </aside>
        </section>
        <Dialog
          open={deleteOpen}
          onOpenChange={(open) => !deleting && setDeleteOpen(open)}
          title="أرشفة المرشد السياحي"
          dismissible={!deleting}
          footer={
            <div className={styles.dialogActions}>
              <Button
                variant="secondary"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
              >
                تراجع
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={() => void confirmDelete()}
              >
                تأكيد الأرشفة
              </Button>
            </div>
          }
        >
          <p>
            سيُؤرشف <strong>{guide.name}</strong> ويختفي من دليل الزوار، مع بقاء
            الطلبات السابقة محفوظة للرجوع إليها.
          </p>
        </Dialog>
      </main>
    </PageContainer>
  );
}

function Meta({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd dir={ltr ? "ltr" : undefined}>{value}</dd>
    </div>
  );
}

function ChipCard({
  title,
  values,
  empty,
}: {
  title: string;
  values: string[];
  empty: string;
}) {
  return (
    <article className={styles.detailCard}>
      <h2>{title}</h2>
      {values.length ? (
        <div className={styles.chips}>
          {values.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
      ) : (
        <p className={styles.muted}>{empty}</p>
      )}
    </article>
  );
}

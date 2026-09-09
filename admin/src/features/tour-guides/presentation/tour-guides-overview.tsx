"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection, Skeleton } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  getTourGuidesSummary,
  getTourRequestsSummary,
} from "../application/tour-guides.client";
import type { TourModuleSummary } from "../domain/tour-guides.contracts";
import styles from "./tour-guides.module.css";

const emptySummary: TourModuleSummary = {
  guides_total: 0,
  guides_active: 0,
  guides_inactive: 0,
  requests_total: 0,
  new: 0,
  in_progress: 0,
  completed: 0,
};

export function TourGuidesOverview() {
  const [summary, setSummary] = useState<TourModuleSummary>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [guides, requests] = await Promise.all([
          getTourGuidesSummary(controller.signal),
          getTourRequestsSummary(controller.signal),
        ]);
        if (!active) return;
        setSummary({ ...emptySummary, ...guides, ...requests });
        setError("");
      } catch (reason) {
        if (!active) return;
        setError(
          reason instanceof Error ? reason.message : "تعذر تحميل الملخص.",
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
  }, [reloadKey]);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="بوابة الزائر"
          title="إدارة الرحلات السياحية"
          description="مساحة تشغيل موحدة لإدارة المرشدين السياحيين ومتابعة طلبات الرحلات من لحظة الاستلام حتى الإنهاء."
          leading={
            <span className={styles.heroMark} aria-hidden="true">
              ⌖
            </span>
          }
          actions={
            <Link
              className="ui-button ui-button--primary ui-focus"
              href="/dashboard/tour-guides/guides/new"
            >
              إضافة مرشد سياحي
            </Link>
          }
        />
      }
    >
      <main className={styles.page}>
        {loading ? (
          <div className={styles.metricGrid} aria-label="تحميل ملخص الموديول">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} style={{ minBlockSize: "9rem" }} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="تعذر تحميل ملخص الرحلات"
            description={error}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : (
          <section className={styles.metricGrid} aria-label="ملخص التشغيل">
            <Metric
              label="المرشدون النشطون"
              value={summary?.guides_active ?? 0}
              note={`من إجمالي ${formatArabicNumber(summary?.guides_total ?? 0)} مرشد`}
              tone="primary"
            />
            <Metric
              label="طلبات جديدة"
              value={summary?.new ?? 0}
              note="لم يبدأ التعامل معها بعد"
              tone="warning"
            />
            <Metric
              label="قيد التنفيذ"
              value={summary?.in_progress ?? 0}
              note="رحلات يتابعها فريق الإدارة"
              tone="info"
            />
            <Metric
              label="طلبات منتهية"
              value={summary?.completed ?? 0}
              note={`من ${formatArabicNumber(summary?.requests_total ?? 0)} طلب مسجل`}
              tone="success"
            />
          </section>
        )}

        <section className={styles.workspaceGrid} aria-label="مساحات الموديول">
          <Link
            className={styles.workspaceCard}
            href="/dashboard/tour-guides/guides"
          >
            <span className={styles.workspaceIcon} aria-hidden="true">
              ♙
            </span>
            <div>
              <small>دليل المرشدين</small>
              <h2>إدارة المرشدين السياحيين</h2>
              <p>
                أضف بيانات المرشد وصورته ٤×٦ ومساراته ولغاته، وتحكم في ظهوره
                للزوار.
              </p>
            </div>
            <span className={styles.workspaceArrow} aria-hidden="true">
              ←
            </span>
          </Link>
          <Link
            className={`${styles.workspaceCard} ${styles.requestsWorkspace}`}
            href="/dashboard/tour-guides/requests"
          >
            <span className={styles.workspaceIcon} aria-hidden="true">
              ✦
            </span>
            <div>
              <small>صندوق الطلبات</small>
              <h2>إدارة طلبات الرحلات</h2>
              <p>
                راجع بيانات الزائر والمرشد المختار، وحدّث الحالة مع سجل واضح لكل
                إجراء.
              </p>
            </div>
            {(summary?.new ?? 0) > 0 && (
              <strong className={styles.newRequestsPill}>
                {formatArabicNumber(summary?.new ?? 0)} جديد
              </strong>
            )}
            <span className={styles.workspaceArrow} aria-hidden="true">
              ←
            </span>
          </Link>
        </section>
      </main>
    </PageContainer>
  );
}

function Metric({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: number;
  note: string;
  tone: "primary" | "warning" | "info" | "success";
}) {
  return (
    <article className={`${styles.metricCard} ${styles[`metric_${tone}`]}`}>
      <span>{label}</span>
      <strong>{formatArabicNumber(value)}</strong>
      <small>{note}</small>
    </article>
  );
}

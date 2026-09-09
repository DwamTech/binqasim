"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Badge,
  ErrorState,
  HeroSection,
  PageSkeleton,
} from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";

import {
  formatSectionDate,
  getSectionModuleLabel,
  type Section,
} from "../sections.contracts";
import {
  deleteSection,
  getSection,
  SectionsClientError,
} from "../sections.client";
import { DeleteSectionDialog } from "./delete-section-dialog";
import styles from "./sections.module.css";

export function SectionDetailView({ sectionId }: { sectionId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getSection(sectionId, controller.signal);
        if (active) setSection(result);
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل القسم.",
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
  }, [reloadKey, sectionId]);

  async function confirmDelete() {
    if (!section || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSection(section.id);
      router.replace("/dashboard/sections?notice=deleted");
      router.refresh();
    } catch (reason) {
      setDeleteError(
        reason instanceof SectionsClientError
          ? reason.message
          : `تعذر حذف ${dashboardCopy.modules.sections.singular}.`,
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading)
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  if (error || !section)
    return (
      <PageContainer>
        <ErrorState
          title="تعذر عرض القسم"
          description={error ?? "القسم غير موجود."}
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      </PageContainer>
    );

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.sections.navigation}
          title={section.name}
          description={`قسم تابع لموديول ${getSectionModuleLabel(section.module)}`}
          actions={
            <div className={styles.headerActions}>
              <Link
                className="ui-button ui-button--secondary"
                href="/dashboard/sections"
              >
                العودة للقائمة
              </Link>
              <Link
                className="ui-button ui-button--primary"
                href={`/dashboard/sections/${section.id}/edit`}
              >
                تعديل
              </Link>
              <button
                className="ui-button ui-button--danger"
                onClick={() => setDialogOpen(true)}
              >
                حذف
              </button>
            </div>
          }
        />
      }
    >
      {searchParams.get("notice") === "created" && (
        <div className={styles.successNotice} role="status">
          تم إنشاء القسم بنجاح.
        </div>
      )}
      {searchParams.get("notice") === "updated" && (
        <div className={styles.successNotice} role="status">
          تم حفظ تعديلات القسم بنجاح.
        </div>
      )}
      <section className={styles.detailCard}>
        <header className={styles.detailCardHeader}>
          <div>
            <span className={styles.detailHeaderIcon} aria-hidden="true">
              §
            </span>
            <div>
              <h2>بيانات القسم</h2>
              <p>معلومات القسم وحالته داخل نظام إدارة المحتوى.</p>
            </div>
          </div>
          <Badge variant={section.is_active ? "success" : "warning"}>
            {section.is_active ? "قسم نشط" : "قسم غير نشط"}
          </Badge>
        </header>

        <div className={styles.detailOverview}>
          <article className={styles.identityCard}>
            <span className={styles.sectionMonogram} aria-hidden="true">
              {section.name.trim().charAt(0) || "ق"}
            </span>
            <div>
              <small>اسم القسم</small>
              <h3>{section.name}</h3>
              <code dir="ltr">{section.slug}</code>
            </div>
          </article>

          <article className={styles.detailInfoCard}>
            <span className={styles.detailInfoIcon} aria-hidden="true">
              ◫
            </span>
            <div>
              <small>الموديول</small>
              <strong>{getSectionModuleLabel(section.module)}</strong>
              <p>مكان استخدام القسم داخل المحتوى.</p>
            </div>
          </article>

          <article className={styles.detailInfoCard}>
            <span className={styles.detailInfoIcon} aria-hidden="true">
              {section.is_active ? "✓" : "—"}
            </span>
            <div>
              <small>حالة الظهور</small>
              <strong>{section.is_active ? "نشط ومتاح" : "غير نشط"}</strong>
              <p>
                {section.is_active
                  ? "القسم متاح للاستخدام والظهور."
                  : "القسم مخفي حاليًا عن الاستخدام."}
              </p>
            </div>
          </article>
        </div>

        <div className={styles.descriptionPanel}>
          <div className={styles.detailPanelTitle}>
            <span aria-hidden="true">≡</span>
            <div>
              <h3>وصف القسم</h3>
              <p>نبذة توضح طبيعة المحتوى الموجود داخل القسم.</p>
            </div>
          </div>
          <p>{section.description || "لا يوجد وصف مضاف لهذا القسم."}</p>
        </div>

        <div className={styles.datesPanel}>
          <div>
            <span aria-hidden="true">＋</span>
            <div>
              <small>تاريخ الإنشاء</small>
              <strong>{formatSectionDate(section.created_at)}</strong>
            </div>
          </div>
          <div>
            <span aria-hidden="true">↻</span>
            <div>
              <small>آخر تحديث</small>
              <strong>{formatSectionDate(section.updated_at)}</strong>
            </div>
          </div>
        </div>
      </section>
      <DeleteSectionDialog
        section={section}
        open={dialogOpen}
        busy={deleting}
        error={deleteError}
        onOpenChange={setDialogOpen}
        onConfirm={() => void confirmDelete()}
      />
    </PageContainer>
  );
}

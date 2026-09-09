"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  VisualListQuery,
  VisualPaginator,
  VisualSection,
} from "../../domain/visuals.contracts";
import {
  Badge,
  Card,
  EmptyState,
  FilterPanel,
  InlineError,
  Select,
} from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  ARABIC_DISPLAY_LOCALE,
  formatArabicNumber,
} from "@/shared/lib/arabic-format";

import styles from "./visuals.module.css";
import { VisualThumbnail } from "./visual-thumbnail";

function queryHref(query: VisualListQuery, page: number) {
  const params = new URLSearchParams();
  if (query.type !== undefined) params.set("type", query.type);
  if (query.section_id !== undefined)
    params.set("section_id", String(query.section_id));
  if (query.author !== undefined) params.set("author", String(query.author));
  params.set("page", String(page));
  return `/dashboard/visuals?${params.toString()}`;
}

export function VisualsListView({
  paginator,
  sections,
  query,
  sectionsError,
}: {
  paginator: VisualPaginator;
  sections: VisualSection[];
  query: VisualListQuery;
  sectionsError?: boolean;
}) {
  const totalPages = Math.max(
    1,
    Math.ceil(paginator.total / paginator.per_page),
  );
  const [type, setType] = useState(query.type ?? "");
  const [sectionId, setSectionId] = useState(
    query.section_id === undefined ? "" : String(query.section_id),
  );
  return (
    <div className={styles.stack}>
      <FilterPanel
        title="تصفية المرئيات"
        description="اختر النوع أو القسم للوصول إلى المحتوى المطلوب بسرعة."
      >
        <form
          action="/dashboard/visuals"
          className={styles.filters}
          aria-label="فلاتر المرئيات"
        >
          <label>
            <span>النوع</span>
            <Select
              name="type"
              value={type}
              autoSubmit
              aria-label="نوع المرئية"
              options={[
                { value: "", label: "كل الأنواع" },
                { value: "upload", label: "فيديو مرفوع" },
                { value: "link", label: "رابط خارجي" },
              ]}
              onValueChange={setType}
            />
          </label>
          <label>
            <span>القسم</span>
            <Select
              name="section_id"
              value={sectionId}
              autoSubmit
              aria-label="قسم المرئية"
              options={[
                { value: "", label: "كل الأقسام" },
                ...sections.map((section) => ({
                  value: String(section.id),
                  label: section.name,
                })),
              ]}
              onValueChange={setSectionId}
            />
          </label>
        </form>
        {sectionsError && (
          <div className={styles.filterError}>
            <InlineError>
              تعذّر تحميل الأقسام، ما زال فلتر النوع متاحًا.
            </InlineError>
          </div>
        )}
      </FilterPanel>
      {paginator.data.length === 0 ? (
        <Card>
          <EmptyState
            title="لا توجد مرئيات بعد"
            description="أضف مرئية جديدة لتظهر في هذه القائمة."
            action={
              <Link
                className="ui-button ui-button--primary ui-focus"
                href="/dashboard/visuals/new"
              >
                {dashboardCopy.modules.visuals.pages.create}
              </Link>
            }
          />
        </Card>
      ) : (
        <Card className={styles.tableCard ?? ""}>
          <div className={styles.tableHeader}>
            <div>
              <span className={styles.tableHeaderIcon} aria-hidden="true">
                ▶
              </span>
              <div>
                <strong>قائمة المرئيات</strong>
                <small>عرض وإدارة المحتوى المرئي المنشور</small>
              </div>
            </div>
            <span className={styles.resultCount}>
              {formatArabicNumber(paginator.total)} مرئية
            </span>
          </div>
          <div
            className={`${styles.tableWrap} ui-responsive-table-wrap`}
            tabIndex={0}
            role="region"
            aria-label="جدول المرئيات"
          >
            <table className={`${styles.table} ui-responsive-table`}>
              <thead>
                <tr>
                  <th>المرئية</th>
                  <th>النوع</th>
                  <th>القسم</th>
                  <th>التقييم</th>
                  <th>المشاهدات</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginator.data.map((visual) => (
                  <tr key={String(visual.id)}>
                    <td data-label="المرئية">
                      <div className={styles.visualTitle}>
                        <VisualThumbnail
                          src={visual.thumbnail}
                          alt={`صورة مصغرة للمرئية ${visual.title}`}
                          variant="list"
                          fallbackLabel={
                            visual.type === "upload" ? "فيديو" : "رابط"
                          }
                        />
                        <span>
                          <strong>{visual.title}</strong>
                          {visual.created_at && (
                            <small>
                              {new Intl.DateTimeFormat(ARABIC_DISPLAY_LOCALE, {
                                dateStyle: "medium",
                              }).format(new Date(visual.created_at))}
                            </small>
                          )}
                        </span>
                      </div>
                    </td>
                    <td data-label="النوع">
                      <Badge
                        variant={
                          visual.type === "upload" ? "success" : "warning"
                        }
                      >
                        {visual.type === "upload" ? "فيديو" : "رابط"}
                      </Badge>
                    </td>
                    <td data-label="القسم">
                      {visual.section?.name ? (
                        <span className={styles.sectionName}>
                          {visual.section.name}
                        </span>
                      ) : (
                        <span className={styles.emptyValue}>—</span>
                      )}
                    </td>
                    <td data-label="التقييم">
                      {visual.rating !== null && visual.rating !== undefined ? (
                        <span className={styles.metric}>
                          <span aria-hidden="true">★</span>
                          {visual.rating}
                        </span>
                      ) : (
                        <span className={styles.emptyValue}>—</span>
                      )}
                    </td>
                    <td data-label="المشاهدات">
                      {visual.views_count !== null &&
                      visual.views_count !== undefined ? (
                        <span className={styles.metric}>
                          <span aria-hidden="true">◉</span>
                          {formatArabicNumber(visual.views_count)}
                        </span>
                      ) : (
                        <span className={styles.emptyValue}>—</span>
                      )}
                    </td>
                    <td data-label="الإجراءات">
                      <div className={styles.actions}>
                        <Link
                          className={`ui-button ui-button--secondary ui-focus ${styles.viewAction}`}
                          href={`/dashboard/visuals/${visual.id}`}
                        >
                          عرض
                        </Link>
                        <Link
                          className="ui-button ui-button--secondary ui-focus"
                          href={`/dashboard/visuals/${visual.id}/edit`}
                        >
                          تعديل
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className={styles.pagination} aria-label="ترقيم صفحات المرئيات">
            <Link
              className="ui-button ui-button--secondary ui-focus"
              aria-disabled={paginator.current_page <= 1}
              tabIndex={paginator.current_page <= 1 ? -1 : undefined}
              href={queryHref(query, Math.max(1, paginator.current_page - 1))}
            >
              السابق
            </Link>
            <span className={styles.pageIndicator}>
              <small>الصفحة</small>
              <strong>{formatArabicNumber(paginator.current_page)}</strong>
              <span>من {formatArabicNumber(totalPages)}</span>
            </span>
            <Link
              className="ui-button ui-button--secondary ui-focus"
              aria-disabled={paginator.current_page >= totalPages}
              tabIndex={paginator.current_page >= totalPages ? -1 : undefined}
              href={queryHref(
                query,
                Math.min(totalPages, paginator.current_page + 1),
              )}
            >
              التالي
            </Link>
          </nav>
        </Card>
      )}
    </div>
  );
}

import Link from "next/link";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { ErrorState, HeroSection } from "@/shared/components/ui";

import type {
  ContentViewModuleKey,
  ContentViewModuleSummary,
  ContentViewsSummary,
} from "../domain/content-views.contracts";
import { contentViewModuleKeys } from "../domain/content-views.contracts";
import { contentViewModuleSummarySchema } from "../domain/content-views.schemas";
import type {
  ReportMetric,
  ReportModuleDefinition,
  ReportPayload,
  ReportQuery,
} from "../domain/reports.contracts";
import { reportModules } from "../domain/reports.contracts";

import styles from "./reports.module.css";

type ReportsPageViewProps = {
  report: ReportPayload | null;
  query: ReportQuery;
  definition?: ReportModuleDefinition;
  satisfaction?: ReportMetric | null;
  satisfactionDistribution?: ReportMetric | null;
  contentViews?: ContentViewsSummary | null;
  enabledContentViewModules?: readonly ContentViewModuleKey[];
  unavailable?: boolean;
};

const sectionLabels: Record<string, string> = {
  content: "ملخص المحتوى",
  users: "ملخص المستخدمين",
  support: "ملخص الدعم",
  seo: "ملخص تحسين الظهور",
  content_creation: "نشاط إنشاء المحتوى",
  content_distribution: "توزيع المحتوى",
  content_performance: "أداء المحتوى",
  content_seo_readiness: "جاهزية المحتوى للظهور",
  publishing_velocity: "وتيرة النشر",
  user_growth: "نمو المستخدمين",
  role_distribution: "توزيع الأدوار",
  user_activity: "نشاط المستخدمين",
  admin_activity: "النشاط الإداري",
  support_intake: "الطلبات الواردة",
  workflow_status: "حالات سير العمل",
  resolution_performance: "أداء المعالجة",
  workflow_movement: "حركة الحالات",
  feedback_intake: "الملاحظات الواردة",
  rating_quality: "جودة تجربة المستفيد",
  feedback_status: "حالة الملاحظات",
  sentiment: "التصنيف والمشاعر",
  upload_activity: "نشاط رفع الملفات",
  storage_usage: "استخدام التخزين",
  seo_score_health: "مستوى تحسين الظهور",
  seo_issues: "فرص التحسين",
  seo_conversions: "نتائج الوصول",
  seo_coverage: "تغطية المحتوى واكتشافه",
};

const metricLabels: Record<string, string> = {
  "content.total_articles": `إجمالي ${dashboardCopy.modules.articles.plural}`,
  "content.published_articles": `${dashboardCopy.modules.articles.plural} المنشورة`,
  "content.draft_articles": "المسودات",
  "content.total_books": "إجمالي الكتب",
  "content.total_documents": "إجمالي المستندات",
  "content.total_issues": "إجمالي الأعداد",
  "content.total_galleries": "معارض الصور",
  "content.total_visuals": "المرئيات",
  "content.total_audios": "المواد الصوتية",
  "content.total_sections": "الأقسام",
  "content.created_in_period": "محتوى جديد خلال الفترة",
  "content.created_series": "اتجاه إنشاء المحتوى",
  "content.published_series": "اتجاه النشر",
  "content.updated_series": "اتجاه التحديث",
  "content.total": "إجمالي المحتوى",
  "content.published": "المحتوى المنشور",
  "content.updated": "المحتوى المحدّث",
  "content.viewed": "المحتوى الذي تمت مشاهدته",
  "content.by_type": "المحتوى حسب النوع",
  "content.by_status": "المحتوى حسب الحالة",
  "content.publishing_velocity": "متوسط الإنشاء اليومي",
  "content.total_views": "إجمالي مشاهدات المحتوى",
  "content.views_by_module": "المشاهدات حسب الموديول",
  "content.legacy_views": "إجمالي المشاهدات",
  "content.legacy_downloads": "إجمالي التنزيلات",
  "users.total": "إجمالي المستخدمين",
  "users.total_users_current": "إجمالي المستخدمين الحالي",
  "users.admins": "المديرون",
  "users.editors": "المحررون",
  "users.authors": "الكتّاب",
  "users.regular_users": "المستخدمون",
  "users.new_in_period": "مستخدمون جدد",
  "users.created_series": "اتجاه تسجيل المستخدمين",
  "users.by_role": "توزيع المستخدمين حسب الدور",
  "users.growth_rate": "معدل النمو",
  "users.active_users": "المستخدمون النشطون",
  "users.inactive_users": "المستخدمون غير النشطين",
  "users.active_sessions": "الجلسات النشطة",
  "users.role_growth": "نمو المستخدمين حسب الدور",
  "users.admin_activity_summary": "ملخص نشاط الإدارة",
  "support.total_requests": "إجمالي الطلبات",
  "support.pending_requests": "طلبات قيد الانتظار",
  "support.completed_requests": "طلبات مكتملة",
  "support.rejected_requests": "طلبات مرفوضة",
  "support.created_in_period": "طلبات جديدة خلال الفترة",
  "support.created_series": "اتجاه الطلبات الواردة",
  "support.type_distribution": "الطلبات حسب النوع",
  "support.status_distribution": "الطلبات حسب الحالة",
  "support.pending_age_distribution": "أعمار الطلبات المعلقة",
  "support.documents_waiting_count": "طلبات تنتظر المستندات",
  "support.completion_rate": "معدل الإنجاز",
  "support.rejection_rate": "معدل الرفض",
  "feedback.submissions_series": "اتجاه الشكاوى والمقترحات",
  "feedback.by_type": "الملاحظات حسب النوع",
  "feedback.rating_distribution": "توزيع التقييمات",
  "feedback.average_rating": "متوسط رضا المستفيدين",
  "feedback.low_rating_rate": "نسبة التقييمات المنخفضة",
  "files.uploads_series": "اتجاه الملفات المرفوعة",
  "files.failed_uploads": "ملفات فشل رفعها",
  "files.upload_success_rate": "نسبة نجاح الرفع",
  "files.storage_usage": "المساحة المستخدمة",
  "files.by_type": "الملفات حسب النوع",
  "files.size_distribution": "توزيع أحجام الملفات",
  "files.large_files_count": "الملفات الكبيرة",
  "seo.records_total": "إجمالي صفحات الظهور",
  "seo.indexable_pages": "صفحات قابلة للفهرسة",
  "seo.noindex_pages": "صفحات غير مفهرسة",
  "seo.average_score": "متوسط تقييم تحسين الظهور",
  "seo.issues_count": "مشكلات تحتاج تحسينًا",
  "seo.score_trend": "اتجاه تقييم تحسين الظهور",
  "seo.score_distribution": "توزيع مستويات تحسين الظهور",
  "seo.issues_trend": "اتجاه فرص التحسين",
  "seo.pages_needing_attention": "صفحات تحتاج إلى مراجعة",
  "seo.refresh_due": "صفحات حان وقت تحديثها",
  "seo.conversions_trend": "اتجاه النتائج المحققة",
  "seo.conversion_events_in_period": "نتائج محققة خلال الفترة",
};

const contentViewModuleLabels: Partial<Record<ContentViewModuleKey, string>> = {
  articles: dashboardCopy.modules.articles.navigation,
  scientific_library: dashboardCopy.modules.library.navigation,
  dissertations: dashboardCopy.modules.dissertations.navigation,
  listening: dashboardCopy.modules.listening.navigation,
  scientific_fatwas: dashboardCopy.modules.scientificFatwas.navigation,
  scientific_videos: dashboardCopy.modules.scientificVideos.navigation,
  hadith_cards: dashboardCopy.modules.hadithCards.navigation,
};

const valueLabels: Record<string, string> = {
  articles: dashboardCopy.modules.articles.plural,
  books: "الكتب",
  documents: "المستندات",
  issues: "الأعداد",
  galleries: "المعارض",
  visuals: "المرئيات",
  audios: "الصوتيات",
  sections: "الأقسام",
  published: "منشور",
  draft: "مسودة",
  scheduled: "مجدول",
  admin: "مدير",
  editor: "محرر",
  author: "كاتب",
  user: "مستخدم",
  suggestion: "اقتراح",
  complaint: "شكوى",
  individual: "فردي",
  institutional: "مؤسسي",
  pending: "قيد الانتظار",
  completed: "مكتمل",
  rejected: "مرفوض",
  documents_review: "مراجعة مستندات",
  image: "صور",
  document: "مستندات",
  audio: "صوتيات",
  video: "فيديو",
  other: "أخرى",
  success: "ناجح",
  failed: "فاشل",
  low: "منخفض",
  medium: "متوسط",
  good: "جيد",
  excellent: "ممتاز",
  needs_improvement: "يحتاج إلى تحسين",
  "0_1_days": "يوم أو أقل",
  "2_3_days": "من يومين إلى ٣ أيام",
  "4_7_days": "من ٤ إلى ٧ أيام",
  "8_14_days": "من ٨ إلى ١٤ يومًا",
  "15_plus_days": "١٥ يومًا فأكثر",
  "0_1mb": "حتى ١ ميجابايت",
  "1_10mb": "من ١ إلى ١٠ ميجابايت",
  "10_100mb": "من ١٠ إلى ١٠٠ ميجابايت",
  "100mb_plus": "أكثر من ١٠٠ ميجابايت",
};

const periodLabels: Record<ReportQuery["period"], string> = {
  today: "اليوم",
  yesterday: "أمس",
  last_7_days: "آخر ٧ أيام",
  last_30_days: "آخر ٣٠ يومًا",
  last_90_days: "آخر ٩٠ يومًا",
  month_to_date: "الشهر الحالي",
  quarter_to_date: "الربع الحالي",
  year_to_date: "السنة الحالية",
  custom: "فترة مخصصة",
};

function metricLabel(metric: ReportMetric): string {
  return metricLabels[metric.key] ?? "مؤشر إضافي";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scalar(value: unknown): value is number | string {
  return typeof value === "number" || typeof value === "string";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 }).format(
    value,
  );
}

function distributionValueLabel(key: string): string {
  const translated = valueLabels[key];
  if (translated) return translated;
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return new Intl.DateTimeFormat("ar-EG-u-ca-gregory", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${key}T00:00:00Z`));
  }
  if (/^\d+$/.test(key)) return `تقييم ${formatNumber(Number(key))}`;
  return "غير مصنف";
}

function formatMetricValue(metric: ReportMetric): string {
  if (!metric.available || metric.value === null) return "غير متاح";
  if (
    metric.key === "files.storage_usage" &&
    typeof metric.value === "number"
  ) {
    const units = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت", "تيرابايت"];
    let value = metric.value;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit += 1;
    }
    return `${formatNumber(value)} ${units[unit]}`;
  }
  if (
    (metric.type.includes("rate") ||
      metric.key.includes("_rate") ||
      metric.key === "seo.average_score") &&
    typeof metric.value === "number"
  ) {
    return `${formatNumber(metric.value)}٪`;
  }
  if (
    metric.key === "feedback.average_rating" &&
    typeof metric.value === "number"
  ) {
    return `${formatNumber(metric.value)} / ٥`;
  }
  if (typeof metric.value === "number") return formatNumber(metric.value);
  if (typeof metric.value === "string")
    return valueLabels[metric.value] ?? "متاح";
  return "بيانات تفصيلية";
}

function contentViewsFromMetric(
  metric: ReportMetric,
  enabledModules: readonly ContentViewModuleKey[],
): ContentViewsSummary | null {
  if (!metric.available || metric.key !== "content.views_by_module") {
    return null;
  }

  const parsed = contentViewModuleSummarySchema.array().safeParse(metric.value);
  if (!parsed.success) return null;

  const enabled = new Set(enabledModules);
  const modules = parsed.data.filter((module) => enabled.has(module.key));

  return {
    total: modules.reduce((total, module) => total + module.views_count, 0),
    modules,
  };
}

function qualityLabel(metric: ReportMetric): string {
  if (!metric.available) return "غير متاح";
  if (metric.quality === "complete") return "بيانات مكتملة";
  if (metric.quality === "current_state_only") return "الحالة الحالية";
  if (metric.quality === "partial") return "بيانات جزئية";
  return "بحاجة لمصدر إضافي";
}

function Distribution({ metric }: { metric: ReportMetric }) {
  if (!metric.available || !isRecord(metric.value)) {
    return <UnavailableMetric metric={metric} />;
  }
  const entries = Object.entries(metric.value).filter(([, value]) =>
    scalar(value),
  );
  const numbers = entries.map(([, value]) => Number(value) || 0);
  const max = Math.max(1, ...numbers);

  return (
    <article className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <span>{qualityLabel(metric)}</span>
          <h3>{metricLabel(metric)}</h3>
        </div>
        <strong>
          {formatNumber(numbers.reduce((sum, value) => sum + value, 0))}
        </strong>
      </div>
      <div className={styles.bars}>
        {entries.map(([key, rawValue]) => {
          const value = Number(rawValue) || 0;
          return (
            <div className={styles.barRow} key={key}>
              <div>
                <span>{distributionValueLabel(key)}</span>
                <strong>{formatNumber(value)}</strong>
              </div>
              <span className={styles.barTrack}>
                <span
                  style={{ width: `${Math.max(2, (value / max) * 100)}%` }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function UnavailableMetric({ metric }: { metric: ReportMetric }) {
  return (
    <article className={`${styles.metricCard} ${styles.unavailableMetric}`}>
      <span className={styles.metricStatus}>مصدر البيانات غير مكتمل</span>
      <h3>{metricLabel(metric)}</h3>
      <strong>غير متاح</strong>
      <p>
        لا يوجد حاليًا مصدر موثوق وكافٍ لحساب هذا المؤشر دون استنتاجات مضللة.
      </p>
    </article>
  );
}

function MetricCard({ metric }: { metric: ReportMetric }) {
  if (!metric.available) return <UnavailableMetric metric={metric} />;
  const change = metric.comparison?.available
    ? metric.comparison.change_percentage
    : null;

  return (
    <article className={styles.metricCard}>
      <div className={styles.metricTop}>
        <span className={styles.metricStatus}>{qualityLabel(metric)}</span>
        {change !== null ? (
          <span
            className={`${styles.trend} ${change < 0 ? styles.negativeTrend : ""}`}
          >
            {change > 0 ? "↑" : change < 0 ? "↓" : "•"}{" "}
            {formatNumber(Math.abs(change))}٪
          </span>
        ) : null}
      </div>
      <h3>{metricLabel(metric)}</h3>
      <strong>{formatMetricValue(metric)}</strong>
      <p>مؤشر محسوب من البيانات المسجلة خلال الفترة المختارة.</p>
    </article>
  );
}

function ContentViewsReportPanel({
  summary,
}: {
  summary: ContentViewsSummary;
}) {
  if (summary.modules.length === 0) return null;
  const maxViews = Math.max(
    1,
    ...summary.modules.map((module) => module.views_count),
  );

  return (
    <section className={styles.viewsPanel} aria-labelledby="report-views-title">
      <header className={styles.viewsPanelHeader}>
        <div>
          <span>تفاعل الجمهور</span>
          <h2 id="report-views-title">مشاهدات الموديولات المفعّلة</h2>
          <p>
            أرقام تراكمية مسجلة على العناصر العامة، ومقسّمة وفق موديولات هذا
            المشروع فقط.
          </p>
        </div>
        <div className={styles.viewsPanelTotal}>
          <small>إجمالي المشاهدات</small>
          <strong>{formatNumber(summary.total)}</strong>
        </div>
      </header>
      <div className={styles.viewsModuleGrid}>
        {summary.modules.map((module) => (
          <ContentViewModuleCard
            key={module.key}
            module={module}
            maxViews={maxViews}
          />
        ))}
      </div>
    </section>
  );
}

function ContentViewModuleCard({
  module,
  maxViews,
}: {
  module: ContentViewModuleSummary;
  maxViews: number;
}) {
  const percentage = (module.views_count / maxViews) * 100;

  return (
    <article className={styles.viewsModuleCard}>
      <div>
        <h3>{contentViewModuleLabels[module.key] ?? module.label}</h3>
        <small>{formatNumber(module.items_count)} عنصر مسجل</small>
      </div>
      <strong>{formatNumber(module.views_count)}</strong>
      <span>مشاهدة</span>
      <span className={styles.viewsModuleTrack} aria-hidden="true">
        <span style={{ inlineSize: `${Math.max(2, percentage)}%` }} />
      </span>
    </article>
  );
}

function ReportFilters({ query }: { query: ReportQuery }) {
  return (
    <form className={styles.filters}>
      <label>
        <span>الفترة</span>
        <select name="period" defaultValue={query.period}>
          {Object.entries(periodLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>تجميع الاتجاه</span>
        <select name="group_by" defaultValue={query.group_by}>
          <option value="day">يومي</option>
          <option value="week">أسبوعي</option>
          <option value="month">شهري</option>
        </select>
      </label>
      <label>
        <span>المقارنة</span>
        <select name="compare" defaultValue={query.compare}>
          <option value="none">بدون مقارنة</option>
          <option value="previous_period">بالفترة السابقة</option>
          <option value="previous_year">بالعام السابق</option>
        </select>
      </label>
      <label>
        <span>من</span>
        <input name="date_from" type="date" defaultValue={query.date_from} />
      </label>
      <label>
        <span>إلى</span>
        <input name="date_to" type="date" defaultValue={query.date_to} />
      </label>
      <button type="submit">تطبيق الفلاتر</button>
    </form>
  );
}

function ModuleNavigation({ active }: { active: string | undefined }) {
  return (
    <nav className={styles.moduleNavigation} aria-label="أقسام التقارير">
      <Link
        href="/dashboard/reports"
        className={!active ? styles.activeModule : undefined}
      >
        <span>٠٠</span>
        <strong>نظرة عامة</strong>
      </Link>
      {Object.values(reportModules).map((module, index) => (
        <Link
          href={`/dashboard/reports/${module.key}`}
          className={active === module.key ? styles.activeModule : undefined}
          key={module.key}
        >
          <span>{formatNumber(index + 1).padStart(2, "٠")}</span>
          <strong>{module.eyebrow}</strong>
        </Link>
      ))}
    </nav>
  );
}

const ratingLevelLabels: Record<number, string> = {
  1: "سيء",
  2: "مقبول",
  3: "جيد",
  4: "جيد جدًا",
  5: "ممتاز",
};

function SatisfactionCard({
  metric,
  distribution,
}: {
  metric: ReportMetric | null;
  distribution: ReportMetric | null;
}) {
  const value =
    metric?.available && typeof metric.value === "number" ? metric.value : null;
  const available = value !== null;
  const numericValue = value ?? 0;
  const percentage = (numericValue / 5) * 100;
  const distributionValue =
    distribution?.available && isRecord(distribution.value)
      ? distribution.value
      : {};
  const ratings = [5, 4, 3, 2, 1].map((rating) => {
    const rawCount = Number(distributionValue[String(rating)] ?? 0);
    return {
      rating,
      count: Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 0,
    };
  });
  const ratingCount = ratings.reduce((total, item) => total + item.count, 0);

  return (
    <section className={styles.satisfactionCard}>
      <div>
        <span>مؤشر تجربة المستفيد</span>
        <h2>قياس رضا المستفيدين</h2>
        <p>
          نتيجة حقيقية محسوبة من التقييمات المرسلة خلال الفترة المختارة عبر قسم
          قياس رضا المستفيدين في الموقع.
        </p>
      </div>
      <div
        className={styles.satisfactionGauge}
        style={{ "--satisfaction": `${percentage}%` } as React.CSSProperties}
      >
        <div>
          <strong>{available ? `${formatNumber(percentage)}٪` : "—"}</strong>
          <span>الرضا العام</span>
        </div>
      </div>
      <div className={styles.satisfactionReading}>
        <strong>
          {available
            ? `متوسط ${formatNumber(numericValue)} من ٥`
            : "لا توجد تقييمات كافية"}
        </strong>
        <span>
          {available
            ? `بناءً على ${formatNumber(ratingCount)} تقييم مسجل خلال الفترة.`
            : "سيظهر المؤشر بعد استقبال أول تقييم موثوق."}
        </span>
      </div>
      {ratingCount > 0 ? (
        <div className={styles.satisfactionDistribution}>
          <div className={styles.distributionHeading}>
            <strong>تفاصيل اختيارات المستفيدين</strong>
            <span>إجمالي التقييمات: {formatNumber(ratingCount)}</span>
          </div>
          <div className={styles.ratingLevels}>
            {ratings.map(({ rating, count }) => {
              const share = (count / ratingCount) * 100;
              const satisfactionLevel = (rating / 5) * 100;

              return (
                <div className={styles.ratingLevel} key={rating}>
                  <div>
                    <strong>{ratingLevelLabels[rating]}</strong>
                    <span>{formatNumber(satisfactionLevel)}٪ رضا</span>
                  </div>
                  <span className={styles.ratingTrack} aria-hidden="true">
                    <span style={{ inlineSize: `${share}%` }} />
                  </span>
                  <div>
                    <strong>{formatNumber(count)} تقييم</strong>
                    <span>{formatNumber(share)}٪ من الإجمالي</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function ReportsPageView({
  report,
  query,
  definition,
  satisfaction = null,
  satisfactionDistribution = null,
  contentViews = null,
  enabledContentViewModules = contentViewModuleKeys,
  unavailable = false,
}: ReportsPageViewProps) {
  const title = definition?.title ?? dashboardCopy.modules.reports.navigation;
  const description =
    definition?.description ??
    "صورة تنفيذية موحدة لأداء المحتوى والمستخدمين وتجربة المستفيد.";

  const visibleSections =
    report?.sections
      .filter((section) => sectionLabels[section.key] !== undefined)
      .map((section) => ({
        ...section,
        metrics: section.metrics.filter(
          (metric) =>
            metric.available &&
            metricLabels[metric.key] !== undefined &&
            (scalar(metric.value) ||
              isRecord(metric.value) ||
              contentViewsFromMetric(metric, enabledContentViewModules) !==
                null),
        ),
      }))
      .filter((section) => section.metrics.length > 0) ?? [];

  return (
    <div className={styles.page}>
      <HeroSection
        eyebrow={definition?.eyebrow ?? "مركز ذكاء الأعمال"}
        title={title}
        description={description}
        actions={
          report ? (
            <div className={styles.generatedAt}>
              <span>آخر تحديث</span>
              <strong>
                {new Intl.DateTimeFormat("ar-SA", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Africa/Cairo",
                }).format(new Date(report.generated_at))}
              </strong>
            </div>
          ) : undefined
        }
      />

      <ModuleNavigation active={definition?.key} />
      <ReportFilters query={query} />

      {unavailable || !report ? (
        <ErrorState
          title="تعذّر تحميل بيانات التقرير"
          description="تحقق من اتصال الخدمة وصلاحية عرض التقارير، ثم أعد تحميل الصفحة."
        />
      ) : (
        <>
          <div className={styles.periodSummary}>
            <div>
              <span>نطاق التقرير</span>
              <strong>{formatReportRange(report)}</strong>
            </div>
            <div>
              <span>الفترة المختارة</span>
              <strong>{periodLabels[report.period.key]}</strong>
            </div>
          </div>

          {!definition ? (
            <>
              {contentViews ? (
                <ContentViewsReportPanel summary={contentViews} />
              ) : null}
              <SatisfactionCard
                metric={satisfaction}
                distribution={satisfactionDistribution}
              />
            </>
          ) : null}

          <div className={styles.sections}>
            {visibleSections.map((section) => {
              const scalarMetrics = section.metrics.filter(
                (metric) =>
                  !isRecord(metric.value) &&
                  contentViewsFromMetric(metric, enabledContentViewModules) ===
                    null,
              );
              const distributions = section.metrics.filter((metric) =>
                isRecord(metric.value),
              );
              const moduleViews = section.metrics
                .map((metric) =>
                  contentViewsFromMetric(metric, enabledContentViewModules),
                )
                .find((summary) => summary !== null);

              return (
                <section className={styles.reportSection} key={section.key}>
                  <header>
                    <div>
                      <span>
                        {formatNumber(section.metrics.length).padStart(2, "٠")}{" "}
                        مؤشر
                      </span>
                      <h2>{sectionLabels[section.key]}</h2>
                    </div>
                  </header>
                  {scalarMetrics.length > 0 ? (
                    <div className={styles.metricGrid}>
                      {scalarMetrics.map((metric) => (
                        <MetricCard metric={metric} key={metric.key} />
                      ))}
                    </div>
                  ) : null}
                  {distributions.length > 0 ? (
                    <div className={styles.chartGrid}>
                      {distributions.map((metric) => (
                        <Distribution metric={metric} key={metric.key} />
                      ))}
                    </div>
                  ) : null}
                  {moduleViews ? (
                    <ContentViewsReportPanel summary={moduleViews} />
                  ) : null}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function formatReportRange(report: ReportPayload): string {
  const formatter = new Intl.DateTimeFormat("ar-EG-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(new Date(`${report.period.date_from}T00:00:00Z`))} — ${formatter.format(
    new Date(`${report.period.date_to}T00:00:00Z`),
  )}`;
}

export function findMetric(
  report: ReportPayload | null,
  key: string,
): ReportMetric | null {
  return (
    report?.sections
      .flatMap((section) => section.metrics)
      .find((metric) => metric.key === key) ?? null
  );
}

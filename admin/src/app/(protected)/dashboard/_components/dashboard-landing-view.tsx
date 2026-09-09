"use client";

import Link from "next/link";

import {
  Card,
  EmptyState,
  HeroSection,
  PageSkeleton,
} from "@/shared/components/ui";
import {
  useAdminShellAdmin,
  useAdminShellNavigation,
} from "@/shared/components/layout/admin-shell";
import { PageContainer } from "@/shared/components/layout/page-container";
import { OptionalPublicLogo } from "@/shared/components/ui/optional-public-logo";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import type {
  ContentViewModuleKey,
  ContentViewsSummary,
} from "@/features/reports/domain/content-views.contracts";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import styles from "./dashboard-landing-view.module.css";

export type DashboardLandingInsights = {
  generatedAt: string;
  totalContent: number;
  publishedArticles: number | null;
  satisfaction: number | null;
  newUsers: number | null;
  distribution: Array<{ label: string; value: number }>;
};

const moduleDescriptions: Record<string, string> = {
  "/dashboard/sections": `تنظيم ${dashboardCopy.modules.sections.plural} وربطها بالموديولات المناسبة.`,
  "/dashboard/articles": `إنشاء ${dashboardCopy.modules.articles.plural} ومراجعة حالاتها ووسائطها.`,
  "/dashboard/library": `${dashboardCopy.modules.library.navigation}: إدارة ملفات القراءة والتحميل وبيانات النشر العلمي.`,
  "/dashboard/dissertations": `${dashboardCopy.modules.dissertations.navigation}: إدارة بيانات الرسائل والمشاركة العلمية.`,
  "/dashboard/listening": `${dashboardCopy.modules.listening.navigation}: إدارة السلاسل والتسجيلات من مساحة واحدة.`,
  "/dashboard/hadith-cards": `${dashboardCopy.modules.hadithCards.navigation}: إدارة المشروعات والبطاقات المصوّرة من مساحة واحدة.`,
  "/dashboard/scientific-fatwas": `${dashboardCopy.modules.scientificFatwas.navigation}: إدارة المصادر وحالات النشر.`,
  "/dashboard/scientific-videos": `${dashboardCopy.modules.scientificVideos.navigation}: تنظيم مصادر المشاهدة والتنزيل.`,
  "/dashboard/books": `تنظيم ${dashboardCopy.modules.books.plural} والسلاسل والمصادر الرقمية.`,
  "/dashboard/visuals": `إدارة ${dashboardCopy.modules.visuals.plural} والروابط المنشورة.`,
  "/dashboard/gallery-media": `رفع الصور والفيديوهات وإدارة ${dashboardCopy.modules.gallery.plural}.`,
  "/dashboard/supervisors": `إدارة حسابات ${dashboardCopy.modules.supervisors.plural} والأدوار والصلاحيات.`,
  "/dashboard/tour-guides":
    "إدارة المرشدين السياحيين السياحيين ومتابعة طلبات الرحلات من الاستلام حتى الإنهاء.",
  "/dashboard/settings": `التحكم في بيانات الموقع والمحتوى و${dashboardCopy.modules.settings.plural} العامة.`,
};

const moduleIcons: Record<string, string> = {
  "/dashboard/sections": "§",
  "/dashboard/library": "▤",
  "/dashboard/dissertations": "◈",
  "/dashboard/listening": "◖",
  "/dashboard/hadith-cards": "▧",
  "/dashboard/scientific-fatwas": "؟",
  "/dashboard/scientific-videos": "▷",
  "/dashboard/visuals": "▶",
  "/dashboard/gallery-media": "▧",
  "/dashboard/supervisors": "♙",
  "/dashboard/tour-guides": "⌖",
  "/dashboard/settings": "⚙",
};

const contentViewModuleCopy: Record<
  ContentViewModuleKey,
  { label: string; icon: string }
> = {
  articles: {
    label: dashboardCopy.modules.articles.navigation,
    icon: "✎",
  },
  scientific_library: {
    label: dashboardCopy.modules.library.navigation,
    icon: "▤",
  },
  dissertations: {
    label: dashboardCopy.modules.dissertations.navigation,
    icon: "◈",
  },
  listening: {
    label: dashboardCopy.modules.listening.navigation,
    icon: "◖",
  },
  scientific_fatwas: {
    label: dashboardCopy.modules.scientificFatwas.navigation,
    icon: "؟",
  },
  scientific_videos: {
    label: dashboardCopy.modules.scientificVideos.navigation,
    icon: "▷",
  },
  hadith_cards: {
    label: dashboardCopy.modules.hadithCards.navigation,
    icon: "▧",
  },
};

export function DashboardLandingView({
  loading = false,
  insights = null,
  contentViews = null,
}: {
  loading?: boolean;
  insights?: DashboardLandingInsights | null;
  contentViews?: ContentViewsSummary | null;
}) {
  const admin = useAdminShellAdmin();
  const navigation = useAdminShellNavigation();
  if (loading)
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  const quickLinks = navigation.filter((item) => item.href !== "/dashboard");

  return (
    <PageContainer
      header={
        <HeroSection
          className={styles.hero ?? ""}
          eyebrow={dashboardCopy.common.dashboard}
          title={`مرحبًا، ${admin.name}`}
          description="مساحة عمل موحدة تمنحك وصولًا سريعًا لكل أدوات إدارة المحتوى المتاحة."
          leading={
            <OptionalPublicLogo
              className={styles.publicHeroLogo ?? ""}
              imageClassName={styles.publicHeroLogoImage ?? ""}
              sizes="80px"
              priority
              fallback={
                <div className={styles.motionMark} aria-hidden="true">
                  <span className={styles.orbitOne} />
                  <span className={styles.orbitTwo} />
                  <strong>CMS</strong>
                </div>
              }
            />
          }
          actions={
            <div className={styles.liveStatus}>
              <span aria-hidden="true" />
              <div>
                <strong>النظام جاهز</strong>
                <small>يمكنك بدء إدارة المحتوى الآن</small>
              </div>
            </div>
          }
        />
      }
    >
      <div className={styles.stage}>
        <span className={styles.ambientOne} aria-hidden="true" />
        <span className={styles.ambientTwo} aria-hidden="true" />

        <section className={styles.quickSection}>
          <header className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>وصول سريع</span>
              <h2>مساحات الإدارة</h2>
              <p>اختر الوحدة التي تريد العمل عليها.</p>
            </div>
            <span className={styles.moduleCount}>
              {formatArabicNumber(quickLinks.length)} وحدات متاحة
            </span>
          </header>

          {quickLinks.length > 0 ? (
            <div className={styles.quickGrid}>
              {quickLinks.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.quickCard}
                  style={{ animationDelay: `${120 + index * 80}ms` }}
                >
                  <span className={styles.cardGlow} aria-hidden="true" />
                  <span className={styles.moduleIcon} aria-hidden="true">
                    {moduleIcons[item.href] ?? "◆"}
                  </span>
                  <div>
                    <h3>{item.label}</h3>
                    <p>
                      {moduleDescriptions[item.href] ??
                        "الوصول إلى أدوات إدارة هذه الوحدة."}
                    </p>
                  </div>
                  <span className={styles.cardArrow} aria-hidden="true">
                    ←
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Card className={styles.empty ?? ""}>
              <EmptyState
                title="لا توجد وحدات متاحة"
                description="ستظهر هنا وحدات الإدارة التي تملك صلاحية الوصول إليها."
              />
            </Card>
          )}
        </section>

        <ContentViewsPulse summary={contentViews} />
        <DashboardPulse insights={insights} />
      </div>
    </PageContainer>
  );
}

export function ContentViewsPulse({
  summary,
}: {
  summary: ContentViewsSummary | null;
}) {
  if (!summary || summary.modules.length === 0) return null;

  const maxViews = Math.max(
    1,
    ...summary.modules.map((module) => module.views_count),
  );

  return (
    <section
      className={styles.viewsSection}
      aria-labelledby="content-views-title"
    >
      <header className={styles.viewsHeader}>
        <div>
          <span className={styles.sectionEyebrow}>تفاعل الجمهور</span>
          <h2 id="content-views-title">مشاهدات المحتوى</h2>
          <p>
            قراءة مباشرة لإجمالي المشاهدات المسجلة داخل الموديولات المفعّلة في
            هذا المشروع.
          </p>
        </div>
        <div className={styles.viewsTotal}>
          <span aria-hidden="true">◉</span>
          <div>
            <small>إجمالي المشاهدات</small>
            <strong>{formatArabicNumber(summary.total)}</strong>
          </div>
        </div>
      </header>

      <div className={styles.viewsGrid}>
        {summary.modules.map((module) => {
          const copy = contentViewModuleCopy[module.key];
          const percentage = (module.views_count / maxViews) * 100;

          return (
            <article className={styles.viewsCard} key={module.key}>
              <div className={styles.viewsCardHeader}>
                <span aria-hidden="true">{copy.icon}</span>
                <div>
                  <h3>{copy.label}</h3>
                  <small>
                    {formatArabicNumber(module.items_count)} عنصر مسجل
                  </small>
                </div>
              </div>
              <div className={styles.viewsCardValue}>
                <strong>{formatArabicNumber(module.views_count)}</strong>
                <span>مشاهدة</span>
              </div>
              <span className={styles.viewsTrack} aria-hidden="true">
                <span style={{ inlineSize: `${Math.max(2, percentage)}%` }} />
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DashboardPulse({
  insights,
}: {
  insights: DashboardLandingInsights | null;
}) {
  if (!insights) {
    return (
      <Card className={styles.analyticsUnavailable ?? ""}>
        <span className={styles.analyticsIcon} aria-hidden="true">
          ↗
        </span>
        <div>
          <h2>مؤشرات الأداء غير متاحة لهذا الحساب</h2>
          <p>
            تحتاج هذه اللوحة إلى صلاحية عرض التقارير، بينما تظل وحدات الإدارة
            المتاحة لك جاهزة للاستخدام.
          </p>
        </div>
      </Card>
    );
  }

  const maxDistribution = Math.max(
    1,
    ...insights.distribution.map((item) => item.value),
  );
  const statistics = [
    {
      label: "إجمالي المحتوى",
      value: formatArabicNumber(insights.totalContent),
      note: "كل الأصول المسجلة",
    },
    {
      label: `${dashboardCopy.modules.articles.plural} المنشورة`,
      value:
        insights.publishedArticles === null
          ? "—"
          : formatArabicNumber(insights.publishedArticles),
      note: "متاحة للجمهور الآن",
    },
    {
      label: "مستوى الرضا",
      value:
        insights.satisfaction === null
          ? "—"
          : `${formatArabicNumber(insights.satisfaction, {
              maximumFractionDigits: 1,
            })} / ٥`,
      note: "من تقييمات المستفيدين",
    },
    {
      label: "مستخدمون جدد",
      value:
        insights.newUsers === null
          ? "—"
          : formatArabicNumber(insights.newUsers),
      note: "خلال آخر ٣٠ يوماً",
    },
  ];

  return (
    <section className={styles.analyticsSection} aria-labelledby="pulse-title">
      <header className={styles.analyticsHeader}>
        <div>
          <span className={styles.sectionEyebrow}>قراءة تنفيذية</span>
          <h2 id="pulse-title">نبض المنصة</h2>
          <p>
            مؤشرات حقيقية محدثة من بيانات المحتوى وتجربة المستفيد خلال آخر ٣٠
            يوماً.
          </p>
        </div>
        <div className={styles.analyticsActions}>
          <span>
            آخر تحديث{" "}
            {new Intl.DateTimeFormat("ar-SA", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "Africa/Cairo",
            }).format(new Date(insights.generatedAt))}
          </span>
          <Link
            href="/dashboard/reports"
            className="ui-button ui-button--secondary ui-focus"
          >
            التقرير الكامل
          </Link>
        </div>
      </header>

      <div className={styles.statisticsGrid}>
        {statistics.map((statistic, index) => (
          <article className={styles.statisticCard} key={statistic.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{statistic.value}</strong>
            <div>
              <h3>{statistic.label}</h3>
              <p>{statistic.note}</p>
            </div>
          </article>
        ))}
      </div>

      <Card className={styles.distributionCard ?? ""}>
        <div className={styles.distributionIntro}>
          <span>توزيع المكتبة البكرية</span>
          <h3>أين يتركز المحتوى؟</h3>
          <p>مقارنة سريعة بين أبرز أنواع المحتوى المسجلة حالياً داخل المنصة.</p>
        </div>
        <div className={styles.distributionChart}>
          {insights.distribution.map((item) => (
            <div className={styles.chartRow} key={item.label}>
              <div>
                <span>{item.label}</span>
                <strong>{formatArabicNumber(item.value)}</strong>
              </div>
              <span className={styles.chartTrack} aria-hidden="true">
                <span
                  style={
                    {
                      "--chart-value": `${Math.max(
                        3,
                        (item.value / maxDistribution) * 100,
                      )}%`,
                    } as React.CSSProperties
                  }
                />
              </span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

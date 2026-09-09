"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiCalendar, FiDownload, FiFileText } from "react-icons/fi";
import ReportGallery from "./ReportGallery";
import styles from "./page.module.css";
import { useLanguage } from "../../../../contexts/LanguageContext";

const reportFile = "/adahi-report-1444.pdf";
const translations = {
  ar: { home: "الرئيسية", reports: "التقارير", title: "تقرير أضاحي", releases: "إصدارات الجمعية", lead: "تصفّح التقرير المصور لمشروع أضاحي جمعية الآل والأصحاب واستعرض جميع صفحاته بصورة واضحة وسهلة.", date: "17 يناير 2025", type: "تقرير مصور", browse: "تصفّح صفحات التقرير", download: "تنزيل التقرير PDF", label: "تقرير الجمعية", cover: "غلاف تقرير أضاحي", visual: "التقرير المصور" },
  en: { home: "Home", reports: "Reports", title: "Adahi Report", releases: "Society publications", lead: "Browse the illustrated report of the Society’s Adahi project and view all its pages clearly and easily.", date: "17 January 2025", type: "Illustrated report", browse: "Browse report pages", download: "Download PDF report", label: "Society report", cover: "Adahi report cover", visual: "Illustrated report" },
  fa: { home: "خانه", reports: "گزارش‌ها", title: "گزارش قربانی", releases: "انتشارات بنیاد", lead: "گزارش تصویری طرح قربانی بنیاد را با همه صفحات آن به‌روشنی و آسانی مرور کنید.", date: "۱۷ ژانویه ۲۰۲۵", type: "گزارش تصویری", browse: "مرور صفحات گزارش", download: "دریافت گزارش PDF", label: "گزارش بنیاد", cover: "جلد گزارش قربانی", visual: "گزارش تصویری" },
};

export default function AdahiReportPage() {
  const { language } = useLanguage();
  const text = translations[language];
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label={text.reports}>
            <Link href="/">{text.home}</Link>
            <span>/</span>
            <Link href="/reports/annual">{text.reports}</Link>
            <span>/</span>
            <span aria-current="page">{text.title}</span>
          </nav>

          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>{text.releases}</span><h1>{text.title}</h1><p>{text.lead}</p>
              <div className={styles.meta}>
                <span><FiCalendar aria-hidden />{text.date}</span><span><FiFileText aria-hidden />{text.type}</span>
                <span className={styles.year}>1444هـ</span>
              </div>
              <div className={styles.actions}>
                <a className={styles.primaryAction} href="#report-viewer">
                  {text.browse}
                  <FiArrowRight aria-hidden />
                </a>
                <a className={styles.secondaryAction} href={reportFile} download>
                  {text.download}
                  <FiDownload aria-hidden />
                </a>
              </div>
            </div>

            <div className={styles.coverWrap}>
              <span className={styles.coverLabel}>{text.label}</span>
              <Image
                src="/adaha/تقرير-أضاحي-آل-ثاني-1444_page-0001-724x1024.jpg"
                alt={text.cover}
                width={724}
                height={1024}
                className={styles.cover}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.viewerSection} id="report-viewer">
        <div className={styles.container}>
          <header className={styles.viewerHeader}>
            <div>
              <span>{text.visual}</span><h2>{text.browse}</h2>
            </div>
            <a className={styles.viewerDownload} href={reportFile} download>
              <FiDownload aria-hidden />
              {text.download}
            </a>
          </header>
          <ReportGallery />
        </div>
      </section>
    </main>
  );
}

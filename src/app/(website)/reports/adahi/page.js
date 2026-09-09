import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiCalendar, FiDownload, FiFileText } from "react-icons/fi";
import ReportGallery from "./ReportGallery";
import styles from "./page.module.css";

export const metadata = {
  title: "تقرير أضاحي | وقف عبد الله بن قاسم",
  description: "عرض صفحات تقرير أضاحي وقف عبد الله بن قاسم آل ثاني.",
};

const reportFile = "/adahi-report-1444.pdf";

export default function AdahiReportPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="مسار التنقل">
            <Link href="/">الرئيسية</Link>
            <span>/</span>
            <Link href="/#policies">اللوائح والسياسات</Link>
            <span>/</span>
            <span aria-current="page">تقرير أضاحي</span>
          </nav>

          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>إصدارات الوقف</span>
              <h1>تقرير أضاحي</h1>
              <p>
                تصفّح التقرير المصور لمشروع أضاحي وقف عبد الله بن قاسم آل ثاني
                واستعرض جميع صفحاته بصورة واضحة وسهلة.
              </p>
              <div className={styles.meta}>
                <span><FiCalendar aria-hidden />17 يناير، 2025</span>
                <span><FiFileText aria-hidden />تقرير مصور</span>
                <span className={styles.year}>1444هـ</span>
              </div>
              <div className={styles.actions}>
                <a className={styles.primaryAction} href="#report-viewer">
                  تصفّح صفحات التقرير
                  <FiArrowRight aria-hidden />
                </a>
                <a className={styles.secondaryAction} href={reportFile} download>
                  تنزيل التقرير PDF
                  <FiDownload aria-hidden />
                </a>
              </div>
            </div>

            <div className={styles.coverWrap}>
              <span className={styles.coverLabel}>تقرير الوقف</span>
              <Image
                src="/adaha/تقرير-أضاحي-آل-ثاني-1444_page-0001-724x1024.jpg"
                alt="غلاف تقرير أضاحي"
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
              <span>التقرير المصور</span>
              <h2>تصفّح صفحات التقرير</h2>
            </div>
            <a className={styles.viewerDownload} href={reportFile} download>
              <FiDownload aria-hidden />
              تنزيل PDF
            </a>
          </header>
          <ReportGallery />
        </div>
      </section>
    </main>
  );
}

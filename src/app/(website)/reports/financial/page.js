import Image from "next/image";
import Link from "next/link";
import {
  FiArrowLeft,
  FiBarChart2,
  FiCalendar,
  FiDownload,
  FiFileText,
} from "react-icons/fi";
import styles from "./page.module.css";

export const metadata = {
  title: "التقارير المالية | وقف عبد الله بن قاسم",
  description: "مكتبة التقارير المالية وتقارير مشروعات وقف عبد الله بن قاسم آل ثاني.",
};

const reports = [
  {
    title: "تقرير أضاحي",
    description: "تقرير مصور يوثق مشروع الأضاحي وأثره، مع إمكانية تصفح جميع صفحات التقرير وتنزيل نسخة PDF.",
    image: "/aladha.jpg",
    date: "17 يناير، 2025",
    type: "تقرير مصور",
    href: "/reports/adahi",
    file: "/adahi-report-1444.pdf",
  },
];

export default function FinancialReportsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroPattern} aria-hidden />
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}><FiBarChart2 aria-hidden />إصدارات الوقف</span>
            <h1>التقارير <span>المالية</span></h1>
            <p>مكتبة منظمة لعرض تقارير الوقف وتوثيق مشروعاته ونتائجها بصورة واضحة وسهلة الوصول.</p>
            <div className={styles.heroFeatures}>
              <span><FiFileText aria-hidden />تقارير موثقة</span>
              <span><FiDownload aria-hidden />عرض وتنزيل</span>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden>
            <div className={styles.visualGlow} />
            <div className={styles.visualCardBack} />
            <div className={styles.visualCard}>
              <div className={styles.visualTop}>
                <span><FiBarChart2 /></span>
                <small>مكتبة الوقف</small>
              </div>
              <div className={styles.visualCount}>{String(reports.length).padStart(2, "0")}</div>
              <strong>تقرير متاح</strong>
              <div className={styles.visualBars}>
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className={styles.visualFooter}>
                <span>تقارير موثقة</span>
                <FiFileText />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.reportsSection}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <div>
              <span>التقارير المتاحة</span>
              <h2>مكتبة التقارير</h2>
              <p>يمكنك فتح التقرير وتصفّح صفحاته داخل الموقع أو تنزيل نسخة للاحتفاظ بها.</p>
            </div>
            <span className={styles.count}>{String(reports.length).padStart(2, "0")} تقرير</span>
          </header>

          <div className={styles.reportsGrid}>
            {reports.map((report, index) => (
              <article className={styles.reportCard} key={report.href}>
                <Link href={report.href} className={styles.imageWrap} aria-label={`فتح ${report.title}`}>
                  <Image
                    src={report.image}
                    alt={report.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1020px) 50vw, 33vw"
                    className={styles.cardImage}
                  />
                  <span className={styles.typeBadge}><FiFileText aria-hidden />{report.type}</span>
                  <span className={styles.reportNumber}>{String(index + 1).padStart(2, "0")}</span>
                </Link>

                <div className={styles.cardBody}>
                  <div className={styles.date}><FiCalendar aria-hidden />{report.date}</div>
                  <h3><Link href={report.href}>{report.title}</Link></h3>
                  <p>{report.description}</p>

                  <div className={styles.cardActions}>
                    <Link href={report.href} className={styles.viewButton}>
                      عرض التقرير
                      <FiArrowLeft aria-hidden />
                    </Link>
                    <a href={report.file} download className={styles.downloadButton} aria-label={`تنزيل ${report.title}`}>
                      <FiDownload aria-hidden />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

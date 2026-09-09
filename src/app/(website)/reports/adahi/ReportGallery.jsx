import Image from "next/image";
import { FiMaximize2 } from "react-icons/fi";
import styles from "./page.module.css";

const reportPages = [
  {
    src: "/adaha/تقرير-أضاحي-آل-ثاني-1444_page-0001-724x1024.jpg",
    alt: "غلاف التقرير المصور لأضاحي وقف عبد الله بن قاسم آل ثاني لعام 1444هـ",
  },
  {
    src: "/adaha/adahi-report-page-02-high.jpg",
    alt: "مقدمة تقرير أضاحي وقف عبد الله بن قاسم آل ثاني",
  },
  {
    src: "/adaha/adahi-report-page-03-high.jpg",
    alt: "صور مراحل مشروع أضاحي وقف عبد الله بن قاسم آل ثاني",
  },
];

export default function ReportGallery() {
  return (
    <div className={styles.reportReader}>
      <div className={styles.readerHeader}>
        <div>
          <span className={styles.readerEyebrow}>تقرير مصور</span>
          <h3>صفحات التقرير كاملة</h3>
        </div>
        <span className={styles.pagesCount}>{reportPages.length} صفحات</span>
      </div>

      <div className={styles.reportPages}>
        {reportPages.map((page, index) => (
          <article
            className={`${styles.reportPage} ${index === 0 ? styles.reportCoverPage : ""}`}
            key={page.src}
          >
            <div className={styles.pageHeading}>
              <span>صفحة {String(index + 1).padStart(2, "0")}</span>
              <a href={page.src} target="_blank" rel="noreferrer">
                <FiMaximize2 aria-hidden />
                عرض بالحجم الكامل
              </a>
            </div>
            <a className={styles.pageImageLink} href={page.src} target="_blank" rel="noreferrer">
              <Image
                src={page.src}
                alt={page.alt}
                width={724}
                height={1024}
                className={styles.reportImage}
                quality={95}
                priority={index === 0}
              />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

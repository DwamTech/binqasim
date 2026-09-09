"use client";

import Image from "next/image";
import { FiMaximize2 } from "react-icons/fi";
import styles from "./page.module.css";
import { useLanguage } from "../../../../contexts/LanguageContext";

const reportPages = [
  {
    src: "/adaha/تقرير-أضاحي-آل-ثاني-1444_page-0001-724x1024.jpg",
    alt: "غلاف التقرير المصور لأضاحي جمعية الآل والأصحاب لعام 1444هـ",
  },
  {
    src: "/adaha/adahi-report-page-02-high.jpg",
    alt: "مقدمة تقرير أضاحي جمعية الآل والأصحاب",
  },
  {
    src: "/adaha/adahi-report-page-03-high.jpg",
    alt: "صور مراحل مشروع أضاحي جمعية الآل والأصحاب",
  },
];

export default function ReportGallery() {
  const { language } = useLanguage();
  const text = { ar: { report: "تقرير مصور", complete: "صفحات التقرير كاملة", pages: "صفحات", page: "صفحة", full: "عرض بالحجم الكامل", alts: ["غلاف التقرير المصور لأضاحي جمعية الآل والأصحاب لعام 1444هـ", "مقدمة تقرير أضاحي جمعية الآل والأصحاب", "صور مراحل مشروع أضاحي جمعية الآل والأصحاب"] }, en: { report: "Illustrated report", complete: "Complete report pages", pages: "pages", page: "Page", full: "View full size", alts: ["Cover of the Society’s 1444 AH Adahi report", "Introduction to the Adahi report", "Images from the Adahi project"] }, fa: { report: "گزارش تصویری", complete: "همه صفحات گزارش", pages: "صفحه", page: "صفحه", full: "مشاهده در اندازه کامل", alts: ["جلد گزارش قربانی بنیاد سال ۱۴۴۴ قمری", "مقدمه گزارش قربانی", "تصاویر مراحل طرح قربانی"] } }[language];
  return (
    <div className={styles.reportReader}>
      <div className={styles.readerHeader}>
        <div>
          <span className={styles.readerEyebrow}>{text.report}</span><h3>{text.complete}</h3>
        </div>
        <span className={styles.pagesCount}>{reportPages.length} {text.pages}</span>
      </div>

      <div className={styles.reportPages}>
        {reportPages.map((page, index) => (
          <article
            className={`${styles.reportPage} ${index === 0 ? styles.reportCoverPage : ""}`}
            key={page.src}
          >
            <div className={styles.pageHeading}>
              <span>{text.page} {String(index + 1).padStart(2, "0")}</span>
              <a href={page.src} target="_blank" rel="noreferrer">
                <FiMaximize2 aria-hidden />
                {text.full}
              </a>
            </div>
            <a className={styles.pageImageLink} href={page.src} target="_blank" rel="noreferrer">
              <Image
                src={page.src}
                alt={text.alts[index]}
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

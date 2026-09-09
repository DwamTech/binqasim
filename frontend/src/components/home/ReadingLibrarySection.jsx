"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiBookOpen } from "react-icons/fi";
import { useLanguage } from "../../contexts/LanguageContext";
import { visualLibrary } from "../../data/visualLibrary";
import styles from "./ReadingLibrarySection.module.css";

const copy = {
  ar: { eyebrow: "شاهد وتعرّف", title: "المكتبة المرئية", lead: "مواد مرئية مختارة تقدم المعرفة ورسالة الجمعية بأسلوب واضح وقريب.", more: "استكشف المرئيات", open: "مشاهدة المادة" },
  en: { eyebrow: "Watch and discover", title: "Visual Library", lead: "Selected videos presenting knowledge and the Society's mission in a clear way.", more: "Explore videos", open: "Watch video" },
  fa: { eyebrow: "ببینید و بشناسید", title: "کتابخانه تصویری", lead: "محتوای تصویری برگزیده درباره دانش و رسالت بنیاد.", more: "مشاهده ویدیوها", open: "مشاهده ویدیو" },
};

export default function VisualLibrarySection() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <section className={styles.section} id="visual-library">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div><span><FiBookOpen aria-hidden />{text.eyebrow}</span><h2>{text.title}</h2><p>{text.lead}</p></div>
          <Link href="/visuals">{text.more}<FiArrowLeft aria-hidden /></Link>
        </header>
        <div className={styles.mosaic}>
          {visualLibrary.map((book, index) => (
            <Link className={`${styles.card} ${styles[`card${index + 1}`]}`} href={`/visuals/${book.slug}`} key={book.slug} aria-label={`${text.open}: ${book.title[language]}`}>
              <div className={styles.image}><Image src={book.image} alt={book.title[language]} fill sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 35vw" /></div>
              <div className={styles.caption}><span>{String(index + 1).padStart(2, "0")}</span><h3>{book.title[language]}</h3><FiArrowLeft aria-hidden /></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

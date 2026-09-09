"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiBookOpen } from "react-icons/fi";
import { useLanguage } from "../../../contexts/LanguageContext";
import { libraryBooks } from "../../../data/libraryBooks";
import styles from "./page.module.css";

const labels = {
  ar: {
    kicker: "المكتبة المقروءة",
    title: "إصدارات معرفية تُنير طريق القارئ",
    lead: "مجموعة مختارة من الكتب والإصدارات التي تعرّف بتاريخ الآل والأصحاب وتُرسّخ معاني المحبة والإنصاف.",
    read: "عرض الكتاب",
  },
  en: {
    kicker: "Reading library",
    title: "Knowledge that lights the reader’s path",
    lead: "A curated collection of books and publications about Ahl al-Bayt and the Companions.",
    read: "View book",
  },
  fa: {
    kicker: "کتابخانه خواندنی",
    title: "دانشی که مسیر خواننده را روشن می‌کند",
    lead: "مجموعه‌ای منتخب از کتاب‌ها و آثار درباره اهل‌بیت و اصحاب.",
    read: "مشاهده کتاب",
  },
};

export default function LibraryPage() {
  const { language } = useLanguage();
  const text = labels[language];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.kicker}><FiBookOpen aria-hidden />{text.kicker}</span>
        <h1>{text.title}</h1>
        <p>{text.lead}</p>
      </section>

      <section className={styles.libraryGrid} aria-label={text.kicker}>
        {libraryBooks.map((book) => (
          <Link className={styles.bookCard} href={`/library/${book.slug}`} key={book.slug}>
            <div className={styles.cover}>
              <Image src="/library-book-cover.png" alt={book.title[language]} fill sizes="(max-width: 700px) 74vw, 260px" />
            </div>
            <div className={styles.cardContent}>
              <h2>{book.title[language]}</h2>
              <p>{book.subtitle[language]}</p>
              <span>{text.read}<FiArrowLeft aria-hidden /></span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

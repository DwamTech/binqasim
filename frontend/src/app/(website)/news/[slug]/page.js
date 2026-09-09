"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { FiArrowLeft, FiCalendar, FiHome } from "react-icons/fi";
import styles from "./page.module.css";
import { newsItems } from "../newsData";
import { useLanguage } from "../../../../contexts/LanguageContext";

const translations = {
  ar: { home: "الرئيسية", news: "أخبار الجمعية", continue: "متابعة قراءة الخبر", back: "رجوع للأخبار", missing: "الخبر غير موجود", videoPlayer: "مشغل الفيديو", video: "فيديو" },
  en: { home: "Home", news: "Society news", continue: "Continue reading", back: "Back to news", missing: "News story not found", videoPlayer: "Video player", video: "Video" },
  fa: { home: "خانه", news: "اخبار بنیاد", continue: "ادامه خبر", back: "بازگشت به اخبار", missing: "خبر یافت نشد", videoPlayer: "پخش‌کننده ویدیو", video: "ویدیو" },
};

const renderBlock = (block, idx, language, text) => {
  if (block.type === "paragraph") {
    return (
      <p key={idx} className={styles.paragraph}>
        {block.value[language]}
      </p>
    );
  }

  if (block.type === "image") {
    return (
      <div key={idx} className={styles.imageBlock}>
        <Image
          src={block.src}
          alt={block.alt?.[language] || ""}
          fill
          sizes="(max-width: 600px) 100vw, 980px"
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  if (block.type === "embed") {
    if (!block.src) {
      return (
        <div key={idx} className={styles.embedWrap}>
          <div className={styles.videoPlaceholder}>{block.title?.[language] || text.videoPlayer}</div>
        </div>
      );
    }
    return (
      <div key={idx} className={styles.embedWrap}>
        <iframe
          className={styles.embed}
          src={block.src}
          title={block.title?.[language] || text.video}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return null;
};

export default function NewsDetailsPage({ params }) {
  const { slug } = use(params);
  const { language } = useLanguage();
  const text = translations[language];
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) return <main className={styles.page}><section className={styles.section}><h1>{text.missing}</h1><Link href="/news">{text.back}</Link></section></main>;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Image
          src={item.coverSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroPattern} aria-hidden />
        <div className={`${styles.container} ${styles.heroInner}`}>
          <nav className={styles.breadcrumbs} aria-label={text.news}>
            <Link href="/"><FiHome aria-hidden />{text.home}</Link>
            <span>/</span>
            <Link href="/news">{text.news}</Link>
            <span>/</span>
            <span aria-current="page">{item.title[language]}</span>
          </nav>

          <div className={styles.heroContent}>
            <div className={styles.heroMeta}>
              <span className={styles.heroChip}>{item.category[language]}</span>
              <span className={styles.heroDate}><FiCalendar aria-hidden />{item.date[language]}</span>
            </div>
            <h1 className={styles.heroTitle}>{item.title[language]}</h1>
            <p>{item.excerpt[language]}</p>
            <a href="#article-content" className={styles.continueLink}>
              {text.continue}
              <FiArrowLeft aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section} id="article-content">
        <div className={styles.container}>
          <article className={styles.content}>{item.blocks.map((block, index) => renderBlock(block, index, language, text))}</article>

          <div className={styles.backRow}>
            <Link className={styles.backLink} href="/news">
              {text.back}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

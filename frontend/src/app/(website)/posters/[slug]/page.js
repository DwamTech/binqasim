"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { FiDownload, FiHome, FiImage, FiShare2 } from "react-icons/fi";
import PosterActions from "../../../../components/PosterActions";
import { posters } from "../../../../data/posters";
import { useLanguage } from "../../../../contexts/LanguageContext";
import styles from "./page.module.css";

const translations = {
  ar: { home: "الرئيسية", posters: "المعلقات", eyebrow: "من مكتبة المعلقات", lead: "يمكنك مشاهدة المعلقة بحجم واضح، تحميلها على جهازك، أو مشاركتها مباشرة عبر منصات التواصل.", share: "شارك المعرفة", action: "حمّل المعلقة أو شاركها مع من تحب.", missing: "المعلقة غير موجودة" },
  en: { home: "Home", posters: "Posters", eyebrow: "From the poster library", lead: "View the poster clearly, download it to your device, or share it directly on social media.", share: "Share knowledge", action: "Download the poster or share it with others.", missing: "Poster not found" },
  fa: { home: "خانه", posters: "پوسترها", eyebrow: "از کتابخانه پوسترها", lead: "پوستر را در اندازه واضح ببینید، دریافت کنید یا مستقیماً در شبکه‌های اجتماعی به اشتراک بگذارید.", share: "دانش را به اشتراک بگذارید", action: "پوستر را دریافت کنید یا با دیگران به اشتراک بگذارید.", missing: "پوستر یافت نشد" },
};

export default function PosterDetailsPage({ params }) {
  const { slug } = use(params);
  const { language } = useLanguage();
  const text = translations[language];
  const poster = posters.find((item) => item.slug === slug);
  if (!poster) return <main className={styles.page}><section className={styles.content}><h1>{text.missing}</h1><Link href="/posters">{text.posters}</Link></section></main>;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.pattern} aria-hidden />
        <div className={styles.heroInner}>
          <nav aria-label={text.posters}><Link href="/"><FiHome aria-hidden />{text.home}</Link><span>/</span><Link href="/posters">{text.posters}</Link><span>/</span><span>{poster.title[language]}</span></nav>
          <span className={styles.eyebrow}><FiImage aria-hidden />{text.eyebrow}</span>
          <h1>{poster.title[language]}</h1>
          <p>{text.lead}</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={`${styles.posterFrame} ${styles[poster.orientation]}`}>
          <Image src={poster.image} alt={poster.title[language]} fill priority sizes="(max-width: 700px) 94vw, 1100px" />
        </div>
        <div className={styles.actionPanel}>
          <div className={styles.actionCopy}><span><FiShare2 aria-hidden />{text.share}</span><h2>{poster.title[language]}</h2><p><FiDownload aria-hidden />{text.action}</p></div>
          <PosterActions poster={poster} />
        </div>
      </section>
    </main>
  );
}

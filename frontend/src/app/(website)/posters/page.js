"use client";

import Image from "next/image";
import Link from "next/link";
import { FiHome, FiImage } from "react-icons/fi";
import { posters } from "../../../data/posters";
import PosterActions from "../../../components/PosterActions";
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from "./page.module.css";

const translations = {
  ar: { home: "الرئيسية", posters: "المعلقات", eyebrow: "رسائل بصرية", lead: "مجموعة مختارة من التصاميم التي تقدم الفكرة والكلمة في صياغة بصرية واضحة وملهمة.", library: "المكتبة البصرية", all: "كل المعلقات", designs: "تصاميم" },
  en: { home: "Home", posters: "Posters", eyebrow: "Visual messages", lead: "A curated collection of designs presenting ideas and words in a clear, inspiring visual form.", library: "Visual library", all: "All posters", designs: "designs" },
  fa: { home: "خانه", posters: "پوسترها", eyebrow: "پیام‌های تصویری", lead: "مجموعه‌ای منتخب از طرح‌هایی که اندیشه و کلام را در قالبی روشن و الهام‌بخش ارائه می‌کنند.", library: "کتابخانه تصویری", all: "همه پوسترها", designs: "طرح" },
};

export default function PostersPage() {
  const { language } = useLanguage();
  const text = translations[language];
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.pattern} aria-hidden />
        <div className={styles.heroInner}>
          <nav><Link href="/"><FiHome aria-hidden />{text.home}</Link><span>/</span><span>{text.posters}</span></nav>
          <span className={styles.eyebrow}><FiImage aria-hidden />{text.eyebrow}</span>
          <h1>{text.posters}</h1>
          <p>{text.lead}</p>
        </div>
      </section>

      <section className={styles.content}>
        <header><div><span>{text.library}</span><h2>{text.all}</h2></div><strong>{String(posters.length).padStart(2, "0")} <small>{text.designs}</small></strong></header>
        <div className={styles.grid}>
          {posters.map((poster, index) => (
            <article className={`${styles.card} ${styles[poster.orientation]}`} key={poster.id}>
              <Link className={styles.image} href={`/posters/${poster.slug}`}><Image src={poster.image} alt={poster.title[language]} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw" priority={index < 3} /><span>{String(index + 1).padStart(2, "0")}</span></Link>
              <div className={styles.cardContent}><Link href={`/posters/${poster.slug}`}><h2>{poster.title[language]}</h2></Link><PosterActions poster={poster} compact /></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

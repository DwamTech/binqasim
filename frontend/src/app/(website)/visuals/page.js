"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiPlayCircle } from "react-icons/fi";
import { useLanguage } from "../../../contexts/LanguageContext";
import { visualLibrary } from "../../../data/visualLibrary";
import styles from "./page.module.css";

const copy = {
  ar: { eyebrow: "المكتبة المرئية", title: "معرفة تُروى بالصوت والصورة", lead: "مواد مرئية مختارة تعرّف برسالة الجمعية وتقدم المعرفة بأسلوب واضح وقريب.", watch: "مشاهدة الفيديو" },
  en: { eyebrow: "Visual library", title: "Knowledge told through sound and image", lead: "Selected videos presenting the Society's message and knowledge clearly.", watch: "Watch video" },
  fa: { eyebrow: "کتابخانه تصویری", title: "دانش در قاب صدا و تصویر", lead: "محتوای تصویری برگزیده درباره رسالت بنیاد و دانش.", watch: "مشاهده ویدیو" },
};

export default function VisualsPage() {
  const { language } = useLanguage();
  const text = copy[language];
  return (
    <main className={styles.page}>
      <section className={styles.hero}><div className={styles.pattern} aria-hidden /><span><FiPlayCircle aria-hidden />{text.eyebrow}</span><h1>{text.title}</h1><p>{text.lead}</p></section>
      <section className={styles.grid}>
        {visualLibrary.map((item, index) => (
          <Link className={styles.card} href={`/visuals/${item.slug}`} key={item.slug}>
            <div className={styles.image}><Image src={item.image} alt={item.title[language]} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" priority={index < 3} /><span><FiPlayCircle aria-hidden /></span></div>
            <div><small>{String(index + 1).padStart(2, "0")}</small><h2>{item.title[language]}</h2><span>{text.watch}<FiArrowLeft aria-hidden /></span></div>
          </Link>
        ))}
      </section>
    </main>
  );
}

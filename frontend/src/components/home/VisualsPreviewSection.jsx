"use client";

import Link from "next/link";
import { FiArrowLeft, FiPlayCircle } from "react-icons/fi";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./VisualsPreviewSection.module.css";

const copy = {
  ar: { kicker: "المكتبة المرئية", title: "شاهد رسالة الجمعية عن قرب", text: "مواد مرئية توثق برامج الجمعية ومبادراتها وتعرّف برسالتها بصورة مباشرة.", action: "استكشف المرئيات", video: "فيديو تعريفي بالجمعية" },
  en: { kicker: "Visual library", title: "See our mission up close", text: "Visual stories documenting the Society’s programs, initiatives, and mission.", action: "Explore videos", video: "Introduction to the Society" },
  fa: { kicker: "کتابخانه تصویری", title: "رسالت ما را از نزدیک ببینید", text: "محتوای تصویری از برنامه‌ها و طرح‌های بنیاد.", action: "مشاهده ویدئوها", video: "معرفی بنیاد" },
};

export default function VisualsPreviewSection() {
  const { language } = useLanguage();
  const text = copy[language];
  return <section className={styles.section}><div className={styles.inner}><div className={styles.videoWrap}><video controls playsInline preload="metadata" poster="/aal-alashab-hero.webp" aria-label={text.video}><source src="/hero.mp4" type="video/mp4" /></video><span className={styles.playBadge}><FiPlayCircle aria-hidden />{text.video}</span></div><div className={styles.copy}><span>{text.kicker}</span><h2>{text.title}</h2><p>{text.text}</p><Link href="/visuals">{text.action}<FiArrowLeft aria-hidden /></Link></div></div></section>;
}

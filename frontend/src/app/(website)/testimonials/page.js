"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiHome, FiMessageCircle } from "react-icons/fi";
import { testimonials } from "../../../data/testimonials";
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from "./page.module.css";

const translations = {
  ar: { home: "الرئيسية", name: "قالوا عنا", eyebrow: "كلمات نعتز بها", first: "قالوا", second: "عنا", lead: "شهادات مضيئة تعكس أثر الجمعية ورسالتها، وتوثّق ما تصنعه مبادراتها من قيمة حقيقية في المجتمع.", count: "شهادات", countLead: "تحكي أثرنا", badge: "أثرٌ يستحق أن يُروى", all: "جميع الكلمات", title: "أثرٌ يُروى بالصورة والكلمة", hint: "اختر أي بطاقة لقراءة التفاصيل ومشاركة المحتوى." },
  en: { home: "Home", name: "Testimonials", eyebrow: "Words we value", first: "What they", second: "say about us", lead: "Inspiring testimonials reflecting the Society’s mission and the real value its initiatives create in the community.", count: "testimonials", countLead: "tell our story", badge: "An impact worth sharing", all: "All testimonials", title: "Impact told through image and word", hint: "Select any card to read the details and share it." },
  fa: { home: "خانه", name: "درباره ما گفته‌اند", eyebrow: "سخنانی ارزشمند", first: "درباره ما", second: "گفته‌اند", lead: "گواهی‌هایی الهام‌بخش که اثر و رسالت بنیاد و ارزش واقعی طرح‌های آن در جامعه را بازتاب می‌دهند.", count: "گواهی", countLead: "روایتگر اثر ما", badge: "اثری شایسته روایت", all: "همه دیدگاه‌ها", title: "روایت اثر با تصویر و کلام", hint: "برای خواندن جزئیات و اشتراک‌گذاری، یکی از کارت‌ها را انتخاب کنید." },
};

export default function TestimonialsPage() {
  const { language } = useLanguage();
  const text = translations[language];
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.pattern} aria-hidden />
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumbs} aria-label={text.name}><Link href="/"><FiHome aria-hidden />{text.home}</Link><span>/</span><span>{text.name}</span></nav>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><FiMessageCircle aria-hidden />{text.eyebrow}</span>
            <h1>{text.first} <span>{text.second}</span></h1>
            <p>{text.lead}</p>
            <div className={styles.heroMeta}><strong>{String(testimonials.length).padStart(2, "0")}</strong><span>{text.count}<br />{text.countLead}</span></div>
          </div>
          <div className={styles.heroVisual} aria-hidden>
            <div className={styles.visualMain}><Image src="/aal-alashab-hero.webp" alt="" fill priority sizes="(max-width: 760px) 88vw, 480px" /></div>
            <div className={styles.visualSmall}><Image src="/Bahrain beauty.jpg" alt="" fill sizes="220px" /></div>
            <span className={styles.visualBadge}><FiMessageCircle />{text.badge}</span>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <header className={styles.sectionHeader}>
          <div><span>{text.all}</span><h2>{text.title}</h2></div>
          <p>{text.hint}</p>
        </header>
        <div className={styles.grid}>
          {testimonials.map((item, index) => (
            <Link className={styles.card} href={`/testimonials/${item.slug}`} key={item.id}>
              <div className={styles.image}>
                <Image src={item.image} alt={item.title[language]} fill sizes="(max-width: 620px) 100vw, (max-width: 960px) 50vw, 33vw" priority={index < 3} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className={styles.cardBody}><i aria-hidden /><h2>{item.title[language]}</h2><FiArrowLeft aria-hidden /></div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

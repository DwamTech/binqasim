"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { FiArrowLeft, FiHome, FiMessageCircle } from "react-icons/fi";
import { testimonials } from "../../../../data/testimonials";
import TestimonialInteractions from "./TestimonialInteractions";
import { useLanguage } from "../../../../contexts/LanguageContext";
import styles from "./page.module.css";

const translations = {
  ar: { home: "الرئيسية", testimonials: "قالوا عنا", eyebrow: "كلمات نعتز بها", read: "اقرأ الموضوع", society: "جمعية الآل والأصحاب", note: "نعتز بهذه الكلمات التي تمنحنا دافعًا لمواصلة العمل، وتؤكد أهمية التعاون في بناء مبادرات أكثر قربًا من الناس وأكثر قدرة على صناعة أثر مستدام.", mayLike: "قد يهمك أيضًا", related: "مواضيع ذات صلة", missing: "الموضوع غير موجود" },
  en: { home: "Home", testimonials: "Testimonials", eyebrow: "Words we value", read: "Read article", society: "Aal & Al Ashab Society", note: "We value these words, which inspire us to continue our work and affirm the importance of collaboration in creating people-centered, sustainable initiatives.", mayLike: "You may also like", related: "Related topics", missing: "Topic not found" },
  fa: { home: "خانه", testimonials: "درباره ما گفته‌اند", eyebrow: "سخنانی ارزشمند", read: "خواندن مطلب", society: "بنیاد آل و اصحاب", note: "این سخنان برای ادامه مسیر به ما انگیزه می‌دهند و اهمیت همکاری در ساخت طرح‌هایی نزدیک‌تر به مردم و پایدارتر را یادآور می‌شوند.", mayLike: "شاید بپسندید", related: "مطالب مرتبط", missing: "مطلب یافت نشد" },
};

export default function TestimonialDetailsPage({ params }) {
  const { slug } = use(params);
  const { language } = useLanguage();
  const text = translations[language];
  const item = testimonials.find((entry) => entry.slug === slug);
  if (!item) return <main className={styles.page}><div className={styles.container}><h1>{text.missing}</h1><Link href="/testimonials">{text.testimonials}</Link></div></main>;
  const related = testimonials.filter((entry) => entry.slug !== slug).slice(0, 3);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image src={item.image} alt="" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <div className={styles.pattern} aria-hidden />
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumbs} aria-label={text.testimonials}><Link href="/"><FiHome aria-hidden />{text.home}</Link><span>/</span><Link href="/testimonials">{text.testimonials}</Link><span>/</span><span>{item.title[language]}</span></nav>
          <span className={styles.eyebrow}><FiMessageCircle aria-hidden />{text.eyebrow}</span>
          <h1>{item.title[language]}</h1>
          <a className={styles.continueLink} href="#testimonial-content">{text.read} <FiArrowLeft aria-hidden /></a>
        </div>
      </section>

      <div className={styles.container} id="testimonial-content">
        <article className={styles.article}>
          <div className={styles.featuredImage}><Image src={item.image} alt={item.title[language]} fill priority sizes="(max-width: 760px) 100vw, 1040px" /></div>
          <div className={styles.articleText}>
            <span>{text.society}</span>
            <p>{item.text[language]}</p>
            <p>{text.note}</p>
          </div>
        </article>

        <TestimonialInteractions title={item.title[language]} />

        <section className={styles.related}>
          <header><span>{text.mayLike}</span><h2>{text.related}</h2></header>
          <div className={styles.relatedGrid}>
            {related.map((entry) => (
              <Link href={`/testimonials/${entry.slug}`} className={styles.relatedCard} key={entry.id}>
                <div><Image src={entry.image} alt={entry.title[language]} fill sizes="(max-width: 600px) 100vw, 33vw" /></div>
                <h3>{entry.title[language]}</h3><span>{text.read} <FiArrowLeft aria-hidden /></span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

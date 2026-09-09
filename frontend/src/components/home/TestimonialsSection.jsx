"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiMessageCircle } from "react-icons/fi";
import { useLanguage } from "../../contexts/LanguageContext";
import { testimonials } from "../../data/testimonials";
import styles from "./TestimonialsSection.module.css";

const copy = {
  ar: {
    eyebrow: "كلمات نعتز بها",
    title: "قالوا عنا",
    lead: "شهادات مضيئة تعكس أثر الجمعية ورسالتها في المجتمع.",
    previous: "البطاقة السابقة",
    next: "البطاقة التالية",
    more: "عرض المزيد",
    image: "صورة شهادة عن الجمعية",
  },
  en: {
    eyebrow: "Words we value",
    title: "What they said about us",
    lead: "Meaningful testimonials reflecting the Society's impact and mission.",
    previous: "Previous card",
    next: "Next card",
    more: "View more",
    image: "Testimonial about the Society",
  },
  fa: {
    eyebrow: "سخنانی ارزشمند",
    title: "درباره ما گفته‌اند",
    lead: "دیدگاه‌هایی که بازتاب‌دهنده اثر و رسالت بنیاد در جامعه است.",
    previous: "کارت قبلی",
    next: "کارت بعدی",
    more: "مشاهده بیشتر",
    image: "دیدگاه درباره بنیاد",
  },
};

export default function TestimonialsSection() {
  const { language } = useLanguage();
  const text = copy[language];
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (index) => {
    const nextIndex = (index + testimonials.length) % testimonials.length;
    setActive(nextIndex);
    const track = trackRef.current;
    const card = track?.children[nextIndex];
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => goTo(active + 1), 5000);
    return () => window.clearInterval(timer);
  }, [active, paused]);

  return (
    <section className={styles.section} id="testimonials">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}><FiMessageCircle aria-hidden />{text.eyebrow}</span>
            <h2>{text.title}</h2>
            <p>{text.lead}</p>
          </div>
          <div className={styles.headerActions}>
            <Link className={styles.more} href="/testimonials">{text.more}<FiArrowLeft aria-hidden /></Link>
            <div className={styles.controls}>
              <button type="button" onClick={() => goTo(active - 1)} aria-label={text.previous}><FiArrowRight aria-hidden /></button>
              <button type="button" onClick={() => goTo(active + 1)} aria-label={text.next}><FiArrowLeft aria-hidden /></button>
            </div>
          </div>
        </header>

        <div
          className={styles.track}
          dir="ltr"
          ref={trackRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {testimonials.map((slide, index) => (
            <Link className={styles.card} href={`/testimonials/${slide.slug}`} key={slide.id}>
              <div className={styles.image}>
                <Image src={slide.image} alt={`${text.image} ${index + 1}`} fill sizes="(max-width: 640px) 82vw, (max-width: 960px) 44vw, 360px" />
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className={styles.cardBody} dir={language === "en" ? "ltr" : "rtl"}>
                <span aria-hidden />
                <h3>{slide.title[language]}</h3>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.pagination} dir="ltr">
          {testimonials.map((slide, index) => (
            <button className={index === active ? styles.current : ""} type="button" onClick={() => goTo(index)} aria-label={`${text.image} ${index + 1}`} key={slide.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

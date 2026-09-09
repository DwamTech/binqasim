"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiMaximize2, FiX } from "react-icons/fi";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./ProjectsSection.module.css";

const slides = [
  { id: 1, src: "/aal-alashab-hero.webp", position: "center" },
  { id: 2, src: "/flag-of-bahrain-rounded-corners.png", position: "center" },
  { id: 3, src: "/Bahrain beauty.jpg", position: "center" },
  { id: 4, src: "/Bahrain.jpg", position: "center" },
];

const copy = {
  ar: { eyebrow: "صور من الأثر", title: "مشاريع الجمعية", previous: "الصورة السابقة", next: "الصورة التالية", image: "صورة من مشاريع الجمعية", view: "عرض الصورة", close: "إغلاق الصورة" },
  en: { eyebrow: "Impact in pictures", title: "Society Projects", previous: "Previous image", next: "Next image", image: "A Society project", view: "View image", close: "Close image" },
  fa: { eyebrow: "تصاویر فعالیت‌ها", title: "طرح‌های بنیاد", previous: "تصویر قبلی", next: "تصویر بعدی", image: "تصویری از طرح‌های بنیاد", view: "نمایش تصویر", close: "بستن تصویر" },
};

export default function ProjectsSection() {
  const { language } = useLanguage();
  const text = copy[language];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    if (selected === null) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  const move = (step) => {
    setActive((current) => (current + step + slides.length) % slides.length);
  };

  const getPosition = (index) => {
    const offset = (index - active + slides.length) % slides.length;
    if (offset === 0) return styles.active;
    if (offset === 1) return styles.next;
    if (offset === slides.length - 1) return styles.previous;
    return styles.hidden;
  };

  return (
    <>
    <section className={styles.section} id="projects">
      <div className={styles.heading}>
        <div><span>{text.eyebrow}</span><h2>{text.title}</h2></div>
        <div className={styles.count}><strong>{String(active + 1).padStart(2, "0")}</strong><span>/</span><small>{String(slides.length).padStart(2, "0")}</small></div>
      </div>

      <div
        className={styles.slider}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className={styles.glow} aria-hidden />
        {slides.map((slide, index) => (
          <button type="button" className={`${styles.slide} ${getPosition(index)}`} aria-hidden={index !== active} tabIndex={index === active ? 0 : -1} onClick={() => setSelected(index)} aria-label={`${text.view} ${index + 1}`} key={slide.id}>
            <Image
              src={slide.src}
              alt={index === active ? `${text.image} ${index + 1}` : ""}
              fill
              sizes="(max-width: 760px) 86vw, 70vw"
              priority={index === 0}
              style={{ objectPosition: slide.position }}
            />
            <span className={styles.imageShade} />
            <span className={styles.zoomHint}><FiMaximize2 aria-hidden />{text.view}</span>
          </button>
        ))}

        <div className={styles.controls}>
          <button type="button" onClick={() => move(-1)} aria-label={text.previous}><FiArrowRight aria-hidden /></button>
          <div className={styles.progress}><span key={active} /></div>
          <button type="button" onClick={() => move(1)} aria-label={text.next}><FiArrowLeft aria-hidden /></button>
        </div>
      </div>
    </section>
    {selected !== null && (
      <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`${text.image} ${selected + 1}`} onMouseDown={() => setSelected(null)}>
        <button className={styles.close} type="button" onClick={() => setSelected(null)} aria-label={text.close}><FiX aria-hidden /></button>
        <div className={styles.lightboxImage} onMouseDown={(event) => event.stopPropagation()}>
          <Image src={slides[selected].src} alt={`${text.image} ${selected + 1}`} fill sizes="94vw" priority style={{ objectPosition: slides[selected].position }} />
        </div>
        <span className={styles.lightboxCount}>{String(selected + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
      </div>
    )}
    </>
  );
}

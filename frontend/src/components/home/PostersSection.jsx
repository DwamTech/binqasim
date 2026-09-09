"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiImage } from "react-icons/fi";
import { useLanguage } from "../../contexts/LanguageContext";
import { posters } from "../../data/posters";
import styles from "./PostersSection.module.css";

const copy = {
  ar: { eyebrow: "رسائل بصرية", title: "المعلقات", lead: "مختارات بصرية تجمع الفكرة والكلمة في تصميم واحد.", more: "عرض المزيد", previous: "المجموعة السابقة", next: "المجموعة التالية", page: "صفحة" },
  en: { eyebrow: "Visual messages", title: "Posters", lead: "A visual selection bringing ideas and words together in one design.", more: "View more", previous: "Previous group", next: "Next group", page: "Page" },
  fa: { eyebrow: "پیام‌های تصویری", title: "پوسترها", lead: "گزیده‌ای تصویری که اندیشه و کلام را در یک طرح گرد هم می‌آورد.", more: "مشاهده بیشتر", previous: "گروه قبلی", next: "گروه بعدی", page: "صفحه" },
};

const getItemsPerPage = () => {
  if (window.matchMedia("(max-width: 520px)").matches) return 1;
  if (window.matchMedia("(max-width: 900px)").matches) return 2;
  return 3;
};

export default function PostersSection() {
  const { language } = useLanguage();
  const text = copy[language];
  const viewportRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [paused, setPaused] = useState(false);

  const pages = useMemo(() => {
    const groups = [];
    for (let index = 0; index < posters.length; index += itemsPerPage) groups.push(posters.slice(index, index + itemsPerPage));
    return groups;
  }, [itemsPerPage]);

  const scrollToPage = useCallback((pageIndex, behavior = "smooth") => {
    const viewport = viewportRef.current;
    const page = viewport?.firstElementChild?.children[pageIndex];
    if (!viewport || !page) return;
    const viewportRect = viewport.getBoundingClientRect();
    const pageRect = page.getBoundingClientRect();
    viewport.scrollBy({ left: pageRect.right - viewportRect.right, top: 0, behavior });
  }, []);

  const goToPage = (pageIndex) => {
    const nextPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
    scrollToPage(nextPage);
    setActivePage(nextPage);
  };

  useEffect(() => {
    const updateLayout = () => {
      const nextItemsPerPage = getItemsPerPage();
      setItemsPerPage(nextItemsPerPage);
      setActivePage(0);
      viewportRef.current?.scrollTo({ left: 0, top: 0, behavior: "auto" });
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const pageElements = Array.from(viewport.children[0]?.children || []);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.intersectionRatio >= 0.55) setActivePage(pageElements.indexOf(visible.target));
    }, { root: viewport, threshold: [0.55, 0.8] });
    pageElements.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [pages.length]);

  useEffect(() => {
    if (paused || pages.length <= 1) return undefined;
    const timer = window.setInterval(() => setActivePage((current) => {
      const next = current === pages.length - 1 ? 0 : current + 1;
      scrollToPage(next);
      return next;
    }), 5000);
    return () => window.clearInterval(timer);
  }, [paused, pages.length, scrollToPage]);

  return (
    <section className={styles.section} id="posters">
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <header className={styles.header}>
          <div><span><FiImage aria-hidden />{text.eyebrow}</span><h2>{text.title}</h2><p>{text.lead}</p></div>
          <div className={styles.headerActions}>
            <Link href="/posters">{text.more}<FiArrowLeft aria-hidden /></Link>
            <div className={styles.controls}>
              <button type="button" disabled={activePage === 0} onClick={() => goToPage(activePage - 1)} aria-label={text.previous}><FiArrowRight aria-hidden /></button>
              <button type="button" disabled={activePage === pages.length - 1} onClick={() => goToPage(activePage + 1)} aria-label={text.next}><FiArrowLeft aria-hidden /></button>
            </div>
          </div>
        </header>

        <div className={styles.viewport} dir="rtl" ref={viewportRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <div className={styles.track}>
            {pages.map((pagePosters, pageIndex) => (
              <div className={styles.slidePage} style={{ "--items": itemsPerPage }} key={`${itemsPerPage}-${pageIndex}`}>
                {pagePosters.map((poster) => (
                  <article className={`${styles.card} ${styles[poster.orientation]}`} key={poster.id}>
                    <div className={styles.image}><Image src={poster.image} alt={poster.title[language]} fill sizes="(max-width: 520px) 90vw, (max-width: 900px) 45vw, 370px" /><span>{String(poster.id).padStart(2, "0")}</span></div>
                    <h3 dir={language === "en" ? "ltr" : "rtl"}>{poster.title[language]}</h3>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageCount}>{text.page} {String(activePage + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
          <div className={styles.progress}><span style={{ width: `${((activePage + 1) / pages.length) * 100}%` }} /></div>
        </div>
      </div>
    </section>
  );
}

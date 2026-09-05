"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import WaqfIntroSection from "../../components/WaqfIntroSection";
import {
  FiLink,
  FiFileText,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";
import { FaHandshake, FaBuilding } from "react-icons/fa";
import { useRef, useEffect } from "react";

export default function Home() {
  const newsRef = useRef(null);
  const newsItems = [
    {
      src: "/home-slider/WhatsApp-Image-2023-11-18-at-11.28.01-750x563.jpeg",
      title: "لقاء تطوير المبادرات والبرامج الوقفية",
      id: 1,
      href: "/news",
    },
    {
      src: "/home-slider/WhatsApp-Image-2023-11-18-at-11.28.02-1-750x563.jpeg",
      title: "اجتماع فريق العمل وبحث سبل تنمية الأثر",
      id: 2,
      href: "/news",
    },
    {
      src: "/home-slider/WhatsApp-Image-2023-11-18-at-11.28.02-2-750x563.jpeg",
      title: "برنامج سمو لتطوير العمل المؤسسي",
      id: 3,
      href: "/news",
    },
    {
      src: "/home-slider/WhatsApp-Image-2023-11-18-at-11.28.02-350x250.jpeg",
      title: "جانب من ورشة العمل وتبادل الخبرات",
      id: 4,
      href: "/news",
    },
  ];
  const newsLoopItems = [...newsItems, ...newsItems];

  const scroll = (ref, dir, loopLength) => {
    const el = ref.current;
    if (!el) return;
    const track = el.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).gap || "0");
    const card = el.querySelector(`.${styles.sliderItem}`);
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.9;

    if (loopLength) {
      const span = step * loopLength;
      if (dir > 0 && el.scrollLeft >= span - step) {
        el.scrollTo({ left: el.scrollLeft - span, behavior: "auto" });
      }
      if (dir < 0 && el.scrollLeft <= 0) {
        el.scrollTo({ left: el.scrollLeft + span, behavior: "auto" });
      }
    }

    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    const el = newsRef.current;
    if (!el) return;
    const track = el.firstElementChild;
    const getStep = () => {
      const gap = parseFloat(getComputedStyle(track).gap || "0");
      const card = el.querySelector(`.${styles.sliderItem}`);
      return card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.9;
    };
    const tick = () => {
      const step = getStep();
      const span = step * newsItems.length;
      if (el.scrollLeft >= span - step) {
        el.scrollTo({ left: el.scrollLeft - span, behavior: "auto" });
      }
      el.scrollBy({ left: step, behavior: "smooth" });
    };
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [newsItems.length]);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/hero.m4v" type="video/mp4" />
        </video>
      </section>

      <WaqfIntroSection />
      <section className={styles.applySection}>
        <Image
          src="/75884be2-3e9d-4126-ace3-770ef0c2f071_16x9_1200x676.webp"
          alt="خلفية للتقديم على طلبات الدعم"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className={styles.applyInner}>
          <h2 className={styles.applyTitle}>للتقديم على طلبات الدعم</h2>
          <a className={styles.applyButton} href="#">
            اضغط هنا <FiLink size={18} />
          </a>
        </div>
      </section>
      {/* <section className={styles.fullImageSection}>
        <Image
          src="/صورة-واتساب-بتاريخ-2024-04-27-في-20.19.12_12ce8470-1024x576.jpg"
          alt="صورة كاملة"
          width={1024}
          height={576}
          className={styles.fullImage}
        />
      </section> */}
      <section id="news" className={styles.sliderNews}>
        <div className={styles.sliderInner}>
          <h2 className={styles.sliderTitleLight}>أخبار الوقف</h2>
          <div className={styles.sliderStage}>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnPrevious}`}
              onClick={() => scroll(newsRef, -1, newsItems.length)}
              aria-label="السابق"
            >
              <FiChevronRight size={22} />
            </button>
            <div className={styles.sliderViewport} ref={newsRef}>
              <div className={styles.sliderTrack}>
                {newsLoopItems.map((item, idx) => (
                  <Link
                    className={styles.sliderItem}
                    key={`news-${idx}`}
                    href={item.href}
                    aria-label={item.title}
                  >
                    <div className={styles.sliderImageWrap}>
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={350}
                        height={250}
                        className={styles.sliderImage}
                        priority={idx < 2}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnNext}`}
              onClick={() => scroll(newsRef, 1, newsItems.length)}
              aria-label="التالي"
            >
              <FiChevronLeft size={22} />
            </button>
          </div>
          <div className={styles.sliderCta}>
            <Link className={styles.readMoreSingle} href="/news">
              اقرأ المزيد
            </Link>
          </div>
        </div>
      </section>
        {/* <section className={styles.heroAlt}>
        <Image
          src="/باب_وكسوة_الكعبة.jpg"
          alt="خلفية زخارف الكعبة"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className={styles.heroAltInner}>
          <div className={styles.heroCardWrap}>
            <div className={styles.heroCardInner}>
              <Image
                src="/WhatsApp-Image-2023-02-22-at-8.10.55-PM.jpeg"
                alt="المصارف الشرعية"
                fill
                sizes="100vw"
                className={styles.heroCardImage}
                priority
              />
            </div>
          </div>
        </div>
      </section> */}
      
      <section id="policies" className={styles.sliderPolicies}>
        <div className={styles.sliderInner}>
          <h2 className={styles.sliderTitleDark}>اللوائح والسياسات</h2>
          <a
            className={styles.policyFeaturedCard}
            href="https://binqasim.sa/books/%d8%aa%d9%82%d8%b1%d9%8a%d8%b1-%d8%a7%d8%b6%d8%a7%d8%ad%d9%8a/"
          >
            <div className={styles.policyImageWrap}>
              <Image
                src="/aladha.jpg"
                alt="تقرير أضاحي"
                width={350}
                height={250}
                className={styles.policyImage}
              />
            </div>
            <div className={styles.policyContent}>
              <span className={styles.policyBadge}>تقرير</span>
              <h3>تقرير أضاحي</h3>
              <div className={styles.policyDate}>
                <FiCalendar aria-hidden />
                <time dateTime="2025-01-17">17 يناير، 2025</time>
              </div>
              <span className={styles.policyLink}>عرض التقرير <FiChevronLeft aria-hidden /></span>
            </div>
          </a>
        </div>
      </section>
      <section className={styles.statsSection}>
        <Image
          src="/75884be2-3e9d-4126-ace3-770ef0c2f071_16x9_1200x676.webp"
          alt="خلفية احصائيات الوقف"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className={styles.statsInner}>
          <h2 className={styles.statsTitle}>احصائيات الوقف</h2>
          <div className={styles.statsCards}>
            <div className={styles.statsCard}>
              <span className={styles.statIcon}><FaHandshake size={36} /></span>
              <div className={styles.statNumber}>16</div>
              <div className={styles.statLabel}>شراكات</div>
            </div>
            <div className={styles.statsCard}>
              <span className={styles.statIcon}><FiFileText size={36} /></span>
              <div className={styles.statNumber}>65</div>
              <div className={styles.statLabel}>إصدارات</div>
            </div>
            <div className={styles.statsCard}>
              <span className={styles.statIcon}><FaBuilding size={36} /></span>
              <div className={styles.statNumber}>13</div>
              <div className={styles.statLabel}>مؤسسات</div>
            </div>
            <div className={styles.statsCard}>
              <span className={styles.statIcon}><FiUsers size={36} /></span>
              <div className={styles.statNumber}>221</div>
              <div className={styles.statLabel}>أفراد</div>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.mapSection}>
        <div className={styles.mapInner}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3628.74484448444!2d39.8262364!3d21.4225108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3d0e40f000001%3A0x4e4587e44f4139e!2sAl%20Haram%2C%20Makkah%2024231%2C%20Saudi%20Arabia!5e0!3m2!1sar!2ssa!4v1700000000000!5m2!1sar!2ssa"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </main>
  );
}

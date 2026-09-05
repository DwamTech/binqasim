"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { FiLink, FiFileText, FiUsers, FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { FaHandshake, FaBuilding } from "react-icons/fa";
import { useRef, useEffect } from "react";

export default function Home() {
  const newsRef = useRef(null);
  const policiesRef = useRef(null);
  const newsItems = [
    {
      src: "/WhatsApp-Image-2023-04-12-at-16.36.28-350x250.jpeg",
      title: "اتفاقية شراكة وتعاون بين وقف الصالح وجمعية قيم",
      id: 1,
      slug: "sharika-waqf-alsaleh-qeem",
    },
    {
      src: "/WhatsApp-Image-2023-04-12-at-16.36.28-1-350x250.jpeg",
      title: "توزيع 200 سلة غذائية في وقف الصالح",
      id: 2,
      slug: "tawzee-salat-ghithaeia",
    },
    {
      src: "/WhatsApp-Image-2023-03-28-at-17.39.19-350x250.jpeg",
      title: "مشروع إفطار 100 صائم يومياً بمكة",
      id: 3,
      slug: "iftar-100-saem-makkah",
    },
    {
      src: "/صورة-واتساب-بتاريخ-2024-04-27-في-20.19.12_12ce8470-1024x576.jpg",
      title: "فعالية خيرية بدعم الوقف",
      id: 4,
      slug: "faalia-khairia",
    },
  ];
  const policiesItems = [
    {
      src: "/card-a-1.jpg",
      title: "لائحة إدارة المخاطر وقف الصالح الخيري",
      date: "12 إبريل 2023",
    },
    {
      src: "/card-a-1.jpg",
      title: "لائحة المستنفر - وقف الصالح",
      date: "12 إبريل 2023",
    },
    {
      src: "/card-a-1.jpg",
      title: "لائحة تنظيم أعمال التجارة وقف الصالح الخيري",
      date: "12 إبريل 2023",
    },
  ];

  const newsLoopItems = [...newsItems, ...newsItems];
  const policiesLoopItems = [...policiesItems, ...policiesItems];

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

  useEffect(() => {
    const el = policiesRef.current;
    if (!el) return;
    const track = el.firstElementChild;
    const getStep = () => {
      const gap = parseFloat(getComputedStyle(track).gap || "0");
      const card = el.querySelector(`.${styles.sliderItem}`);
      return card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.9;
    };
    const tick = () => {
      const step = getStep();
      const span = step * policiesItems.length;
      if (el.scrollLeft >= span - step) {
        el.scrollTo({ left: el.scrollLeft - span, behavior: "auto" });
      }
      el.scrollBy({ left: step, behavior: "smooth" });
    };
    const id = setInterval(tick, 6000);
    return () => clearInterval(id);
  }, [policiesItems.length]);
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <Image
          src="/ffdsfdf.webp"
          alt="باب وكسوة الكعبة"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "bottom 90%" }}
        />
      </section>
      
      
      <section className={styles.about}>
        <div className={styles.aboutInner}>
          <div className={styles.aboutText}>
            <h2 className={styles.aboutTitle}>وقف الصالح</h2>
            <p className={styles.aboutPara}>
              وقف خيري مخصص لرعاية طلاب العلم ومساندتهم في سبيل تحصيلهم للعلم والقيام بواجب الدعوة إلى الله تعالى على منهج أهل السنة والجماعة.
            </p>
            <p className={styles.aboutPara}>
              كما أنه يستهدف أبواب البر والخير عموما في حال وجود فائض او حاجة طارئة تتطلب الانتقال الى المصارف الأخرى قبل طلاب العلم
            </p>
          </div>
          <div className={styles.aboutImageWrap}>
            <Image
              src="/Untitled-1-removebg-preview-350x350.png"
              alt="شعار الوقف الصالح"
              width={350}
              height={350}
              className={styles.aboutImage}
              priority
            />
          </div>
        </div>
      </section>
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
      <section className={styles.fullImageSection}>
        <Image
          src="/صورة-واتساب-بتاريخ-2024-04-27-في-20.19.12_12ce8470-1024x576.jpg"
          alt="صورة كاملة"
          width={1024}
          height={576}
          className={styles.fullImage}
        />
      </section>
      <section id="news" className={styles.sliderNews}>
        <div className={styles.sliderInner}>
          <h2 className={styles.sliderTitleLight}>أخبار الوقف</h2>
          <div className={styles.sliderViewport} ref={newsRef}>
            <div className={styles.sliderTrack}>
              {newsLoopItems.map((item, idx) => (
                <Link className={styles.sliderItem} key={`news-${idx}`} href={`/news/${item.slug || newsItems[idx % newsItems.length].slug}`}>
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
                  <div className={styles.sliderItemTitle}>{item.title}</div>
                </Link>
              ))}
            </div>
          </div>
          <div className={styles.sliderNav}>
            <button type="button" className={styles.navBtn} onClick={() => scroll(newsRef, -1, newsItems.length)} aria-label="السابق">
              <FiChevronLeft size={20} />
            </button>
            <button type="button" className={styles.navBtn} onClick={() => scroll(newsRef, 1, newsItems.length)} aria-label="التالي">
              <FiChevronRight size={20} />
            </button>
          </div>
          <div className={styles.sliderCta}>
            <Link className={styles.readMoreSingle} href="/news">
              اقرأ المزيد
            </Link>
          </div>
        </div>
      </section>
        <section className={styles.heroAlt}>
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
      </section>
      
      <section id="policies" className={styles.sliderPolicies}>
        <div className={styles.sliderInner}>
          <h2 className={styles.sliderTitleDark}>اللوائح والسياسات</h2>
          <div className={styles.sliderViewport} ref={policiesRef}>
            <div className={styles.sliderTrack}>
              {policiesLoopItems.map((item, idx) => (
                <div className={styles.sliderItem} key={`policy-${idx}`}>
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
                  <div className={styles.sliderItemTitle}>{item.title}</div>
                  <div className={styles.sliderMeta}>
                    <FiCalendar size={16} />
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.sliderNav}>
            <button type="button" className={styles.navBtn} onClick={() => scroll(policiesRef, -1, policiesItems.length)} aria-label="السابق">
              <FiChevronLeft size={20} />
            </button>
            <button type="button" className={styles.navBtn} onClick={() => scroll(policiesRef, 1, policiesItems.length)} aria-label="التالي">
              <FiChevronRight size={20} />
            </button>
          </div>
          {/* <div className={styles.sliderCta}>
            <Link className={styles.readMoreSingle} href="/news">
              اقرأ المزيد
            </Link>
          </div> */}
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

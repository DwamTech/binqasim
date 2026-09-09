"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiCalendar, FiCamera, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./page.module.css";
import { newsItems } from "./newsData";
import { useLanguage } from "../../../contexts/LanguageContext";

const translations = {
  ar: { media: "المركز الإعلامي", news: "أخبار", society: "الجمعية", lead: "نافذة توثق مبادرات الجمعية واجتماعاتها وبرامجها، وتروي أثر العمل الذي نصنعه مع شركائنا في المجتمع.", documented: "أخبار موثقة بالصور", latest: "جديد الجمعية", title: "آخر الأخبار", sectionLead: "تابع أخبار الجمعية ومبادراتها وشراكاتها المجتمعية.", count: "أخبار", read: "قراءة الخبر", image: "جمعية الآل والأصحاب" },
  en: { media: "Media center", news: "Society", society: "news", lead: "A window documenting the Society’s initiatives, meetings, programs, and the impact created with community partners.", documented: "stories documented in images", latest: "From the Society", title: "Latest news", sectionLead: "Follow the Society’s news, initiatives, and community partnerships.", count: "stories", read: "Read story", image: "Aal & Al Ashab Society" },
  fa: { media: "مرکز رسانه", news: "اخبار", society: "بنیاد", lead: "پنجره‌ای برای روایت طرح‌ها، جلسات، برنامه‌ها و اثری که همراه شرکای اجتماعی می‌سازیم.", documented: "خبر تصویری", latest: "تازه‌های بنیاد", title: "آخرین اخبار", sectionLead: "اخبار، طرح‌ها و همکاری‌های اجتماعی بنیاد را دنبال کنید.", count: "خبر", read: "خواندن خبر", image: "بنیاد آل و اصحاب" },
};

const PAGE_SIZE = 15;

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "end-gap", totalPages];
  if (currentPage >= totalPages - 3) return [1, "start-gap", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "start-gap", currentPage - 1, currentPage, currentPage + 1, "end-gap", totalPages];
}

export default function NewsPage() {
  const { language } = useLanguage();
  const text = translations[language];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(newsItems.length / PAGE_SIZE);
  const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;
  const firstItemIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleNews = newsItems.slice(firstItemIndex, firstItemIndex + PAGE_SIZE);
  const paginationItems = getPaginationItems(currentPage, totalPages);

  const changePage = (nextPage) => {
    if (nextPage === currentPage || nextPage < 1 || nextPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage === 1) params.delete("page");
    else params.set("page", String(nextPage));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    window.requestAnimationFrame(() => {
      const section = document.getElementById("news-results");
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden />
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}><FiCamera aria-hidden />{text.media}</span>
            <h1>{text.news} <span>{text.society}</span></h1>
            <p>{text.lead}</p>
            <div className={styles.heroStats}>
              <strong>{String(newsItems.length).padStart(2, "0")}</strong>
              <span>{text.documented}</span>
            </div>
          </div>

          <div className={styles.heroFeature}>
            <Image
              src="/aal-alashab-hero.webp"
              alt={text.image}
              fill
              priority
              sizes="(max-width: 700px) 92vw, 520px"
            />
          </div>
        </div>
      </section>

      <section className={styles.section} id="news-results">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <div>
              <span>{text.latest}</span>
              <h2>{text.title}</h2>
              <p>{text.sectionLead}</p>
            </div>
            <span className={styles.count}>{String(newsItems.length).padStart(2, "0")} {text.count}</span>
          </header>

          <div className={styles.grid}>
            {visibleNews.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className={styles.card}
                aria-label={item.title[language]}
              >
                <Image
                  src={item.coverSrc}
                  alt={item.title[language]}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 992px) 50vw, 25vw"
                  className={styles.cardImage}
                  priority={idx < 2}
                />
                <div className={styles.overlay} />
                <span className={styles.chip}>{item.category[language]}</span>
                <div className={styles.cardMeta}>
                  <span className={styles.date}><FiCalendar aria-hidden />{item.date[language]}</span>
                  <h3 className={styles.title}>{item.title[language]}</h3>
                  <span className={styles.readMore}>{text.read} <FiArrowLeft aria-hidden /></span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className={styles.paginationWrap} aria-label="صفحات الأخبار">
              <p>عرض <strong>{(firstItemIndex + 1).toLocaleString("ar-EG")}</strong>–<strong>{Math.min(firstItemIndex + PAGE_SIZE, newsItems.length).toLocaleString("ar-EG")}</strong> من <strong>{newsItems.length.toLocaleString("ar-EG")}</strong> خبرًا</p>
              <div className={styles.pagination}>
                <button type="button" className={styles.navButton} onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} aria-label="الصفحة السابقة"><FiChevronRight aria-hidden /><span>السابق</span></button>
                <div className={styles.pageNumbers}>
                  {paginationItems.map((page) => typeof page === "number" ? (
                    <button type="button" key={page} className={page === currentPage ? styles.currentPage : ""} onClick={() => changePage(page)} aria-label={`الصفحة ${page}`} aria-current={page === currentPage ? "page" : undefined}>{page.toLocaleString("ar-EG")}</button>
                  ) : <span className={styles.ellipsis} key={page} aria-hidden>•••</span>)}
                </div>
                <button type="button" className={styles.navButton} onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="الصفحة التالية"><span>التالي</span><FiChevronLeft aria-hidden /></button>
              </div>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}

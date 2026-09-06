import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiCalendar, FiHome } from "react-icons/fi";
import styles from "./page.module.css";
import { newsItems } from "../newsData";

export const dynamicParams = true;

export function generateStaticParams() {
  return newsItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) return { title: "خبر غير موجود | وقف عبد الله بن قاسم" };
  return { title: `${item.title} | وقف عبد الله بن قاسم` };
}

const renderBlock = (block, idx) => {
  if (block.type === "paragraph") {
    return (
      <p key={idx} className={styles.paragraph}>
        {block.value}
      </p>
    );
  }

  if (block.type === "image") {
    return (
      <div key={idx} className={styles.imageBlock}>
        <Image
          src={block.src}
          alt={block.alt || ""}
          fill
          sizes="(max-width: 600px) 100vw, 980px"
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  if (block.type === "embed") {
    if (!block.src) {
      return (
        <div key={idx} className={styles.embedWrap}>
          <div className={styles.videoPlaceholder}>{block.title || "مشغل الفيديو"}</div>
        </div>
      );
    }
    return (
      <div key={idx} className={styles.embedWrap}>
        <iframe
          className={styles.embed}
          src={block.src}
          title={block.title || "فيديو"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return null;
};

export default async function NewsDetailsPage({ params }) {
  const { slug } = await params;
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) notFound();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Image
          src={item.coverSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroPattern} aria-hidden />
        <div className={`${styles.container} ${styles.heroInner}`}>
          <nav className={styles.breadcrumbs} aria-label="مسار التنقل">
            <Link href="/"><FiHome aria-hidden />الرئيسية</Link>
            <span>/</span>
            <Link href="/news">أخبار الوقف</Link>
            <span>/</span>
            <span aria-current="page">{item.title}</span>
          </nav>

          <div className={styles.heroContent}>
            <div className={styles.heroMeta}>
              <span className={styles.heroChip}>{item.category}</span>
              <span className={styles.heroDate}><FiCalendar aria-hidden />{item.date}</span>
            </div>
            <h1 className={styles.heroTitle}>{item.title}</h1>
            <p>{item.excerpt}</p>
            <a href="#article-content" className={styles.continueLink}>
              متابعة قراءة الخبر
              <FiArrowLeft aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section} id="article-content">
        <div className={styles.container}>
          <article className={styles.content}>{item.blocks.map(renderBlock)}</article>

          <div className={styles.backRow}>
            <Link className={styles.backLink} href="/news">
              رجوع للأخبار
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

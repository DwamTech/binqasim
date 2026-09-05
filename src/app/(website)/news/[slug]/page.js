import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { newsItems } from "../newsData";

export const dynamicParams = true;

export function generateStaticParams() {
  return newsItems.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }) {
  const item = newsItems.find((n) => n.slug === params.slug);
  if (!item) return { title: "خبر غير موجود | وقف الصالح الخيري" };
  return { title: `${item.title} | وقف الصالح الخيري` };
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

export default function NewsDetailsPage({ params }) {
  const item = newsItems.find((n) => n.slug === params.slug);
  if (!item) notFound();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Image
          src="/باب_وكسوة_الكعبة.jpg"
          alt="باب وكسوة الكعبة"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{item.title}</h1>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.articleHeader}>
            <div className={styles.metaRow}>
              <span className={styles.date}>{item.date}</span>
              <span className={styles.chip}>{item.category}</span>
            </div>
            <h2 className={styles.title}>{item.title}</h2>
          </header>

          <div className={styles.cover}>
            <Image
              src={item.coverSrc}
              alt={item.title}
              fill
              priority
              sizes="(max-width: 600px) 100vw, 980px"
              className={styles.coverImage}
            />
          </div>

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

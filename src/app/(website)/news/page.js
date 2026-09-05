import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { newsItems } from "./newsData";
import HeroSection from "../../../components/HeroSection";

export const metadata = {
  title: "أخبار الوقف | وقف الصالح الخيري",
};

const areaClassByIndex = (idx) => {
  if (idx === 0) return styles.a;
  if (idx === 1) return styles.b;
  if (idx === 2) return styles.c;
  return styles.d;
};

export default function NewsPage() {
  const items = newsItems.slice(0, 4);

  return (
    <div className={styles.page}>
      <HeroSection
        title="أخبار الـوقــف"
        imageSrc="/باب_وكسوة_الكعبة.jpg"
        imageAlt="باب وكسوة الكعبة"
        align="center"
      />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {items.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className={`${styles.card} ${areaClassByIndex(idx)}`}
                aria-label={item.title}
              >
                <Image
                  src={item.coverSrc}
                  alt={item.title}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 992px) 50vw, 25vw"
                  className={styles.cardImage}
                  priority={idx < 2}
                />
                <div className={styles.cardMeta}>
                  <span className={styles.chip}>{item.category}</span>
                  <div className={styles.title}>{item.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

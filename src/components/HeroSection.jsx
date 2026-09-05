import Image from "next/image";
import styles from "./HeroSection.module.css";

export default function HeroSection({ title, imageSrc, imageAlt, align = "end" }) {
  return (
    <section className={styles.hero}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
      <div
        className={styles.heroInner}
        style={{
          justifyContent:
            align === "start" ? "flex-start" : align === "center" ? "center" : "flex-end",
        }}
      >
        <h1 className={styles.heroTitle}>{title}</h1>
      </div>
    </section>
  );
}

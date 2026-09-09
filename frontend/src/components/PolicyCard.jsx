import Image from "next/image";
import styles from "./PolicyCard.module.css";

export default function PolicyCard({ imageSrc, title }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={imageSrc}
          alt={title}
          width={350}
          height={250}
          className={styles.image}
          priority={false}
        />
      </div>
      <div className={styles.title}>{title}</div>
    </div>
  );
}


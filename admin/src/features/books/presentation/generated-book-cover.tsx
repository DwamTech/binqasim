import Image from "next/image";

import { themeConfig } from "@/design-system/theme/theme.config";
import styles from "./books.module.css";

export function GeneratedBookCover({ title }: { title: string }) {
  return (
    <div className={styles.coverStage} aria-label={`غلاف ${title}`}>
      <div className={styles.generatedBook}>
        <div className={styles.generatedBookSpine} aria-hidden="true" />
        <div className={styles.generatedBookFront}>
          <div className={styles.generatedBookContent}>
            <Image
              src={themeConfig.brand.darkLogo}
              alt=""
              width={96}
              height={54}
              className={styles.generatedBookLogo}
            />
            <span className={styles.generatedBookDivider} aria-hidden="true" />
            <span className={styles.generatedBookAssociation}>
              <small>جمعية</small>
              <strong>مبتكرون السياحية</strong>
            </span>
            <span className={styles.generatedBookDivider} aria-hidden="true" />
            <strong className={styles.generatedBookTitle}>{title}</strong>
          </div>
        </div>
        <div className={styles.generatedBookBack} aria-hidden="true" />
      </div>
    </div>
  );
}

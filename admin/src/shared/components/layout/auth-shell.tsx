import type { ReactNode } from "react";
import Image from "next/image";

import { themeConfig } from "@/design-system/theme/theme.config";

import styles from "./auth-shell.module.css";

export function AuthShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
  version: string;
}) {
  return (
    <main className={styles.shell} dir={themeConfig.layout.direction}>
      <div className={styles.aurora} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <section className={styles.experience} aria-labelledby="auth-shell-title">
        <aside className={styles.showcase} aria-label="نبذة عن لوحة الإدارة">
          <div className={styles.showcaseTop}>
            <div className={styles.brandRow}>
              <Image
                className={styles.logo}
                src={themeConfig.brand.logoMark}
                alt=""
                width={48}
                height={48}
                priority
              />
              <div>
                <p className={styles.brand} dir="ltr">
                  {themeConfig.brand.name}
                </p>
                <span className={styles.brandCaption}>مساحة إدارة المحتوى</span>
              </div>
            </div>
            <span className={styles.status}>
              <i aria-hidden="true" />
              اتصال آمن
            </span>
          </div>

          <div className={styles.showcaseCopy}>
            <h2>{themeConfig.brand.loginShowcaseTitle}</h2>
            <Image
              className={styles.calligraphy}
              src={themeConfig.brand.loginShowcaseLogo}
              alt=""
              width={300}
              height={155}
            />
            <p>
              ادخل إلى مساحة عمل هادئة ومنظمة تساعدك على متابعة المحتوى
              والتقارير والإعدادات بثقة.
            </p>
          </div>
        </aside>

        <div className={styles.formPanel}>
          <header className={styles.header}>
            <div className={styles.mobileBrand}>
              <Image
                className={styles.logo}
                src={themeConfig.brand.logoMark}
                alt=""
                width={48}
                height={48}
                priority
              />
              <p className={styles.brand} dir="ltr">
                {themeConfig.brand.name}
              </p>
            </div>
            <h1 id="auth-shell-title">{title}</h1>
            <p className={styles.description}>{description}</p>
          </header>
          <div className={styles.formBody}>{children}</div>
          <div className={styles.developerCredit}>
            <span>تطوير شركة دوام</span>
            <a
              href="https://dwam-tech.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="زيارة موقع شركة دوام"
            >
              <Image
                src="/dwam-logo.png"
                alt="شركة دوام"
                width={44}
                height={44}
              />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

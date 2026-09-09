import "./globals.css";
import { Tajawal } from "next/font/google";
import styles from "./layout.module.css";
import Image from "next/image";
import Link from "next/link";
import HeaderNav from "../../components/HeaderNav";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import SiteFooter from "../../components/SiteFooter";
import LocalizedTopbar from "../../components/LocalizedTopbar";
import { LanguageProvider } from "../../contexts/LanguageContext";

export const metadata = {
  title: "جمعية الآل والأصحاب",
  description: "جمعية خيرية مرخصة في مملكة البحرين تخدم المجتمع من خلال المشاريع الخيرية والعلمية والدعوية.",
};

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["arabic"],
  display: "swap",
});

export const revalidate = 0;

export default function RootLayout({ children }) {
  const now = new Date();
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>
        <LanguageProvider>
        <header>
          <LocalizedTopbar date={now.toISOString()} />
          <div className={styles.header}>
            <div className={styles.headerInner}>
              <div className={styles.brandLogo}>
                <Link href="/" aria-label="العودة إلى الصفحة الرئيسية">
                  <Image
                    src="/logo-hd.png"
                    alt="جمعية الآل والأصحاب"
                    width={200}
                    height={116}
                    className={styles.headerLogoImage}
                    priority
                  />
                </Link>
              </div>
              <HeaderNav />
            </div>
          </div>
        </header>
        {children}
        <SiteFooter />
        <ScrollToTopButton className={styles.scrollTop} />
        </LanguageProvider>
      </body>
    </html>
  );
}

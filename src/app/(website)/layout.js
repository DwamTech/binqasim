import "./globals.css";
import { Tajawal } from "next/font/google";
import styles from "./layout.module.css";
import Image from "next/image";
import Link from "next/link";
import HeaderNav from "../../components/HeaderNav";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import {
  FaYoutube,
  FaTwitter,
  FaFacebookF,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export const metadata = {
  title: "وقف عبد الله بن قاسم",
  description: "موقع وقف عبد الله بن قاسم",
};

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["arabic"],
  display: "swap",
});

export const revalidate = 0;

export default function RootLayout({ children }) {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>
        <header>
          <div className={styles.topbar}>
            <div className={styles.topbarInner}>
              <div className={styles.rightGroup}>
                <a href="tel:0138337589" className={styles.contactLink} dir="ltr">
                  <FaPhone size={13} aria-hidden />
                  <span>0138337589</span>
                </a>
                <span className={styles.divider} />
                <a href="mailto:info@wqfalthani.com" className={styles.contactLink} dir="ltr">
                  <FaEnvelope size={13} aria-hidden />
                  <span>info@wqfalthani.com</span>
                </a>
              </div>
              <div className={styles.leftGroup}>
                <span className={styles.date}>{dateStr}</span>
                <span className={styles.divider} />
                <div className={styles.social}>
                  <a href="#" aria-label="YouTube"><FaYoutube size={18} /></a>
                  <a href="#" aria-label="Twitter"><FaTwitter size={18} /></a>
                  <a href="#" aria-label="Facebook"><FaFacebookF size={18} /></a>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.header}>
            <div className={styles.headerInner}>
              <div className={styles.brandLogo}>
                <Link href="/" aria-label="العودة إلى الصفحة الرئيسية">
                  <Image
                    src="/ben-logo.png"
                    alt="وقف عبد الله بن قاسم آل ثاني"
                    width={260}
                    height={99}
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
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={`${styles.footerCol} ${styles.footerAbout}`}>
              {/* <h4>وقف عبد الله بن قاسم</h4> */}
              <Link href="/" className={styles.footerLogo} aria-label="الصفحة الرئيسية لوقف عبد الله بن قاسم">
                <Image
                  src="/ben-logo.png"
                  alt="وقف عبد الله بن قاسم آل ثاني"
                  width={220}
                  height={84}
                />
              </Link>
              <p className={styles.description}>هو وقف خيري يتم الصرف منه على الأعمال الخيرية حسب شروط الواقف.</p>
            </div>
            <nav className={styles.footerCol} aria-label="أقسام الموقع">
              <h4>أقسام الموقع</h4>
              <ul>
                <li><Link href="/news">الأخبار</Link></li>
                <li><Link href="/funds">المصارف الشرعية</Link></li>
                <li><Link href="/books-policies">اللوائح والسياسات</Link></li>
              </ul>
            </nav>
            <nav className={styles.footerCol} aria-label="روابط سريعة">
              <h4>روابط سريعة</h4>
              <ul>
                <li><Link href="/about">من نحن</Link></li>
                <li><a href="mailto:info@wqfalthani.com">تواصل معنا</a></li>
                <li><Link href="/complaints">صندوق الشكاوى</Link></li>
              </ul>
            </nav>
            <div className={`${styles.footerCol} ${styles.footerContact}`}>
              <h4>تواصل معنا</h4>
              <address>
                <p><FaMapMarkerAlt aria-hidden /><span><strong>العنوان:</strong> الدمام - حي الريان</span></p>
                <p><FaPhone aria-hidden /><a href="tel:0138337589"><strong>رقم هاتف:</strong> <span dir="ltr">0138337589</span></a></p>
                <p><FaEnvelope aria-hidden /><a href="mailto:info@wqfalthani.com"><strong>البريد:</strong> <span dir="ltr">info@wqfalthani.com</span></a></p>
              </address>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomInner}>
              <nav className={styles.legalLinks} aria-label="الروابط القانونية">
                <Link href="/privacy-policy">سياسة الخصوصية</Link>
                <span aria-hidden />
                <Link href="/terms-and-conditions">الشروط والأحكام</Link>
              </nav>
              <div className={styles.developerCredit}>
                <span>تصميم وتطوير شركة</span>
                <a href="https://dwam-tech.com/" target="_blank" rel="noopener noreferrer" aria-label="شركة دوام للتقنية">
                  <Image src="/dwam.png" alt="شركة دوام" width={30} height={30} />
                  <strong>دوام</strong>
                </a>
              </div>
            </div>
          </div>
        </footer>
        <ScrollToTopButton className={styles.scrollTop} />
      </body>
    </html>
  );
}

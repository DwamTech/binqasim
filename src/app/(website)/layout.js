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
  FaSmile,
  FaLightbulb,
  FaExclamationTriangle,
  FaClipboard,
  FaUsers,
  FaNewspaper,
  FaFileAlt,
  FaCoins,
  FaMapMarkerAlt,
  FaCreditCard,
} from "react-icons/fa";

export const metadata = {
  title: "وقف الصالح الخيري",
  description: "موقع وقف الصالح الخيري",
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
                <FaEnvelope size={18} aria-hidden />
                <a href="mailto:info@waqfalsaleh.org.sa" className={styles.email}>info@waqfalsaleh.org.sa</a>
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
              <div className={styles.logoLeft}>
                <Link href="/"><Image src="/وقف-الغيث.jpeg" alt="وقف  الغيث" width={160} height={56} priority /></Link>
              </div>
              <HeaderNav />
              <div className={styles.logoRight}>
                <Link href="/"><Image src="/الوقف.png" alt="وقف الصالح الخيري" width={200} height={60} priority /></Link>
              </div>
            </div>
          </div>
        </header>
        {children}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerCol}>
              <h4>الوقف الصالح</h4>
              <p className={styles.description}>وقف خيري مخصص لرعاية طلاب العلم ومساندتهم في سبيل تحصيلهم للعلم والقيام بواجب الدعوة إلى الله تعالى على منهج أهل السنة والجماعة.</p>
              <p className={styles.description}>كما أنه يستهدف أبواب البر والخير عموما في حال وجود فائض او حاجة طارئة تتطلب الانتقال الى المصارف الأخرى قبل طلاب العلم.</p>
            </div>
            <div className={styles.footerCol}>
              <h4>أقسام الموقع</h4>
              <ul>
                <li><FaFileAlt className={styles.iconSecondary} />إقرار الصك</li>
                <li><FaCoins className={styles.iconPrimary} />مصارف الريع</li>
                <li><FaUsers className={styles.iconSecondary} />مجلس النظارة</li>
                <li><FaNewspaper className={styles.iconPrimary} />أخبار الوقف</li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>روابط سريعة</h4>
              <ul>
                <li><FaPhone className={styles.iconPrimary} />تواصل معنا</li>
                <li><FaSmile className={styles.iconSecondary} />تقييم رضا المستفيدين</li>
                <li><FaLightbulb className={styles.iconPrimary} />صندوق الاقتراحات</li>
                <li><FaExclamationTriangle className={styles.iconSecondary} />صندوق الشكاوي</li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>تفاصيل أخرى</h4>
              <ul>
                <li><FaClipboard className={styles.iconSecondary} />طلبات الدعم</li>
                <li><FaMapMarkerAlt className={styles.iconPrimary} />مقر الوقف: مكة المكرمة</li>
                <li><FaCreditCard className={styles.iconSecondary} />رقم الصك: 320101002583</li>
                <li><FaEnvelope className={styles.iconPrimary} />البريد الإلكتروني: info@waqfalsaleh.org.sa</li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomInner}>
              <span>تصميم وتطوير شركة </span>
              <a href="https://dwam-tech.com/" target="_blank" rel="noopener noreferrer" aria-label="Dwam Tech">
                <Image src="/dwam.png" alt="Dwam Tech" width={28} height={28} style={{ borderRadius: "50%" }} />
              </a>
            </div>
          </div>
        </footer>
        <ScrollToTopButton className={styles.scrollTop} />
      </body>
    </html>
  );
}

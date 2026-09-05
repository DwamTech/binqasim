'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "../app/(website)/layout.module.css";
import {
  FaHome,
  FaLandmark,
  FaThumbtack,
  FaPhone,
  FaChevronDown,
  FaInfoCircle,
  FaBook,
  FaCoins,
  FaChartBar,
  FaCalendarAlt,
  FaSmile,
  FaLightbulb,
  FaExclamationTriangle,
  FaClipboard,
  FaBars,
  FaTimes,
  FaEnvelope,
  FaYoutube,
  FaTwitter,
  FaFacebookF,
} from "react-icons/fa";

export default function HeaderNav() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [govOpen, setGovOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const isHome = pathname === "/";
  const isNews = pathname.startsWith("/news");
  const isGovernmentActive =
    pathname.startsWith("/about") ||
    pathname.startsWith("/books-policies") ||
    pathname.startsWith("/funds") ||
    pathname.startsWith("/reports");
  const isContactActive =
    pathname.startsWith("/satisfaction") ||
    pathname.startsWith("/suggestions") ||
    pathname.startsWith("/complaints");
  const isSupportActive = pathname.startsWith("/support");

  return (
    <nav className={styles.navBar} aria-label="التنقل الرئيسي">
      <ul className={styles.nav}>
        <li className={`${styles.navItem} ${isHome ? styles.navItemActive : ""}`}>
          <Link href="/"><FaHome className={styles.navIcon} aria-hidden />الرئيسية</Link>
        </li>
        <li className={`${styles.navItem} ${styles.hasDropdown} ${isGovernmentActive ? styles.navItemActive : ""}`}>
          <a href="#"><FaLandmark className={styles.navIcon} aria-hidden />الحكومه<FaChevronDown className={styles.chevron} aria-hidden /></a>
          <div className={styles.dropdownMenu}>
            <Link href="/about" className={pathname.startsWith("/about") ? styles.dropdownActive : ""}><FaInfoCircle className={styles.iconPrimary} />عن الوقف</Link>
            <Link href="/books-policies" className={pathname.startsWith("/books-policies") ? styles.dropdownActive : ""}><FaBook className={styles.iconSecondary} />اللوائح والسياسات</Link>
            <Link href="/funds" className={pathname.startsWith("/funds") ? styles.dropdownActive : ""}><FaCoins className={styles.iconPrimary} />مصارف الريع</Link>
            <Link href="/reports/financial" className={pathname.startsWith("/reports/financial") ? styles.dropdownActive : ""}><FaChartBar className={styles.iconSecondary} />التقارير المالية</Link>
            <Link href="/reports/annual" className={pathname.startsWith("/reports/annual") ? styles.dropdownActive : ""}><FaCalendarAlt className={styles.iconPrimary} />التقارير السنوية</Link>
          </div>
        </li>
        <li className={`${styles.navItem} ${isNews ? styles.navItemActive : ""}`}>
          <Link href="/news"><FaThumbtack className={styles.navIcon} aria-hidden />أخبار الوقف</Link>
        </li>
        <li className={`${styles.navItem} ${styles.hasDropdown} ${isContactActive ? styles.navItemActive : ""}`}>
          <a href="#"><FaPhone className={styles.navIcon} aria-hidden />تواصل معنا<FaChevronDown className={styles.chevron} aria-hidden /></a>
          <div className={`${styles.dropdownMenu} ${styles.dropdownWide}`}>
            <a href="/satisfaction" className={pathname.startsWith("/satisfaction") ? styles.dropdownActive : ""}><FaSmile className={styles.iconSuccess} />تقييم رضا المستفيدين</a>
            <a href="/suggestions" className={pathname.startsWith("/suggestions") ? styles.dropdownActive : ""}><FaLightbulb className={styles.iconIdea} />صندوق الاقتراحات</a>
            <a href="/complaints" className={pathname.startsWith("/complaints") ? styles.dropdownActive : ""}><FaExclamationTriangle className={styles.iconSuccess} />صندوق الشكاوي</a>
          </div>
        </li>
        <li className={`${styles.navItem} ${isSupportActive ? styles.navItemActive : ""}`}>
          <Link href="/support"><FaClipboard className={styles.navIcon} aria-hidden />طلبات الدعم</Link>
        </li>
      </ul>
      <button
        type="button"
        className={styles.hamburgerBtn}
        aria-label="فتح القائمة الجانبية"
        onClick={() => setSidebarOpen(true)}
      >
        <FaBars />
      </button>
      <div
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.open : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="القائمة الجانبية"
      >
        <div className={styles.sidebarHeader}>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="إغلاق القائمة الجانبية"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
          <div className={styles.sidebarLogo}>
            <Image src="/الوقف.png" alt="وقف الصالح الخيري" width={180} height={50} />
          </div>
        </div>
        <div className={styles.sidebarBody}>
          <Link href="/" className={styles.sidebarLink} onClick={() => setSidebarOpen(false)}>
            <FaHome className={styles.iconPrimary} />الرئيسية
          </Link>
          <button
            type="button"
            className={styles.sidebarGroupBtn}
            aria-expanded={govOpen}
            onClick={() => setGovOpen((v) => !v)}
          >
            <FaLandmark className={styles.iconSecondary} />الحكومه
            <FaChevronDown className={`${styles.chevron} ${govOpen ? styles.rotate : ""}`} aria-hidden />
          </button>
          <div className={`${styles.sidebarSubmenu} ${govOpen ? styles.show : ""}`}>
            <Link href="/about" className={styles.sidebarSubLink} onClick={() => setSidebarOpen(false)}>
              <FaInfoCircle className={styles.iconPrimary} />عن الوقف
            </Link>
            <Link href="/books-policies" className={styles.sidebarSubLink} onClick={() => setSidebarOpen(false)}>
              <FaBook className={styles.iconSecondary} />اللوائح والسياسات
            </Link>
            <Link href="/funds" className={styles.sidebarSubLink} onClick={() => setSidebarOpen(false)}>
              <FaCoins className={styles.iconPrimary} />مصارف الريع
            </Link>
            <Link href="/reports/financial" className={styles.sidebarSubLink} onClick={() => setSidebarOpen(false)}>
              <FaChartBar className={styles.iconSecondary} />التقارير المالية
            </Link>
            <Link href="/reports/annual" className={styles.sidebarSubLink} onClick={() => setSidebarOpen(false)}>
              <FaCalendarAlt className={styles.iconPrimary} />التقارير السنوية
            </Link>
          </div>
          <Link href="/news" className={styles.sidebarLink} onClick={() => setSidebarOpen(false)}>
            <FaThumbtack className={styles.iconSecondary} />أخبار الوقف
          </Link>
          <button
            type="button"
            className={styles.sidebarGroupBtn}
            aria-expanded={contactOpen}
            onClick={() => setContactOpen((v) => !v)}
          >
            <FaPhone className={styles.iconPrimary} />تواصل معنا
            <FaChevronDown className={`${styles.chevron} ${contactOpen ? styles.rotate : ""}`} aria-hidden />
          </button>
          <div className={`${styles.sidebarSubmenu} ${contactOpen ? styles.show : ""}`}>
            <a href="/satisfaction" className={styles.sidebarSubLink} onClick={() => setSidebarOpen(false)}>
              <FaSmile className={styles.iconSuccess} />تقييم رضا المستفيدين
            </a>
            <a href="/suggestions" className={styles.sidebarSubLink} onClick={() => setSidebarOpen(false)}>
              <FaLightbulb className={styles.iconIdea} />صندوق الاقتراحات
            </a>
            <a href="/complaints" className={styles.sidebarSubLink} onClick={() => setSidebarOpen(false)}>
              <FaExclamationTriangle className={styles.iconSuccess} />صندوق الشكاوي
            </a>
          </div>
          <Link href="/support" className={styles.sidebarLink} onClick={() => setSidebarOpen(false)}>
            <FaClipboard className={styles.iconPrimary} />طلبات الدعم
          </Link>
        </div>
        <div className={styles.sidebarFooter}>
          <a href="mailto:info@waqfalsaleh.org.sa" className={styles.sidebarEmail}>
            <FaEnvelope />info@waqfalsaleh.org.sa
          </a>
          <div className={styles.sidebarSocial}>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
          </div>
        </div>
      </aside>
    </nav>
  );
}

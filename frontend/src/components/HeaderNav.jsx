"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { languages, useLanguage } from "../contexts/LanguageContext";
import styles from "../app/(website)/layout.module.css";
import {
  FaHome, FaInfoCircle, FaHandHoldingHeart, FaBookOpen, FaThumbtack,
  FaPhone, FaBars, FaTimes, FaEnvelope, FaFacebookF, FaTwitter,
  FaYoutube, FaVideo, FaComments, FaGlobe, FaCalendarAlt,
  FaChevronDown, FaUsers, FaStar, FaMoon, FaMapMarkedAlt, FaMicrophone,
} from "react-icons/fa";

const labels = {
  ar: ["الرئيسية", "الأخبار", "المكتبة المقروءة", "مرئيات", "قالوا عنا", "اتصل بنا", "من نحن", "للتبرع", "اللغات", "أنشطة وفعاليات"],
  en: ["Home", "News", "Reading Library", "Videos", "Testimonials", "Contact Us", "About Us", "Donate", "Languages", "Activities & Events"],
  fa: ["خانه", "اخبار", "کتابخانه خواندنی", "ویدئوها", "دیدگاه‌ها درباره ما", "تماس با ما", "درباره ما", "کمک مالی", "زبان‌ها", "فعالیت‌ها و رویدادها"],
};

const definitions = [
  { href: "/", Icon: FaHome },
  { href: "/news", Icon: FaThumbtack },
  { href: "/library", Icon: FaBookOpen },
  { href: "/visuals", Icon: FaVideo },
  { href: "/testimonials", Icon: FaComments },
  { href: "/contact", Icon: FaPhone },
  { href: "/about", Icon: FaInfoCircle },
  { href: "/donate", Icon: FaHandHoldingHeart },
  { type: "languages", Icon: FaGlobe },
  { href: "/activities", Icon: FaCalendarAlt },
];

const libraryMenu = {
  ar: [
    { href: "/posters", title: "المعلقات", Icon: FaThumbtack },
  ],
  en: [
    { href: "/posters", title: "Posters", Icon: FaThumbtack },
  ],
  fa: [
    { href: "/posters", title: "پوسترها", Icon: FaThumbtack },
  ],
};

const activitiesMenu = {
  ar: [
    { href: "/activities?category=general-assembly", title: "اجتماعات الجمعية العمومية", Icon: FaUsers },
    { href: "/activities?category=participations", title: "استضافات ومشاركات", Icon: FaStar },
    { href: "/activities?category=ramadan", title: "البرامج الرمضانية", Icon: FaMoon },
    { href: "/activities?category=trips", title: "المخيمات والرحلات", Icon: FaMapMarkedAlt },
    { href: "/activities?category=exhibitions", title: "المعارض والمحافل", Icon: FaCalendarAlt },
    { href: "/activities?category=seminars", title: "الندوات واللقاءات", Icon: FaMicrophone },
  ],
  en: [
    { href: "/activities?category=general-assembly", title: "General Assembly Meetings", Icon: FaUsers },
    { href: "/activities?category=participations", title: "Hosting & Participation", Icon: FaStar },
    { href: "/activities?category=ramadan", title: "Ramadan Programs", Icon: FaMoon },
    { href: "/activities?category=trips", title: "Camps & Trips", Icon: FaMapMarkedAlt },
    { href: "/activities?category=exhibitions", title: "Exhibitions & Forums", Icon: FaCalendarAlt },
    { href: "/activities?category=seminars", title: "Seminars & Gatherings", Icon: FaMicrophone },
  ],
  fa: [
    { href: "/activities?category=general-assembly", title: "جلسات مجمع عمومی", Icon: FaUsers },
    { href: "/activities?category=participations", title: "میزبانی و مشارکت", Icon: FaStar },
    { href: "/activities?category=ramadan", title: "برنامه‌های رمضان", Icon: FaMoon },
    { href: "/activities?category=trips", title: "اردوها و سفرها", Icon: FaMapMarkedAlt },
    { href: "/activities?category=exhibitions", title: "نمایشگاه‌ها و همایش‌ها", Icon: FaCalendarAlt },
    { href: "/activities?category=seminars", title: "سمینارها و نشست‌ها", Icon: FaMicrophone },
  ],
};

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const { language } = useLanguage();
  const aboutLanguage = pathname === "/about" && languages.some(({ code }) => code === searchParams.get("lang")) ? searchParams.get("lang") : "ar";
  const links = definitions.map((item, index) => ({ ...item, title: labels[language][index] }));
  const copy = {
    ar: { nav: "التنقل الرئيسي", open: "فتح القائمة", close: "إغلاق القائمة", drawer: "القائمة الجانبية" },
    en: { nav: "Main navigation", open: "Open menu", close: "Close menu", drawer: "Navigation menu" },
    fa: { nav: "پیمایش اصلی", open: "باز کردن منو", close: "بستن منو", drawer: "منوی پیمایش" },
  }[language];
  const isActive = (item) => !item.external && item.href && (item.href === "/" ? pathname === "/" : !item.href.includes("#") && pathname.startsWith(item.href));
  const chooseLanguage = (code) => {
    setLanguageOpen(false);
    setSidebarOpen(false);
    router.push(`/about?lang=${code}`);
  };

  const renderLink = (item, mobile = false) => {
    const { title, href, Icon, external, type } = item;
    if (type === "languages") {
      if (mobile) return <div className={styles.sidebarLanguageGroup} key="languages-mobile"><button type="button" className={styles.sidebarLanguageTitle} aria-expanded={languageOpen} aria-controls="mobile-language-menu" onClick={() => setLanguageOpen((open) => !open)}><span><Icon className={styles.iconPrimary} />{title}</span><FaChevronDown className={`${styles.chevron} ${languageOpen ? styles.rotate : ""}`} aria-hidden /></button><div id="mobile-language-menu" className={`${styles.sidebarLanguages} ${languageOpen ? styles.sidebarLanguagesOpen : ""}`}>{languages.map((option) => <button type="button" key={option.code} className={aboutLanguage === option.code ? styles.languageActive : ""} onClick={() => chooseLanguage(option.code)}>{option.label}</button>)}</div></div>;
      return <li className={`${styles.navItem} ${styles.languageNavItem}`} key="languages-desktop"><button type="button" aria-haspopup="menu"><Icon className={styles.navIcon} />{title}<FaChevronDown className={styles.chevron} aria-hidden /></button><div className={styles.languageDropdown} role="menu">{languages.map((option) => <button type="button" key={option.code} className={aboutLanguage === option.code ? styles.languageActive : ""} onClick={() => chooseLanguage(option.code)}>{option.label}</button>)}</div></li>;
    }
    if (href === "/library") {
      const menuItems = libraryMenu[language];
      if (mobile) return (
        <div className={styles.sidebarLibraryGroup} key="library-mobile">
          <button type="button" className={styles.sidebarGroupBtn} aria-expanded={libraryOpen} aria-controls="mobile-library-menu" onClick={() => setLibraryOpen((open) => !open)}>
            <span><Icon className={styles.iconPrimary} />{title}</span>
            <FaChevronDown className={`${styles.chevron} ${libraryOpen ? styles.rotate : ""}`} aria-hidden />
          </button>
          <div id="mobile-library-menu" className={`${styles.sidebarSubmenu} ${libraryOpen ? styles.show : ""}`}>
            {menuItems.map(({ href: childHref, title: childTitle, Icon: ChildIcon }) => <Link className={styles.sidebarSubLink} href={childHref} onClick={() => setSidebarOpen(false)} key={childHref}><ChildIcon aria-hidden /><span>{childTitle}</span></Link>)}
          </div>
        </div>
      );
      return (
        <li className={`${styles.navItem} ${styles.dropdownNavItem} ${(pathname.startsWith("/library") || pathname.startsWith("/posters")) ? styles.navItemActive : ""}`} key={href}>
          <Link href={href} aria-haspopup="menu"><Icon className={styles.navIcon} aria-hidden />{title}<FaChevronDown className={styles.chevron} aria-hidden /></Link>
          <div className={styles.navDropdown} role="menu">
            {menuItems.map(({ href: childHref, title: childTitle, Icon: ChildIcon }) => <Link href={childHref} role="menuitem" key={childHref}><ChildIcon className={styles.navIcon} aria-hidden /><span>{childTitle}</span></Link>)}
          </div>
        </li>
      );
    }
    if (href === "/activities") {
      const menuItems = activitiesMenu[language];
      if (mobile) return (
        <div className={styles.sidebarLibraryGroup} key="activities-mobile">
          <button type="button" className={styles.sidebarGroupBtn} aria-expanded={activitiesOpen} aria-controls="mobile-activities-menu" onClick={() => setActivitiesOpen((open) => !open)}>
            <span><Icon className={styles.iconPrimary} />{title}</span>
            <FaChevronDown className={`${styles.chevron} ${activitiesOpen ? styles.rotate : ""}`} aria-hidden />
          </button>
          <div id="mobile-activities-menu" className={`${styles.sidebarSubmenu} ${activitiesOpen ? styles.show : ""}`}>
            {menuItems.map(({ href: childHref, title: childTitle, Icon: ChildIcon }) => <Link className={styles.sidebarSubLink} href={childHref} onClick={() => setSidebarOpen(false)} key={childHref}><ChildIcon aria-hidden /><span>{childTitle}</span></Link>)}
          </div>
        </div>
      );
      return (
        <li className={`${styles.navItem} ${styles.dropdownNavItem} ${pathname.startsWith("/activities") ? styles.navItemActive : ""}`} key={href}>
          <Link href={href} aria-haspopup="menu"><Icon className={styles.navIcon} aria-hidden />{title}<FaChevronDown className={styles.chevron} aria-hidden /></Link>
          <div className={`${styles.navDropdown} ${styles.activitiesDropdown}`} role="menu">
            {menuItems.map(({ href: childHref, title: childTitle, Icon: ChildIcon }) => <Link href={childHref} role="menuitem" key={childHref}><ChildIcon className={styles.navIcon} aria-hidden /><span>{childTitle}</span></Link>)}
          </div>
        </li>
      );
    }
    if (mobile) {
      const content = <><Icon className={styles.iconPrimary} />{title}</>;
      return external ? <a href={href} target="_blank" rel="noopener noreferrer" className={styles.sidebarLink} onClick={() => setSidebarOpen(false)} key={href}>{content}</a> : <Link href={href} className={styles.sidebarLink} onClick={() => setSidebarOpen(false)} key={href}>{content}</Link>;
    }
    const content = <><Icon className={styles.navIcon} aria-hidden />{title}</>;
    return <li className={`${styles.navItem} ${isActive(item) ? styles.navItemActive : ""}`} key={href}>{external ? <a href={href} target="_blank" rel="noopener noreferrer">{content}</a> : <Link href={href}>{content}</Link>}</li>;
  };

  return (
    <nav className={styles.navBar} aria-label={copy.nav}>
      <ul className={styles.nav}>{links.map((item) => renderLink(item))}</ul>
      <button type="button" className={styles.hamburgerBtn} aria-label={copy.open} onClick={() => setSidebarOpen(true)}><FaBars /></button>
      <div className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.open : ""}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`} role="dialog" aria-modal="true" aria-label={copy.drawer}>
        <div className={styles.sidebarHeader}><button type="button" className={styles.closeBtn} aria-label={copy.close} onClick={() => setSidebarOpen(false)}><FaTimes /></button><div className={styles.sidebarLogo}><Image src="/logo-hd.png" alt="جمعية الآل والأصحاب" width={180} height={104} /></div></div>
        <div className={styles.sidebarBody}>{links.map((item) => renderLink(item, true))}</div>
        <div className={styles.sidebarFooter}><a href="mailto:tawasul.aalalashab@gmail.com" className={styles.sidebarEmail}><FaEnvelope />tawasul.aalalashab@gmail.com</a><div className={styles.sidebarSocial}><a href="https://www.youtube.com/@Aalalashab" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a><a href="https://x.com/aalashab_bh" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a><a href="https://www.facebook.com/aalashab.bh" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a></div></div>
      </aside>
    </nav>
  );
}

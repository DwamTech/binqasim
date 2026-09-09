"use client";

import { FaYoutube, FaTwitter, FaFacebookF, FaEnvelope, FaPhone } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "../app/(website)/layout.module.css";

const locales = { ar: "ar-BH", en: "en-GB", fa: "fa-IR" };

export default function LocalizedTopbar({ date }) {
  const { language } = useLanguage();
  const dateText = new Intl.DateTimeFormat(locales[language], { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Cairo" }).format(new Date(date));
  return <div className={styles.topbar}><div className={styles.topbarInner}>
    <div className={styles.rightGroup}><a href="tel:+97317774001" className={styles.contactLink} dir="ltr"><FaPhone size={13} aria-hidden /><span>+973 17774001</span></a><span className={styles.divider} /><a href="mailto:tawasul.aalalashab@gmail.com" className={styles.contactLink} dir="ltr"><FaEnvelope size={13} aria-hidden /><span>tawasul.aalalashab@gmail.com</span></a></div>
    <div className={styles.leftGroup}><span className={styles.date}>{dateText}</span><span className={styles.divider} /><div className={styles.social}><a href="https://www.youtube.com/@Aalalashab" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube size={18} /></a><a href="https://x.com/aalashab_bh" target="_blank" rel="noopener noreferrer" aria-label="X"><FaTwitter size={18} /></a><a href="https://www.facebook.com/aalashab.bh" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF size={18} /></a></div></div>
  </div></div>;
}

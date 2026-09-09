"use client";

import { FiDownload, FiMail } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { FaFacebookF, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "./PosterActions.module.css";

const translations = {
  ar: { download: "تحميل المعلقة", downloadLabel: "تحميل", share: "مشاركة المعلقة", whatsapp: "مشاركة على واتساب", facebook: "مشاركة على فيسبوك", x: "مشاركة على إكس", telegram: "مشاركة على تيليجرام", email: "مشاركة عبر البريد الإلكتروني" },
  en: { download: "Download poster", downloadLabel: "Download", share: "Share poster", whatsapp: "Share on WhatsApp", facebook: "Share on Facebook", x: "Share on X", telegram: "Share on Telegram", email: "Share by email" },
  fa: { download: "دریافت پوستر", downloadLabel: "دریافت", share: "اشتراک‌گذاری پوستر", whatsapp: "اشتراک‌گذاری در واتساپ", facebook: "اشتراک‌گذاری در فیسبوک", x: "اشتراک‌گذاری در ایکس", telegram: "اشتراک‌گذاری در تلگرام", email: "اشتراک‌گذاری با ایمیل" },
};

export default function PosterActions({ poster, compact = false }) {
  const { language } = useLanguage();
  const text = translations[language];
  const share = (network) => {
    const pageUrl = `${window.location.origin}/posters/${poster.slug}`;
    const url = encodeURIComponent(pageUrl);
    const title = encodeURIComponent(poster.title[language]);
    const targets = {
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
      email: `mailto:?subject=${title}&body=${url}`,
    };
    if (network === "email") {
      window.location.href = targets.email;
      return;
    }
    window.open(targets[network], "_blank", "noopener,noreferrer,width=720,height=620");
  };

  return (
    <div className={`${styles.actions} ${compact ? styles.compact : ""}`}>
      <a className={styles.download} href={poster.image} download aria-label={`${text.downloadLabel} ${poster.title[language]}`}><FiDownload aria-hidden /><span>{text.download}</span></a>
      <div className={styles.social} aria-label={text.share}>
        <button type="button" onClick={() => share("whatsapp")} aria-label={text.whatsapp}><FaWhatsapp aria-hidden /></button>
        <button type="button" onClick={() => share("facebook")} aria-label={text.facebook}><FaFacebookF aria-hidden /></button>
        <button type="button" onClick={() => share("x")} aria-label={text.x}><FaXTwitter aria-hidden /></button>
        <button type="button" onClick={() => share("telegram")} aria-label={text.telegram}><FaTelegramPlane aria-hidden /></button>
        <button type="button" onClick={() => share("email")} aria-label={text.email}><FiMail aria-hidden /></button>
      </div>
    </div>
  );
}

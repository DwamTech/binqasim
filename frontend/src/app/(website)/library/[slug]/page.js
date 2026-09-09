"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { FiArrowLeft, FiDownload, FiMail, FiShare2 } from "react-icons/fi";
import { FaFacebookF, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { libraryBooks } from "../../../../data/libraryBooks";
import { useLanguage } from "../../../../contexts/LanguageContext";
import styles from "./page.module.css";

const labels = {
  ar: { back: "العودة إلى المكتبة", kicker: "المكتبة المقروءة", download: "تحميل الكتاب", unavailable: "سيتوفر الملف قريبًا", share: "شارك الصفحة", email: "البريد الإلكتروني" },
  en: { back: "Back to library", kicker: "Reading library", download: "Download book", unavailable: "File coming soon", share: "Share this page", email: "Email" },
  fa: { back: "بازگشت به کتابخانه", kicker: "کتابخانه خواندنی", download: "دریافت کتاب", unavailable: "فایل به‌زودی در دسترس است", share: "اشتراک‌گذاری صفحه", email: "ایمیل" },
};
const subscribe = () => () => {};
const usePageUrl = () => useSyncExternalStore(subscribe, () => window.location.href, () => "");

export default function LibraryBookPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const text = labels[language];
  const book = libraryBooks.find((item) => item.slug === slug);
  const pageUrl = usePageUrl();
  if (!book) return <main className={styles.notFound}><h1>404</h1><Link href="/library">{text.back}</Link></main>;
  const title = encodeURIComponent(book.title[language]);
  const url = encodeURIComponent(pageUrl);
  const sharing = [
    ["WhatsApp", `https://wa.me/?text=${title}%20${url}`, FaWhatsapp, styles.whatsapp],
    ["Telegram", `https://t.me/share/url?url=${url}&text=${title}`, FaTelegramPlane, styles.telegram],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${url}`, FaFacebookF, styles.facebook],
    [text.email, `mailto:?subject=${title}&body=${url}`, FiMail, styles.email],
  ];
  return <main className={styles.page}>
    <section className={styles.hero}><div className={styles.pattern} aria-hidden /><div className={styles.heroInner}><Link href="/library" className={styles.back}><FiArrowLeft aria-hidden />{text.back}</Link><div className={styles.cover}><Image src="/library-book-cover.png" alt={book.title[language]} fill priority sizes="(max-width: 700px) 76vw, 380px" /></div><div className={styles.content}><span>{text.kicker}</span><h1>{book.title[language]}</h1><p>{book.description[language]}</p><div className={styles.download}><button type="button" disabled><FiDownload aria-hidden />{text.download}</button><small>{text.unavailable}</small></div></div></div></section>
    <section className={styles.share}><span><FiShare2 aria-hidden />{text.share}</span><div>{sharing.map(([label, href, Icon, className]) => <a href={href} className={className} target="_blank" rel="noopener noreferrer" key={label}><Icon aria-hidden />{label}</a>)}</div></section>
  </main>;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { FiArrowLeft, FiMail, FiPlayCircle, FiShare2 } from "react-icons/fi";
import { FaFacebookF, FaTelegramPlane, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { visualLibrary } from "../../../../data/visualLibrary";
import styles from "./page.module.css";

const copy = {
  ar: { back: "العودة إلى المكتبة المرئية", kicker: "المكتبة المرئية", video: "شاهد المادة المرئية", channel: "فيديو من قناة الجمعية الرسمية", share: "شارك هذا الفيديو", email: "البريد الإلكتروني" },
  en: { back: "Back to visual library", kicker: "Visual library", video: "Watch the video", channel: "From the Society's official channel", share: "Share this video", email: "Email" },
  fa: { back: "بازگشت به کتابخانه تصویری", kicker: "کتابخانه تصویری", video: "ویدیو را ببینید", channel: "از کانال رسمی بنیاد", share: "اشتراک‌گذاری ویدیو", email: "ایمیل" },
};
const subscribe = () => () => {};
const usePageUrl = () => useSyncExternalStore(subscribe, () => window.location.href, () => "");

export default function VisualDetailsPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const text = copy[language];
  const item = visualLibrary.find((entry) => entry.slug === slug);
  const pageUrl = usePageUrl();
  if (!item) return <main className={styles.notFound}><h1>404</h1><Link href="/visuals">{text.back}</Link></main>;
  const title = encodeURIComponent(item.title[language]);
  const url = encodeURIComponent(pageUrl);
  const sharing = [
    ["WhatsApp", `https://wa.me/?text=${title}%20${url}`, FaWhatsapp, styles.whatsapp],
    ["Telegram", `https://t.me/share/url?url=${url}&text=${title}`, FaTelegramPlane, styles.telegram],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${url}`, FaFacebookF, styles.facebook],
    [text.email, `mailto:?subject=${title}&body=${url}`, FiMail, styles.email],
  ];
  return <main className={styles.page}>
    <section className={styles.hero}><Image src={item.image} alt="" fill priority sizes="100vw" className={styles.heroImage} /><div className={styles.overlay} /><div className={styles.heroInner}><Link href="/visuals" className={styles.back}><FiArrowLeft aria-hidden />{text.back}</Link><div><span>{text.kicker}</span><h1>{item.title[language]}</h1><p>{item.description[language]}</p><a href="#video"><FiPlayCircle aria-hidden />{text.video}</a></div></div></section>
    <section className={styles.videoSection} id="video"><header><span><FaYoutube aria-hidden />YouTube</span><h2>{text.video}</h2><p>{text.channel}</p></header><div className={styles.video}><iframe src={item.youtubeEmbed} title={item.title[language]} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div></section>
    <section className={styles.share}><span><FiShare2 aria-hidden />{text.share}</span><div>{sharing.map(([label, href, Icon, className]) => <a href={href} className={className} target="_blank" rel="noopener noreferrer" key={label}><Icon aria-hidden />{label}</a>)}</div></section>
  </main>;
}

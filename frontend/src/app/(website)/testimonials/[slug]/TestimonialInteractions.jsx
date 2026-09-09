"use client";

import { useState } from "react";
import { FiCheck, FiLink, FiShare2 } from "react-icons/fi";
import { FaApple, FaFacebookF, FaGooglePlay, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { useLanguage } from "../../../../contexts/LanguageContext";
import styles from "./page.module.css";

const appStoreUrl = "https://apps.apple.com/bh/app/%D8%A7%D9%84%D8%A2%D9%84-%D9%88%D8%A7%D9%84%D8%A3%D8%B5%D8%AD%D8%A7%D8%A8/id1482430790";
const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.alalwalashab.alalwalashab&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1&pli=1";
const translations = {
  ar: { panel: "مشاركة وتحميل التطبيق", shareTopic: "شارك هذا الموضوع", share: "مشاركة", facebook: "مشاركة على فيسبوك", x: "مشاركة على إكس", whatsapp: "مشاركة على واتساب", copy: "نسخ الرابط", copied: "تم نسخ الرابط", download: "حمّل تطبيق", app: "دفاعاً عن الآل والأصحاب", hear: "يسعدنا سماعك", commentTitle: "اترك تعليقاً", privacy: "لن يتم نشر عنوان بريدك الإلكتروني. الحقول الإلزامية مشار إليها بـ", comment: "التعليق", name: "الاسم", email: "البريد الإلكتروني", website: "الموقع الإلكتروني", remember: "احفظ اسمي، بريدي الإلكتروني، والموقع الإلكتروني في هذا المتصفح لاستخدامها المرة المقبلة في تعليقي.", submit: "إرسال التعليق", success: "شكرًا لك، تم استلام تعليقك للمراجعة." },
  en: { panel: "Share and download the app", shareTopic: "Share this topic", share: "Share", facebook: "Share on Facebook", x: "Share on X", whatsapp: "Share on WhatsApp", copy: "Copy link", copied: "Link copied", download: "Download the app", app: "In Defense of Aal & Al Ashab", hear: "We would love to hear from you", commentTitle: "Leave a comment", privacy: "Your email address will not be published. Required fields are marked", comment: "Comment", name: "Name", email: "Email address", website: "Website", remember: "Save my name, email, and website in this browser for my next comment.", submit: "Submit comment", success: "Thank you. Your comment has been received for review." },
  fa: { panel: "اشتراک‌گذاری و دریافت برنامه", shareTopic: "این مطلب را به اشتراک بگذارید", share: "اشتراک‌گذاری", facebook: "اشتراک‌گذاری در فیسبوک", x: "اشتراک‌گذاری در ایکس", whatsapp: "اشتراک‌گذاری در واتساپ", copy: "کپی پیوند", copied: "پیوند کپی شد", download: "دریافت برنامه", app: "در دفاع از آل و اصحاب", hear: "از شنیدن دیدگاه شما خوشحال می‌شویم", commentTitle: "دیدگاه خود را بنویسید", privacy: "نشانی ایمیل شما منتشر نخواهد شد. فیلدهای الزامی با این علامت مشخص شده‌اند", comment: "دیدگاه", name: "نام", email: "ایمیل", website: "وب‌سایت", remember: "نام، ایمیل و وب‌سایت من را برای دیدگاه بعدی در این مرورگر ذخیره کن.", submit: "ارسال دیدگاه", success: "سپاسگزاریم. دیدگاه شما برای بررسی دریافت شد." },
};

export default function TestimonialInteractions({ title }) {
  const { language } = useLanguage();
  const text = translations[language];
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const shareUrl = (network) => {
    const url = encodeURIComponent(window.location.href);
    const encodedTitle = encodeURIComponent(title);
    const targets = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${url}`,
    };
    window.open(targets[network], "_blank", "noopener,noreferrer,width=720,height=620");
  };

  const nativeShare = async () => {
    if (navigator.share) await navigator.share({ title, url: window.location.href });
    else await copyLink();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submitComment = (event) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <>
      <section className={styles.actionsPanel} aria-label={text.panel}>
        <div className={styles.shareBlock}>
          <span>{text.shareTopic}</span>
          <div className={styles.shareButtons}>
            <button type="button" onClick={nativeShare} aria-label={text.share}><FiShare2 aria-hidden /></button>
            <button type="button" onClick={() => shareUrl("facebook")} aria-label={text.facebook}><FaFacebookF aria-hidden /></button>
            <button type="button" onClick={() => shareUrl("x")} aria-label={text.x}><FaXTwitter aria-hidden /></button>
            <button type="button" onClick={() => shareUrl("whatsapp")} aria-label={text.whatsapp}><FaWhatsapp aria-hidden /></button>
            <button type="button" onClick={copyLink} aria-label={text.copy}>{copied ? <FiCheck aria-hidden /> : <FiLink aria-hidden />}</button>
          </div>
          {copied && <small className={styles.copied}>{text.copied}</small>}
        </div>

        <div className={styles.downloadBlock}>
          <div><span>{text.download}</span><strong>{text.app}</strong></div>
          <div className={styles.storeButtons} dir="ltr">
            <a href={appStoreUrl} target="_blank" rel="noopener noreferrer"><FaApple aria-hidden /><span><small>Download on the</small>App Store</span></a>
            <a href={googlePlayUrl} target="_blank" rel="noopener noreferrer"><FaGooglePlay aria-hidden /><span><small>GET IT ON</small>Google Play</span></a>
          </div>
        </div>
      </section>

      <section className={styles.comments}>
        <header><span>{text.hear}</span><h2>{text.commentTitle}</h2><p>{text.privacy} <b>*</b></p></header>
        <form onSubmit={submitComment}>
          <label className={styles.full}>{text.comment} <b>*</b><textarea name="comment" rows="7" required /></label>
          <label>{text.name} <b>*</b><input type="text" name="name" autoComplete="name" required /></label>
          <label>{text.email} <b>*</b><input type="email" name="email" autoComplete="email" required /></label>
          <label className={styles.full}>{text.website} <input type="url" name="website" autoComplete="url" placeholder="https://" dir="ltr" /></label>
          <label className={`${styles.full} ${styles.remember}`}><input type="checkbox" name="remember" />{text.remember}</label>
          <button className={styles.submit} type="submit">{text.submit}</button>
          {submitted && <p className={styles.success}><FiCheck aria-hidden />{text.success}</p>}
        </form>
      </section>
    </>
  );
}

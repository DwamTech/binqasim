"use client";

import { FiArrowUpLeft, FiHeart, FiShield } from "react-icons/fi";
import Link from "next/link";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./SupportRequestBanner.module.css";

const copy = {
  ar: {
    eyebrow: "نحن بالقرب منك",
    title: "تقديم طلبات الدعم",
    description: "يمكنك تقديم طلب الدعم بسهولة عبر المنصة المخصصة، ومتابعة الخطوات بصورة آمنة وواضحة.",
    action: "اضغط هنا",
    note: "بوابة آمنة لاستقبال الطلبات",
  },
  en: {
    eyebrow: "We are here for you",
    title: "Submit a support request",
    description: "Submit your request through our dedicated platform and follow the process securely and clearly.",
    action: "Apply now",
    note: "A secure portal for applications",
  },
  fa: {
    eyebrow: "در کنار شما هستیم",
    title: "ثبت درخواست حمایت",
    description: "درخواست خود را به‌آسانی از طریق سامانه اختصاصی و به‌شکلی امن ثبت و پیگیری کنید.",
    action: "ثبت درخواست",
    note: "درگاه امن دریافت درخواست‌ها",
  },
};

export default function SupportRequestBanner() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <section className={styles.section} aria-labelledby="support-request-title">
      <div className={styles.banner}>
        <span className={styles.orbit} aria-hidden />
        <div className={styles.iconWrap} aria-hidden><FiHeart /></div>
        <div className={styles.content}>
          <span className={styles.eyebrow}>{text.eyebrow}</span>
          <h2 id="support-request-title">{text.title}</h2>
          <p>{text.description}</p>
        </div>
        <div className={styles.actionArea}>
          <span className={styles.note}><FiShield aria-hidden />{text.note}</span>
          <Link href="/support/individuals">
            {text.action}<FiArrowUpLeft aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

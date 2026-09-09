"use client";

import Image from "next/image";
import Link from "next/link";
import { FiCalendar } from "react-icons/fi";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "./WaqfIntroSection.module.css";

const content = {
  ar: {
    eyebrow: "محطة البداية",
    title: "جذور راسخة في مملكة البحرين",
    text: "تأسست الجمعية في مملكة البحرين بقرار من وزارة التنمية الاجتماعية رقم (32) لسنة 2006م ؛ وقد تم إشهارها و تسجيلها بموجب قرار وزيرة التنمية الاجتماعية تحت رقم 25/ج/أح.ح باسم (جمعية الال والاصحاب) .",
    country: "مملكة البحرين",
    foundation: "تأسست عام 2006م",
    more: "اعرف المزيد عن الجمعية",
  },
  en: {
    eyebrow: "Our beginning",
    title: "Rooted in the Kingdom of Bahrain",
    text: "The Society was established in the Kingdom of Bahrain by Resolution No. 32 of 2006 issued by the Ministry of Social Development. It was officially declared and registered under Resolution No. 25/C/Ah.H in the name of Aal & Al Ashab Society.",
    country: "Kingdom of Bahrain",
    foundation: "Established in 2006",
    more: "Learn more about the Society",
  },
  fa: {
    eyebrow: "آغاز راه",
    title: "ریشه‌دار در پادشاهی بحرین",
    text: "این بنیاد در پادشاهی بحرین با تصمیم شماره ۳۲ وزارت توسعه اجتماعی در سال ۲۰۰۶ تأسیس شد و طبق تصمیم شماره ۲۵/ج/أح.ح با نام بنیاد آل و اصحاب به ثبت و اعلام رسید.",
    country: "پادشاهی بحرین",
    foundation: "تأسیس در سال ۲۰۰۶",
    more: "درباره بنیاد بیشتر بدانید",
  },
};

export default function WaqfIntroSection() {
  const { language } = useLanguage();
  const text = content[language];
  return (
    <section className={styles.founding}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.visual}>
          <div className={styles.flagFrame}><Image src="/flag-of-bahrain-rounded-corners.png" alt={text.country} fill sizes="(max-width: 760px) 88vw, 440px" className={styles.flag} /></div>
          <div className={styles.logoCard}><Image src="/logon.png" alt="جمعية الآل والأصحاب" width={280} height={100} className={styles.logo} /></div>
          <div className={styles.yearBadge}><FiCalendar aria-hidden /><span>{text.foundation}</span></div>
        </div>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{text.eyebrow}</span>
          <h2>{text.title}</h2>
          <span className={styles.titleLine} aria-hidden />
          <p>{text.text}</p>
          <div className={styles.country}><span className={styles.countryDot} /><span>{text.country}</span></div>
          <Link className={styles.aboutLink} href="/about">{text.more}</Link>
        </div>
      </div>
    </section>
  );
}

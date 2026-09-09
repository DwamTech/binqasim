"use client";

import Link from "next/link";
import { FiArrowLeft, FiCalendar, FiMic, FiMoon, FiUsers } from "react-icons/fi";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./ActivitiesPreviewSection.module.css";

const copy = {
  ar: { kicker: "على مدار العام", title: "أنشطة تجمع المعرفة والتواصل", action: "جميع الأنشطة والفعاليات", items: [["اجتماعات الجمعية", "لقاءات تنظيمية تعزز جودة العمل.", FiUsers], ["البرامج الرمضانية", "مبادرات موسمية بروح مجتمعية.", FiMoon], ["الندوات واللقاءات", "مساحات للعلم والحوار والتوعية.", FiMic]] },
  en: { kicker: "Throughout the year", title: "Activities connecting knowledge and community", action: "All activities", items: [["Society meetings", "Organizational meetings that strengthen our work.", FiUsers], ["Ramadan programs", "Seasonal initiatives with a community spirit.", FiMoon], ["Seminars and events", "Spaces for knowledge and dialogue.", FiMic]] },
  fa: { kicker: "در طول سال", title: "فعالیت‌هایی برای دانش و ارتباط", action: "همه فعالیت‌ها", items: [["جلسات بنیاد", "جلسات سازمانی برای بهبود کار.", FiUsers], ["برنامه‌های رمضان", "طرح‌های فصلی و اجتماعی.", FiMoon], ["نشست‌ها", "فضایی برای دانش و گفت‌وگو.", FiMic]] },
};

export default function ActivitiesPreviewSection() {
  const { language } = useLanguage();
  const text = copy[language];
  return <section className={styles.section}><div className={styles.inner}><header><span><FiCalendar aria-hidden />{text.kicker}</span><h2>{text.title}</h2><Link href="/activities">{text.action}<FiArrowLeft aria-hidden /></Link></header><div className={styles.list}>{text.items.map(([title, description, Icon], index) => <article className={styles.item} key={title}><span className={styles.index}>{String(index + 1).padStart(2, "0")}</span><span className={styles.icon}><Icon aria-hidden /></span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></div></section>;
}

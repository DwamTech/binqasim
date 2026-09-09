"use client";

import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./ImpactSection.module.css";

const copy = {
  ar: { kicker: "أثر يمتد", title: "أرقام تختصر مسيرة من العمل والعطاء", text: "نعمل للإنسان ونبني جسور المحبة والمعرفة بخطوات مستمرة وأثر قابل للنمو.", stats: [["2006", "عام التأسيس"], ["+12", "مشروعًا خيريًا وعلميًا"], ["4", "مجالات للعمل المجتمعي"], ["7", "أيام لخدمة المستفيدين"]] },
  en: { kicker: "Lasting impact", title: "Numbers that reflect a journey of service", text: "We serve people and build bridges of knowledge through steady, sustainable work.", stats: [["2006", "Year established"], ["+12", "Charitable and educational projects"], ["4", "Community work areas"], ["7", "Days serving beneficiaries"]] },
  fa: { kicker: "اثری ماندگار", title: "اعدادی از مسیر خدمت و بخشش", text: "برای انسان و گسترش دانش با گام‌هایی پایدار تلاش می‌کنیم.", stats: [["2006", "سال تأسیس"], ["+12", "طرح خیریه و علمی"], ["4", "حوزه فعالیت اجتماعی"], ["7", "روز خدمت‌رسانی"]] },
};

export default function ImpactSection() {
  const { language } = useLanguage();
  const text = copy[language];
  return <section className={styles.section}><div className={styles.inner}><div className={styles.copy}><span>{text.kicker}</span><h2>{text.title}</h2><p>{text.text}</p></div><div className={styles.stats}>{text.stats.map(([value, label]) => <div className={styles.stat} key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></div></section>;
}

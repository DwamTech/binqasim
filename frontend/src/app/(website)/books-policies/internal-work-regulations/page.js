"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiDownload, FiFileText } from "react-icons/fi";
import styles from "./page.module.css";
import { useLanguage } from "../../../../contexts/LanguageContext";

const documentFile = "/internal-work-regulations.pdf";
const translations = {
  ar: { home: "الرئيسية", policies: "اللوائح والسياسات", short: "لائحة العمل الداخلية", eyebrow: "لائحة تنظيمية", title: "مسودة لائحة العمل الداخلية جمعية الآل والأصحاب", lead: "نسخة رقمية متاحة للقراءة المباشرة، تساعد على الوصول إلى إطار العمل الداخلي والإجراءات التنظيمية للجمعية بسهولة.", pdf: "صيغة PDF", draft: "مسودة عمل داخلية", read: "قراءة اللائحة", download: "تحميل الكتاب", society: "اجتماع فريق عمل جمعية الآل والأصحاب", type: "نوع المستند", internal: "لائحة داخلية", reader: "القارئ الرقمي", readerLead: "يمكنك تصفح المستند هنا أو تنزيل نسخة على جهازك.", fallback: "إذا لم يعمل القارئ على جهازك، افتح اللائحة في نافذة مستقلة.", open: "فتح اللائحة" },
  en: { home: "Home", policies: "Regulations and Policies", short: "Internal Work Regulations", eyebrow: "Organizational regulation", title: "Draft Internal Work Regulations of Aal & Al Ashab Society", lead: "A digital copy for direct reading, providing easy access to the Society’s internal framework and organizational procedures.", pdf: "PDF format", draft: "Internal draft", read: "Read regulation", download: "Download document", society: "Aal & Al Ashab Society team meeting", type: "Document type", internal: "Internal regulation", reader: "Digital reader", readerLead: "Browse the document here or download a copy to your device.", fallback: "If the reader does not work on your device, open the document in a separate window.", open: "Open regulation" },
  fa: { home: "خانه", policies: "آیین‌نامه‌ها و سیاست‌ها", short: "آیین‌نامه داخلی", eyebrow: "آیین‌نامه سازمانی", title: "پیش‌نویس آیین‌نامه داخلی بنیاد آل و اصحاب", lead: "نسخه‌ای دیجیتال برای مطالعه مستقیم و دسترسی آسان به چارچوب داخلی و رویه‌های سازمانی بنیاد.", pdf: "فرمت PDF", draft: "پیش‌نویس داخلی", read: "مطالعه آیین‌نامه", download: "دریافت سند", society: "جلسه تیم بنیاد آل و اصحاب", type: "نوع سند", internal: "آیین‌نامه داخلی", reader: "خوانشگر دیجیتال", readerLead: "سند را اینجا مرور کنید یا نسخه‌ای روی دستگاه خود دریافت کنید.", fallback: "اگر خوانشگر روی دستگاه شما کار نکرد، سند را در پنجره‌ای جدا باز کنید.", open: "باز کردن آیین‌نامه" },
};

export default function InternalWorkRegulationsPage() {
  const { language } = useLanguage();
  const text = translations[language];
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label={text.policies}>
            <Link href="/">{text.home}</Link><span>/</span><Link href="/books-policies">{text.policies}</Link><span>/</span><span aria-current="page">{text.short}</span>
          </nav>

          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}><FiBookOpen aria-hidden />{text.eyebrow}</span><h1>{text.title}</h1><p>{text.lead}</p>
              <div className={styles.meta}>
                <span><FiFileText aria-hidden />{text.pdf}</span><span>{text.draft}</span>
              </div>
              <div className={styles.actions}>
                <a href="#document-viewer" className={styles.primaryAction}>
                  {text.read} <FiArrowRight aria-hidden />
                </a>
                <a href={documentFile} download className={styles.secondaryAction}>
                  {text.download} <FiDownload aria-hidden />
                </a>
              </div>
            </div>

            <div className={styles.visualCard}>
              <Image
                src="/home-slider/WhatsApp-Image-2023-11-18-at-11.28.01-750x563.jpeg"
                alt={text.society}
                width={750}
                height={563}
                className={styles.visualImage}
                priority
              />
              <div className={styles.visualCaption}>
                <FiFileText aria-hidden />
                <div><span>{text.type}</span><strong>{text.internal}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.viewerSection} id="document-viewer">
        <div className={styles.container}>
          <header className={styles.viewerHeader}>
            <div>
              <span>{text.reader}</span><h2>{text.read}</h2><p>{text.readerLead}</p>
            </div>
            <a href={documentFile} download>
              <FiDownload aria-hidden />{text.download}
            </a>
          </header>

          <div className={styles.documentFrame}>
            <iframe src={`${documentFile}#view=FitH`} title={text.title} />
            <div className={styles.fallback}>
              <FiBookOpen aria-hidden />
              <p>{text.fallback}</p><a href={documentFile} target="_blank" rel="noreferrer">{text.open}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

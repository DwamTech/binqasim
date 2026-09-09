"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiBookOpen, FiDownload, FiFileText } from "react-icons/fi";
import styles from "./page.module.css";
import { useLanguage } from "../../../contexts/LanguageContext";

const policies = [
  {
    title: "مسودة لائحة العمل الداخلية جمعية الآل والأصحاب",
    image: "/home-slider/WhatsApp-Image-2023-11-18-at-11.28.01-750x563.jpeg",
    href: "/books-policies/internal-work-regulations",
    file: "/internal-work-regulations.pdf",
    type: "لائحة داخلية",
    category: "حوكمة وتنظيم",
    description:
      "وثيقة تنظيمية توضح إطار العمل الداخلي، وتدعم وضوح المسؤوليات والإجراءات داخل جمعية الآل والأصحاب.",
  },
];

const featuredPolicy = policies[0];
const translations = {
  ar: { society: "جمعية الآل والأصحاب", library: "مكتبة الجمعية", title: "اللوائح والسياسات", lead: "مرجع منظم للوائح والأنظمة التي تدعم الحوكمة وترتقي بأداء الجمعية.", available: "الإصدارات المتاحة", libraryTitle: "مكتبة اللوائح", browse: "تصفّح اللوائح مباشرة داخل الموقع أو نزّل نسخة للرجوع إليها لاحقًا.", release: "إصدار", policyTitle: "مسودة لائحة العمل الداخلية جمعية الآل والأصحاب", type: "لائحة داخلية", category: "حوكمة وتنظيم", description: "وثيقة تنظيمية توضح إطار العمل الداخلي والمسؤوليات والإجراءات داخل جمعية الآل والأصحاب.", direct: "قراءة مباشرة", open: "فتح اللائحة", download: "تحميل الكتاب" },
  en: { society: "Aal & Al Ashab Society", library: "Society library", title: "Regulations and Policies", lead: "An organized reference for regulations and policies supporting governance and the Society’s performance.", available: "Available publications", libraryTitle: "Regulations library", browse: "Read regulations on the website or download a copy for later reference.", release: "publication", policyTitle: "Draft Internal Work Regulations of Aal & Al Ashab Society", type: "Internal regulation", category: "Governance and organization", description: "An organizational document outlining the Society’s internal framework, responsibilities, and procedures.", direct: "Read online", open: "Open regulation", download: "Download document" },
  fa: { society: "بنیاد آل و اصحاب", library: "کتابخانه بنیاد", title: "آیین‌نامه‌ها و سیاست‌ها", lead: "مرجعی منظم برای مقررات و سیاست‌های پشتیبان حکمرانی و عملکرد بنیاد.", available: "انتشارات موجود", libraryTitle: "کتابخانه آیین‌نامه‌ها", browse: "آیین‌نامه را در وب‌سایت بخوانید یا نسخه‌ای برای مراجعه بعدی دریافت کنید.", release: "انتشار", policyTitle: "پیش‌نویس آیین‌نامه داخلی بنیاد آل و اصحاب", type: "آیین‌نامه داخلی", category: "حکمرانی و سازمان‌دهی", description: "سندی سازمانی برای توضیح چارچوب داخلی، مسئولیت‌ها و رویه‌های بنیاد.", direct: "مطالعه آنلاین", open: "باز کردن آیین‌نامه", download: "دریافت سند" },
};

export default function BooksPoliciesPage() {
  const { language } = useLanguage();
  const text = translations[language];
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image
          src={featuredPolicy.image}
          alt={text.society}
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}><FiBookOpen aria-hidden />{text.library}</span>
          <h1>{text.title}</h1><p>{text.lead}</p>
        </div>
      </section>

      <section className={styles.librarySection}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <div>
              <span>{text.available}</span><h2>{text.libraryTitle}</h2><p>{text.browse}</p>
            </div>
            <span className={styles.itemsCount}>
              {String(policies.length).padStart(2, "0")} {text.release}
            </span>
          </header>

          <div className={styles.policiesGrid}>
            {policies.map((policy, index) => (
              <article className={styles.policyCard} key={policy.href}>
                <Link href={policy.href} className={styles.imageWrap} aria-label={text.open}>
                  <Image
                    src={policy.image}
                    alt={text.policyTitle}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 992px) 50vw, 33vw"
                    className={styles.cardImage}
                  />
                  <span className={styles.imageBadge}><FiFileText aria-hidden />{text.type}</span>
                  <span className={styles.imageNumber}>{String(index + 1).padStart(2, "0")}</span>
                </Link>

                <div className={styles.cardContent}>
                  <span className={styles.cardKicker}>{text.category}</span><h3><Link href={policy.href}>{text.policyTitle}</Link></h3><p>{text.description}</p>
                  <div className={styles.cardMeta}>
                    <span><FiBookOpen aria-hidden />{text.direct}</span>
                    <span><FiFileText aria-hidden />PDF</span>
                  </div>
                  <div className={styles.cardActions}>
                    <Link href={policy.href} className={styles.openButton}>
                      {text.open}
                      <FiArrowLeft aria-hidden />
                    </Link>
                    <a href={policy.file} download className={styles.downloadButton}>
                      {text.download}
                      <FiDownload aria-hidden />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

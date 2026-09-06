import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiDownload, FiFileText } from "react-icons/fi";
import styles from "./page.module.css";

export const metadata = {
  title: "مسودة لائحة العمل الداخلية | وقف عبد الله بن قاسم",
  description: "قراءة وتحميل مسودة لائحة العمل الداخلية لوقف عبد الله بن قاسم.",
};

const documentFile = "/internal-work-regulations.pdf";

export default function InternalWorkRegulationsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="مسار التنقل">
            <Link href="/">الرئيسية</Link><span>/</span>
            <Link href="/books-policies">اللوائح والسياسات</Link><span>/</span>
            <span aria-current="page">لائحة العمل الداخلية</span>
          </nav>

          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}><FiBookOpen aria-hidden />لائحة تنظيمية</span>
              <h1>مسودة لائحة العمل الداخلية وقف عبدالله بن قاسم</h1>
              <p>
                نسخة رقمية متاحة للقراءة المباشرة، تساعد على الوصول إلى إطار
                العمل الداخلي والإجراءات التنظيمية للوقف بسهولة.
              </p>
              <div className={styles.meta}>
                <span><FiFileText aria-hidden />صيغة PDF</span>
                <span>مسودة عمل داخلية</span>
              </div>
              <div className={styles.actions}>
                <a href="#document-viewer" className={styles.primaryAction}>
                  قراءة اللائحة <FiArrowRight aria-hidden />
                </a>
                <a href={documentFile} download className={styles.secondaryAction}>
                  تحميل الكتاب <FiDownload aria-hidden />
                </a>
              </div>
            </div>

            <div className={styles.visualCard}>
              <Image
                src="/home-slider/WhatsApp-Image-2023-11-18-at-11.28.01-750x563.jpeg"
                alt="اجتماع فريق عمل وقف عبد الله بن قاسم"
                width={750}
                height={563}
                className={styles.visualImage}
                priority
              />
              <div className={styles.visualCaption}>
                <FiFileText aria-hidden />
                <div><span>نوع المستند</span><strong>لائحة داخلية</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.viewerSection} id="document-viewer">
        <div className={styles.container}>
          <header className={styles.viewerHeader}>
            <div>
              <span>القارئ الرقمي</span>
              <h2>قراءة اللائحة</h2>
              <p>يمكنك تصفح المستند هنا أو تنزيل نسخة على جهازك.</p>
            </div>
            <a href={documentFile} download>
              <FiDownload aria-hidden />تحميل الكتاب
            </a>
          </header>

          <div className={styles.documentFrame}>
            <iframe src={`${documentFile}#view=FitH`} title="مسودة لائحة العمل الداخلية" />
            <div className={styles.fallback}>
              <FiBookOpen aria-hidden />
              <p>إذا لم يعمل القارئ على جهازك، افتح اللائحة في نافذة مستقلة.</p>
              <a href={documentFile} target="_blank" rel="noreferrer">فتح اللائحة</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

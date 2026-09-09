import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiBookOpen, FiDownload, FiFileText } from "react-icons/fi";
import styles from "./page.module.css";

export const metadata = {
  title: "اللوائح والسياسات | وقف عبد الله بن قاسم",
  description: "مكتبة اللوائح والسياسات والكتب الخاصة بوقف عبد الله بن قاسم آل ثاني.",
};

const policies = [
  {
    title: "مسودة لائحة العمل الداخلية وقف عبدالله بن قاسم",
    image: "/home-slider/WhatsApp-Image-2023-11-18-at-11.28.01-750x563.jpeg",
    href: "/books-policies/internal-work-regulations",
    file: "/internal-work-regulations.pdf",
    type: "لائحة داخلية",
    category: "حوكمة وتنظيم",
    description:
      "وثيقة تنظيمية توضح إطار العمل الداخلي، وتدعم وضوح المسؤوليات والإجراءات داخل وقف عبد الله بن قاسم.",
  },
];

const featuredPolicy = policies[0];

export default function BooksPoliciesPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image
          src={featuredPolicy.image}
          alt="اجتماع فريق عمل وقف عبد الله بن قاسم"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}><FiBookOpen aria-hidden />مكتبة الوقف</span>
          <h1>اللوائح والسياسات</h1>
          <p>مرجع منظم للوائح والأنظمة التي تدعم الحوكمة وترتقي بأداء الوقف.</p>
        </div>
      </section>

      <section className={styles.librarySection}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <div>
              <span>الإصدارات المتاحة</span>
              <h2>مكتبة اللوائح</h2>
              <p>تصفّح اللوائح مباشرة داخل الموقع أو نزّل نسخة للرجوع إليها لاحقًا.</p>
            </div>
            <span className={styles.itemsCount}>
              {String(policies.length).padStart(2, "0")} إصدار
            </span>
          </header>

          <div className={styles.policiesGrid}>
            {policies.map((policy, index) => (
              <article className={styles.policyCard} key={policy.href}>
                <Link href={policy.href} className={styles.imageWrap} aria-label={`فتح ${policy.title}`}>
                  <Image
                    src={policy.image}
                    alt={policy.title}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 992px) 50vw, 33vw"
                    className={styles.cardImage}
                  />
                  <span className={styles.imageBadge}><FiFileText aria-hidden />{policy.type}</span>
                  <span className={styles.imageNumber}>{String(index + 1).padStart(2, "0")}</span>
                </Link>

                <div className={styles.cardContent}>
                  <span className={styles.cardKicker}>{policy.category}</span>
                  <h3><Link href={policy.href}>{policy.title}</Link></h3>
                  <p>{policy.description}</p>
                  <div className={styles.cardMeta}>
                    <span><FiBookOpen aria-hidden />قراءة مباشرة</span>
                    <span><FiFileText aria-hidden />PDF</span>
                  </div>
                  <div className={styles.cardActions}>
                    <Link href={policy.href} className={styles.openButton}>
                      فتح اللائحة
                      <FiArrowLeft aria-hidden />
                    </Link>
                    <a href={policy.file} download className={styles.downloadButton}>
                      تحميل الكتاب
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

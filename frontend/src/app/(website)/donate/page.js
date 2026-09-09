import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiGlobe, FiHash, FiHeart } from "react-icons/fi";
import styles from "./page.module.css";

export const metadata = {
  title: "للتبرع | جمعية الآل والأصحاب",
  description: "بيانات الحسابات المصرفية المعتمدة للتبرع لصالح جمعية الآل والأصحاب في مملكة البحرين.",
};

const bankAccounts = [
  {
    bank: "بنك الإثمار",
    account: "507030096880011",
    iban: "BH76FIBH07030096880011",
    swift: "FIBHBHBM",
  },
  {
    bank: "بنك البحرين الإسلامي",
    account: "100000111271",
    iban: "BH18BIBB00100000111271",
    swift: "BIBBBHBM",
  },
  {
    bank: "بنك البحرين والكويت",
    account: "100000223884",
    iban: "BH09BBKU00100000223884",
    swift: "BBKUBHBM",
  },
];

export default function DonatePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image src="/aal-alashab-hero.webp" alt="" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}><FiHeart aria-hidden /> عطاء يصنع أثرًا</span>
            <h1>للتبرع</h1>
            <p>ساهموا معنا في دعم رسالة جمعية الآل والأصحاب وبرامجها المجتمعية والعلمية.</p>
            <a href="#bank-accounts" className={styles.heroButton}>بيانات الحسابات <FiArrowLeft aria-hidden /></a>
          </div>
        </div>
      </section>

      <section className={styles.donationSection} id="bank-accounts">
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <span>التحويل المصرفي</span>
            <h2>الحسابات المصرفية المعتمدة</h2>
            <p>للتبرع لصالح جمعية الآل والأصحاب في مملكة البحرين، يُرجى التحويل المصرفي على أحد الحسابات التالية:</p>
          </header>

          <div className={styles.accountsGrid}>
            {bankAccounts.map((item, index) => (
              <article className={styles.bankCard} key={item.iban}>
                <div className={styles.cardHead}>
                  <span className={styles.bankIcon}><FiCreditCard aria-hidden /></span>
                  <div><small>حساب معتمد</small><h3>{item.bank}</h3></div>
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                </div>
                <dl className={styles.accountDetails}>
                  <div><dt><FiHash aria-hidden /> رقم الحساب</dt><dd dir="ltr">{item.account}</dd></div>
                  <div className={styles.ibanRow}><dt><FiGlobe aria-hidden /> رقم التحويل الدولي (IBAN)</dt><dd dir="ltr">{item.iban}</dd></div>
                  <div><dt><FiCheckCircle aria-hidden /> رمز السويفت</dt><dd dir="ltr">{item.swift}</dd></div>
                </dl>
              </article>
            ))}
          </div>

          <section className={styles.bankGallery} aria-labelledby="bank-gallery-title">
            <header><span>طرق التبرع</span><h2 id="bank-gallery-title">بيانات التحويل في صورة واضحة</h2></header>
            <div className={styles.galleryGrid}>
              <a href="/WhatsApp-Image-2021-02-16-at-8.45.01-PM-1024x754.jpeg" target="_blank" rel="noopener noreferrer"><Image src="/WhatsApp-Image-2021-02-16-at-8.45.01-PM-1024x754.jpeg" alt="بيانات حسابات التبرع لجمعية الآل والأصحاب" fill sizes="(max-width: 720px) 100vw, 50vw" /></a>
              <a href="/WhatsApp-Image-2021-02-16-at-8.47.54-PM-1024x754.jpeg" target="_blank" rel="noopener noreferrer"><Image src="/WhatsApp-Image-2021-02-16-at-8.47.54-PM-1024x754.jpeg" alt="وسائل التبرع لجمعية الآل والأصحاب" fill sizes="(max-width: 720px) 100vw, 50vw" /></a>
            </div>
          </section>

          <aside className={styles.portalPanel}>
            <div><span>منصة العطاء</span><h2>اختر مشروعك وساهم بما تستطيع</h2><p>استعرض مشاريع الجمعية الخيرية واختر المجال الأقرب إلى قلبك.</p></div>
            <div className={styles.portalActions}>
              <Link href="/donations/projects">عرض مشاريع التبرع <FiArrowLeft aria-hidden /></Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

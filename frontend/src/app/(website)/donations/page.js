import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiHeart, FiShield, FiUsers } from "react-icons/fi";
import styles from "./page.module.css";

export const metadata = { title: "منصة التبرع | جمعية الآل والأصحاب", description: "ساهم في مشاريع جمعية الآل والأصحاب الخيرية." };

export default function DonationsHomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image src="/aal-alashab-hero.webp" alt="" fill priority sizes="100vw" />
        <div className={styles.heroShade} />
        <div className={styles.container}><div className={styles.heroCopy}><span><FiHeart /> منصة العطاء</span><h1>تبرعك يصنع فرقًا حقيقيًا</h1><p>اختر أحد مشاريع الجمعية وساهم في إيصال الدعم إلى مستحقيه في مملكة البحرين.</p><div className={styles.heroActions}><Link href="/donations/projects">استعرض المشاريع <FiArrowLeft /></Link><Link href="/donate">التحويل المصرفي</Link></div></div></div>
      </section>

      <section className={styles.features}><div className={styles.container}><header className={styles.sectionTitle}><span>أثر مستدام</span><h2>معًا نوسّع دائرة الخير</h2><p>تعمل الجمعية على تنفيذ برامج اجتماعية وعلمية متنوعة وفق الاحتياجات والأولويات المعتمدة.</p></header><div className={styles.featureGrid}><article><FiUsers /><h3>رعاية الأسر</h3><p>مساندة الأسر المحتاجة وتخفيف الأعباء المعيشية عنها.</p></article><article><FiShield /><h3>مساعدات موثوقة</h3><p>توجيه الدعم إلى المشاريع الخيرية المعتمدة لدى الجمعية.</p></article><article><FiHeart /><h3>عطاء مرن</h3><p>يمكنك اختيار المشروع والمساهمة بالمبلغ الذي يناسبك.</p></article></div></div></section>

      <section className={styles.featured}><div className={`${styles.container} ${styles.featuredGrid}`}><div className={styles.featuredImage}><Image src="/WhatsApp-Image-2021-02-16-at-8.47.54-PM-1024x754.jpeg" alt="التبرع لجمعية الآل والأصحاب" fill sizes="(max-width: 760px) 100vw, 48vw" /></div><div><span>مشروع مميز</span><h2>المساعدات العلاجية</h2><p>يساهم المشروع في تغطية تكاليف العلاج والأدوية والعمليات الجراحية للحالات غير القادرة ماديًا، بالتنسيق مع الجهات الصحية المختصة.</p><Link href="/donations/projects/medicine-aids">تفاصيل المشروع <FiArrowLeft /></Link></div></div></section>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiCheckCircle, FiHeart } from "react-icons/fi";
import styles from "../../page.module.css";

export const metadata = { title: "المساعدات العلاجية | جمعية الآل والأصحاب", description: "ساهم في مشروع المساعدات العلاجية." };

export default function MedicineAidsPage() {
  return <main className={styles.page}><section className={styles.productSection}><div className={styles.container}><nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/donations">منصة التبرع</Link><span>/</span><Link href="/donations/projects">المشاريع</Link><span>/</span><span>المساعدات العلاجية</span></nav><div className={styles.productGrid}><div className={styles.productImage}><Image src="/aal-alashab-hero.webp" alt="مشروع المساعدات العلاجية" fill priority sizes="(max-width: 820px) 100vw, 45vw" /></div><article className={styles.productCopy}><span>المشاريع الخيرية</span><h1>المساعدات العلاجية</h1><p>يساهم هذا المشروع في تغطية تكاليف العلاج والأدوية والعمليات الجراحية للحالات غير القادرة ماديًا، بالتنسيق مع الجهات الصحية المختصة.</p><div className={styles.price}><strong>1.000</strong><small>د.ب حد أدنى</small></div><div className={styles.donationBox}><label>اختر قيمة مساهمتك</label><div className={styles.amounts}><span>1 د.ب</span><span>5 د.ب</span><span>10 د.ب</span><span>25 د.ب</span></div><Link className={styles.donateButton} href="/donate#bank-accounts">متابعة التبرع عبر الحسابات المصرفية <FiArrowLeft /></Link><div className={styles.donationNote}><FiCheckCircle aria-hidden /> سيتم توجيهك إلى بيانات الحسابات المصرفية المعتمدة داخل الموقع.</div></div></article></div></div></section></main>;
}

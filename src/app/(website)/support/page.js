import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import SupportTabs from "@/components/SupportTabs";
import styles from "./page.module.css";

export default function SupportPage() {
  return (
    <main className={styles.main}>
      <HeroSection
        title="طلبات الدعم"
        imageSrc="/ffdsfdf.webp"
        imageAlt="طلبات الدعم"
        align="center"
      />
      <section className={styles.actions}>
        <div className={styles.actionCard}>
          <h2 className={styles.actionTitle}>تحقق من طلبك</h2>
          <p className={styles.actionText}>يمكنك متابعة حالة الطلب الخاص بك باستخدام رقم الطلب ورقم الجوال.</p>
          <Link href="/support/check" className={styles.checkBtn}>تحقق من طلبك الآن</Link>
        </div>
      </section>
      <SupportTabs />
    </main>
  );
}

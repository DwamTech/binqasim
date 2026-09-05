import HeroSection from "../../../../components/HeroSection";
import styles from "../reports.module.css";

export const metadata = {
  title: "التقارير السنوية | وقف الصالح الخيري",
};

export default function AnnualReportsPage() {
  return (
    <div className={styles.page}>
      <HeroSection
        title="التـقـاريـر السـنـويـة"
        imageSrc="/باب_وكسوة_الكعبة.jpg"
        imageAlt="باب وكسوة الكعبة"
        align="center"
      />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.actions}>
            <button type="button" className={styles.actionBtn}>عنوان القسم</button>
            <button type="button" className={styles.actionBtn}>عنوان القسم</button>
          </div>
        </div>
      </section>
    </div>
  );
}

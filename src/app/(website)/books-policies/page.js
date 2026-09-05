"use client";
import HeroSection from "../../../components/HeroSection";
import PolicyCard from "../../../components/PolicyCard";
import styles from "./page.module.css";

export default function BooksPoliciesPage() {
  const items = [
    { title: "لائحة إدارة المخاطر وقف الصالح الخيري", src: "/card-a-1.jpg" },
    { title: "لائحة المستنفر - وقف الصالح", src: "/card-a-1.jpg" },
    { title: "لائحة تنظيم أعمال التجارة وقف الصالح", src: "/card-a-1.jpg" },
    { title: "لائحة الاستثمار والأصول - وقف الصالح", src: "/card-a-1.jpg" },
    { title: "لائحة الحوكمة والشفافية - وقف الصالح", src: "/card-a-1.jpg" },
    { title: "لائحة التدقيق والالتزام - وقف الصالح", src: "/card-a-1.jpg" },
  ];

  return (
    <main className={styles.main}>
      <HeroSection
        title="الكتب / اللوائح والسياسات"
        imageSrc="/باب_وكسوة_الكعبة.jpg"
        imageAlt="الكتب واللوائح والسياسات"
        align="start"

      />
      <section className={styles.cardsSection}>
        <div className={styles.cardsInner}>
          <h2 className={styles.sectionTitle}>اللوائح والسياسات</h2>
          <div className={styles.grid}>
            {items.map((it, idx) => (
              <PolicyCard key={idx} imageSrc={it.src} title={it.title} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import CheckForm from "@/components/SupportCheckForm";
import HeroSection from "@/components/HeroSection";
import styles from "./page.module.css";

export default function SupportCheckPage() {
  return (
    <main className={styles.main}>
      <HeroSection
        title="تحقق من طلبك"
        imageSrc="/75884be2-3e9d-4126-ace3-770ef0c2f071_16x9_1200x676.webp"
        imageAlt="تحقق من طلبك"
        align="center"
      />
      <CheckForm />
    </main>
  );
}

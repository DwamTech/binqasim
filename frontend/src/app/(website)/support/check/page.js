"use client";

import CheckForm from "@/components/SupportCheckForm";
import HeroSection from "@/components/HeroSection";
import styles from "./page.module.css";
import { useLanguage } from "../../../../contexts/LanguageContext";

export default function SupportCheckPage() {
  const { language } = useLanguage();
  const title = { ar: "تحقق من طلبك", en: "Check Your Request", fa: "پیگیری درخواست" }[language];
  return (
    <main className={styles.main}>
      <HeroSection
        title={title}
        imageSrc="/75884be2-3e9d-4126-ace3-770ef0c2f071_16x9_1200x676.webp"
        imageAlt={title}
        align="center"
      />
      <CheckForm />
    </main>
  );
}

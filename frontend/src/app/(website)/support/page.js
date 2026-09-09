"use client";

import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import SupportTabs from "@/components/SupportTabs";
import styles from "./page.module.css";
import { useLanguage } from "../../../contexts/LanguageContext";

const translations = {
  ar: { title: "طلبات الدعم", check: "تحقق من طلبك", lead: "يمكنك متابعة حالة الطلب الخاص بك باستخدام رقم الطلب ورقم الجوال.", action: "تحقق من طلبك الآن" },
  en: { title: "Support Requests", check: "Check your request", lead: "Track your application status using the request number and your mobile number.", action: "Check your request now" },
  fa: { title: "درخواست‌های حمایت", check: "پیگیری درخواست", lead: "با شماره درخواست و شماره همراه، وضعیت درخواست خود را پیگیری کنید.", action: "اکنون پیگیری کنید" },
};

export default function SupportPage() {
  const { language } = useLanguage();
  const text = translations[language];
  return (
    <main className={styles.main}>
      <HeroSection
        title={text.title}
        imageSrc="/ffdsfdf.webp"
        imageAlt={text.title}
        align="center"
      />
      <section className={styles.actions}>
        <div className={styles.actionCard}>
          <h2 className={styles.actionTitle}>{text.check}</h2><p className={styles.actionText}>{text.lead}</p><Link href="/support/check" className={styles.checkBtn}>{text.action}</Link>
        </div>
      </section>
      <SupportTabs />
    </main>
  );
}

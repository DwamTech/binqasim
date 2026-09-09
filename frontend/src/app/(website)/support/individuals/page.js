"use client";

import Image from "next/image";
import Link from "next/link";
import { FiCheckCircle, FiFileText, FiHome, FiLock, FiUser } from "react-icons/fi";
import SupportTabs from "../../../../components/SupportTabs";
import { useLanguage } from "../../../../contexts/LanguageContext";
import styles from "./page.module.css";

const translations = {
  ar: { home: "الرئيسية", requests: "طلبات الدعم", individuals: "دعم الأفراد", portal: "بوابة الدعم", title: "تقديم طلب", accent: "دعم فردي", lead: "املأ بيانات الطلب بدقة وأرفق المستندات المطلوبة، وسيقوم فريق الجمعية بمراجعتها والتواصل معك.", start: "ابدأ تقديم الطلب", safe: "بياناتك بأمان", safeText: "تُستخدم معلوماتك لمراجعة الطلب فقط", enter: "أدخل بياناتك", enterText: "تأكد من صحة المعلومات", attach: "أرفق المستندات", attachText: "بصيغة واضحة ومقروءة", send: "أرسل بأمان", sendText: "واحتفظ برقم الطلب", new: "طلب جديد", data: "بيانات طلب الدعم", required: "الحقول المعلّمة بعلامة النجمة إلزامية لإتمام إرسال الطلب.", society: "جمعية الآل والأصحاب" },
  en: { home: "Home", requests: "Support requests", individuals: "Individual support", portal: "Support portal", title: "Submit an", accent: "individual support request", lead: "Complete the form accurately and attach the required documents. The Society’s team will review them and contact you.", start: "Start application", safe: "Your data is secure", safeText: "Your information is used only to review the application", enter: "Enter your details", enterText: "Make sure the information is correct", attach: "Attach documents", attachText: "Use clear, readable files", send: "Submit securely", sendText: "Keep your request number", new: "New request", data: "Support request details", required: "Fields marked with an asterisk are required to submit the request.", society: "Aal & Al Ashab Society" },
  fa: { home: "خانه", requests: "درخواست‌های حمایت", individuals: "حمایت از افراد", portal: "درگاه حمایت", title: "ثبت درخواست", accent: "حمایت فردی", lead: "اطلاعات را دقیق تکمیل و مدارک لازم را پیوست کنید؛ تیم بنیاد آن‌ها را بررسی کرده و با شما تماس می‌گیرد.", start: "شروع درخواست", safe: "اطلاعات شما امن است", safeText: "اطلاعات تنها برای بررسی درخواست استفاده می‌شود", enter: "اطلاعات را وارد کنید", enterText: "از درستی اطلاعات مطمئن شوید", attach: "مدارک را پیوست کنید", attachText: "با کیفیت روشن و خوانا", send: "ارسال امن", sendText: "شماره درخواست را نگه دارید", new: "درخواست جدید", data: "اطلاعات درخواست حمایت", required: "فیلدهای دارای ستاره برای ارسال درخواست الزامی هستند.", society: "بنیاد آل و اصحاب" },
};

export default function IndividualSupportPage() {
  const { language } = useLanguage();
  const text = translations[language];
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image className={styles.heroImage} src="/aal-alashab-hero.webp" alt={text.society} fill priority sizes="100vw" />
        <div className={styles.overlay} />
        <div className={styles.pattern} aria-hidden />
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumbs} aria-label={text.requests}><Link href="/"><FiHome aria-hidden />{text.home}</Link><span>/</span><Link href="/support">{text.requests}</Link><span>/</span><span>{text.individuals}</span></nav>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}><FiUser aria-hidden />{text.portal}</span>
            <h1>{text.title} <span>{text.accent}</span></h1>
            <p>{text.lead}</p>
            <a href="#individual-application">{text.start} <FiFileText aria-hidden /></a>
          </div>
          <div className={styles.trustCard}>
            <FiLock aria-hidden />
            <div><strong>{text.safe}</strong><span>{text.safeText}</span></div>
          </div>
        </div>
      </section>

      <section className={styles.guide}>
        <div className={styles.guideInner}>
          <div><FiCheckCircle aria-hidden /><span><strong>{text.enter}</strong><small>{text.enterText}</small></span></div>
          <i aria-hidden />
          <div><FiFileText aria-hidden /><span><strong>{text.attach}</strong><small>{text.attachText}</small></span></div>
          <i aria-hidden />
          <div><FiLock aria-hidden /><span><strong>{text.send}</strong><small>{text.sendText}</small></span></div>
        </div>
      </section>

      <section className={styles.formSection} id="individual-application">
        <header className={styles.formHeader}>
          <span>{text.new}</span>
          <h2>{text.data}</h2>
          <p>{text.required}</p>
        </header>
        <SupportTabs initialTab="individual" showTabs={false} />
      </section>
    </main>
  );
}

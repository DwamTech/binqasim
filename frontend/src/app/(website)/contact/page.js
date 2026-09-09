"use client";

import Link from "next/link";
import { FiClock, FiHome, FiMail, FiMapPin, FiNavigation, FiPhone } from "react-icons/fi";
import { HiOutlineInbox } from "react-icons/hi";
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from "./page.module.css";

const translations = {
  ar: {
    home: "الرئيسية", contact: "اتصل بنا", eyebrow: "نحن بالقرب منك", title: "تواصل معنا بسهولة", lead: "يسعد فريق جمعية الآل والأصحاب باستقبال استفساراتكم والتواصل معكم خلال مواقيت الدوام الرسمية.",
    addressLabel: "العنوان", address: "مملكة البحرين - الرفاع الشرقي (الحجيات) - مجمع: 929 - طريق: 2914 - مبنى: 686أ", mailbox: "صندوق البريد", phone: "رقم الهاتف", email: "البريد الإلكتروني", openMap: "فتح الموقع على الخريطة", call: "اتصل الآن", send: "إرسال بريد إلكتروني",
    hoursEyebrow: "أوقات التواصل", hoursTitle: "مواقيت الدوام واستقبال الزوار", morning: "الفترة الصباحية", morningTime: "من الساعة 9:00 إلى الساعة 1:00", evening: "الفترة المسائية", eveningTime: "من الساعة 5:00 إلى الساعة 9:00", schedule: "طوال أيام الأسبوع، عدا يوم الخميس حيث نتواجد خلال الفترة الصباحية فقط، ويوم الجمعة عطلة كاملة، إضافة إلى العطل والإجازات الرسمية المقررة من قبل الحكومة.", mapTitle: "موقع الجمعية", mapLead: "الرفاع الشرقي - الحجيات، مملكة البحرين",
  },
  en: {
    home: "Home", contact: "Contact Us", eyebrow: "We are close to you", title: "Get in touch easily", lead: "The Aal & Al Ashab Society team is pleased to receive your inquiries during official working hours.",
    addressLabel: "Address", address: "Kingdom of Bahrain — East Riffa (Al Hajiyat), Block 929, Road 2914, Building 686A", mailbox: "P.O. Box", phone: "Phone number", email: "Email address", openMap: "Open in Maps", call: "Call now", send: "Send an email",
    hoursEyebrow: "Contact times", hoursTitle: "Working and Visitor Hours", morning: "Morning period", morningTime: "9:00 AM to 1:00 PM", evening: "Evening period", eveningTime: "5:00 PM to 9:00 PM", schedule: "We are available throughout the week, except Thursday when only the morning period is available, and Friday which is a full holiday, as well as official public holidays declared by the government.", mapTitle: "Society location", mapLead: "East Riffa — Al Hajiyat, Kingdom of Bahrain",
  },
  fa: {
    home: "خانه", contact: "تماس با ما", eyebrow: "در نزدیکی شما هستیم", title: "آسان با ما در تماس باشید", lead: "تیم بنیاد آل و اصحاب در ساعات رسمی کاری از پرسش‌ها و تماس‌های شما استقبال می‌کند.",
    addressLabel: "نشانی", address: "پادشاهی بحرین — الرفاع شرقی (الحجیات)، مجتمع 929، خیابان 2914، ساختمان 686A", mailbox: "صندوق پستی", phone: "شماره تلفن", email: "ایمیل", openMap: "نمایش روی نقشه", call: "تماس بگیرید", send: "ارسال ایمیل",
    hoursEyebrow: "زمان‌های ارتباط", hoursTitle: "ساعات کاری و پذیرش مراجعان", morning: "نوبت صبح", morningTime: "از ساعت 9:00 تا 1:00", evening: "نوبت عصر", eveningTime: "از ساعت 5:00 تا 9:00", schedule: "در تمام روزهای هفته در خدمت شما هستیم؛ پنجشنبه فقط نوبت صبح، جمعه تعطیل کامل و همچنین تعطیلات رسمی اعلام‌شده از سوی دولت تعطیل است.", mapTitle: "موقعیت بنیاد", mapLead: "الرفاع شرقی — الحجیات، پادشاهی بحرین",
  },
};

const mapUrl = "https://maps.google.com/?q=26.0978,50.5551";

export default function ContactPage() {
  const { language } = useLanguage();
  const text = translations[language];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label={text.contact}><Link href="/"><FiHome aria-hidden />{text.home}</Link><span>/</span><span>{text.contact}</span></nav>
          <div className={styles.heroContent}><span className={styles.eyebrow}><FiMail aria-hidden />{text.eyebrow}</span><h1>{text.title}</h1><p>{text.lead}</p></div>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            <article className={`${styles.infoCard} ${styles.addressCard}`}>
              <span className={styles.cardIcon}><FiMapPin aria-hidden /></span><div><span>{text.addressLabel}</span><strong>{text.address}</strong><a href={mapUrl} target="_blank" rel="noopener noreferrer">{text.openMap}<FiNavigation aria-hidden /></a></div>
            </article>
            <article className={styles.infoCard}><span className={styles.cardIcon}><HiOutlineInbox aria-hidden /></span><div><span>{text.mailbox}</span><strong dir="ltr">39104</strong></div></article>
            <article className={styles.infoCard}><span className={styles.cardIcon}><FiPhone aria-hidden /></span><div><span>{text.phone}</span><strong dir="ltr">+973 17774001</strong><a href="tel:+97317774001">{text.call}</a></div></article>
            <article className={styles.infoCard}><span className={styles.cardIcon}><FiMail aria-hidden /></span><div><span>{text.email}</span><strong dir="ltr">tawasul.aalalashab@gmail.com</strong><a href="mailto:tawasul.aalalashab@gmail.com">{text.send}</a></div></article>
          </div>

          <div className={styles.hoursLayout}>
            <article className={styles.hoursCard}>
              <header><span className={styles.clock}><FiClock aria-hidden /></span><div><small>{text.hoursEyebrow}</small><h2>{text.hoursTitle}</h2></div></header>
              <div className={styles.periods}><div><span>{text.morning}</span><strong>{text.morningTime}</strong></div><i aria-hidden /><div><span>{text.evening}</span><strong>{text.eveningTime}</strong></div></div>
              <p>{text.schedule}</p>
            </article>
            <article className={styles.mapCard}>
              <iframe title={text.mapTitle} src="https://www.google.com/maps?q=26.0978,50.5551&z=16&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              <div><span><FiMapPin aria-hidden /></span><p><strong>{text.mapTitle}</strong><small>{text.mapLead}</small></p><a href={mapUrl} target="_blank" rel="noopener noreferrer"><FiNavigation aria-hidden /></a></div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

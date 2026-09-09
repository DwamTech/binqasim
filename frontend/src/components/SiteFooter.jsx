"use client";

import Image from "next/image";
import Link from "next/link";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaApple, FaFacebookF, FaGooglePlay, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "./SiteFooter.module.css";

const appStoreUrl = "https://apps.apple.com/bh/app/%D8%A7%D9%84%D8%A2%D9%84-%D9%88%D8%A7%D9%84%D8%A3%D8%B5%D8%AD%D8%A7%D8%A8/id1482430790";
const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.alalwalashab.alalwalashab&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1&pli=1";

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/aalashab.bh", Icon: FaFacebookF },
  { label: "X", href: "https://x.com/aalashab_bh/status/1891534428792377835", Icon: FaXTwitter },
  { label: "YouTube", href: "https://www.youtube.com/@aalashab_bh/videos", Icon: FaYoutube },
  { label: "Instagram", href: "https://www.instagram.com/aalashab_bh/", Icon: FaInstagram },
];

const content = {
  ar: {
    about: "عن الجمعية",
    description: "تأسست الجمعية في مملكة البحرين بقرار من وزارة التنمية الاجتماعية رقم (32) لسنة 2006م؛ وقد تم إشهارها وتسجيلها بموجب قرار وزيرة التنمية الاجتماعية تحت رقم 25/ج/أح.ح باسم (جمعية الآل والأصحاب).",
    social: "تابعنا على",
    endorsement: "تزكية الشيخ عثمان الخميس للجمعية",
    video: "فيديو تزكية الشيخ عثمان الخميس لجمعية الآل والأصحاب",
    app: "تحميل التطبيق",
    appName: "دفاعاً عن الآل والأصحاب",
    appText: "محتوى معرفي موثوق بين يديك أينما كنت.",
    contact: "تواصل معنا",
    address: "مملكة البحرين - الرفاع الشرقي (الحجيات) - مجمع 929 - طريق 2914 - مبنى 686أ",
    privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
    credit: "تصميم وتطوير شركة",
  },
  en: {
    about: "About the Society",
    description: "The Society was founded in the Kingdom of Bahrain by Ministry of Social Development Resolution No. 32 of 2006 and registered under Resolution No. 25/J/AH.H as Aal & Al Ashab Society.",
    social: "Follow us",
    endorsement: "Sheikh Othman Al-Khamees endorses the Society",
    video: "Sheikh Othman Al-Khamees endorsement of Aal & Al Ashab Society",
    app: "Download the app",
    appName: "In Defense of Aal & Al Ashab",
    appText: "Trusted knowledge with you wherever you go.",
    contact: "Contact us",
    address: "Kingdom of Bahrain — East Riffa (Al Hajiyat), Block 929, Road 2914, Building 686A",
    privacy: "Privacy policy",
    terms: "Terms and conditions",
    credit: "Designed and developed by",
  },
  fa: {
    about: "درباره بنیاد",
    description: "این بنیاد در پادشاهی بحرین به موجب مصوبه شماره ۳۲ سال ۲۰۰۶ وزارت توسعه اجتماعی تأسیس و با شماره ۲۵/ج/أح.ح به نام بنیاد آل و اصحاب ثبت شد.",
    social: "ما را دنبال کنید",
    endorsement: "تأیید بنیاد توسط شیخ عثمان الخمیس",
    video: "ویدیوی تأیید بنیاد آل و اصحاب توسط شیخ عثمان الخمیس",
    app: "دریافت برنامه",
    appName: "دفاع از آل و اصحاب",
    appText: "دانشی معتبر، همیشه همراه شما.",
    contact: "تماس با ما",
    address: "پادشاهی بحرین، الرفاع شرقی (الحجیات)، مجتمع 929، جاده 2914، ساختمان 686A",
    privacy: "سیاست حفظ حریم خصوصی",
    terms: "شرایط و ضوابط",
    credit: "طراحی و توسعه توسط",
  },
};

export default function SiteFooter() {
  const { language } = useLanguage();
  const text = content[language];

  return (
    <footer className={styles.footer}>
      <div className={styles.pattern} aria-hidden />
      <div className={styles.inner}>
        <section className={`${styles.panel} ${styles.about}`}>
          <Link href="/" className={styles.logo} aria-label={text.about}><Image src="/logo-footer.png" alt="جمعية الآل والأصحاب" width={230} height={134} /></Link>
          <p>{text.description}</p>
          <span className={styles.socialLabel}>{text.social}</span>
          <div className={styles.socials} dir="ltr">{socialLinks.map(({ label, href, Icon }) => <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} key={label}><Icon aria-hidden /></a>)}</div>
        </section>

        <section className={`${styles.panel} ${styles.endorsement}`}>
          <span className={styles.kicker}>Aal &amp; Al Ashab</span>
          <h2>{text.endorsement}</h2>
          <div className={styles.videoWrap}><video controls playsInline preload="metadata" aria-label={text.video}><source src="/elshiekh-osman.mp4" type="video/mp4" /></video></div>
        </section>

        <section className={`${styles.panel} ${styles.app}`}>
          <div><span className={styles.kicker}>{text.app}</span><h2>{text.appName}</h2><p>{text.appText}</p></div>
          <Image className={styles.appImage} src="/unnamed-150x150.webp" alt={text.appName} width={150} height={150} />
          <div className={styles.storeButtons} dir="ltr">
            <a href={appStoreUrl} target="_blank" rel="noopener noreferrer"><FaApple aria-hidden /><span><small>Download on the</small>App Store</span></a>
            <a href={googlePlayUrl} target="_blank" rel="noopener noreferrer"><FaGooglePlay aria-hidden /><span><small>GET IT ON</small>Google Play</span></a>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.contact}`}>
          <span className={styles.kicker}>Aal &amp; Al Ashab</span>
          <h2>{text.contact}</h2>
          <address>
            <a href="https://www.google.com/maps/dir/?api=1&destination=26.0978%2C50.5551" target="_blank" rel="noopener noreferrer"><span><FiMapPin aria-hidden /></span><p>{text.address}</p></a>
            <a href="tel:+97317774001"><span><FiPhone aria-hidden /></span><p dir="ltr">+973 17774001</p></a>
            <a href="mailto:tawasul.aalalashab@gmail.com"><span><FiMail aria-hidden /></span><p dir="ltr">tawasul.aalalashab@gmail.com</p></a>
          </address>
        </section>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <nav aria-label="Legal"><Link href="/privacy-policy">{text.privacy}</Link><i aria-hidden /><Link href="/terms-and-conditions">{text.terms}</Link></nav>
          <div className={styles.credit}><span>{text.credit}</span><a href="https://dwam-tech.com/" target="_blank" rel="noopener noreferrer" aria-label="Dwam Tech"><Image src="/dwam.png" alt="Dwam" width={31} height={31} /></a></div>
        </div>
      </div>
    </footer>
  );
}

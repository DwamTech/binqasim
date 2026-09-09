"use client";

import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiBookOpen, FiShield, FiMapPin, FiPhone, FiMail, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import WaqfIntroSection from "../../components/WaqfIntroSection";
import ProjectsSection from "../../components/home/ProjectsSection";
import ActivitiesPreviewSection from "../../components/home/ActivitiesPreviewSection";
import TestimonialsSection from "../../components/home/TestimonialsSection";
import SupportRequestBanner from "../../components/home/SupportRequestBanner";
import VisualLibrarySection from "../../components/home/ReadingLibrarySection";
import PostersSection from "../../components/home/PostersSection";
import LocationMapSection from "../../components/home/LocationMapSection";
import { newsItems } from "./news/newsData";
import { libraryBooks } from "../../data/libraryBooks";
import styles from "./page.module.css";

const translations = {
  ar: {
    video: "فيديو تعريفي لجمعية الآل والأصحاب",
    projectsKicker: "أبواب الخير", projectsTitle: "مشاريعنا", projectsLead: "برامج متنوعة تخدم الأسرة وطالب العلم وتنشر المعرفة وتساند المحتاجين.", details: "تفاصيل المشروع", allProjects: "عرض جميع المشاريع والتبرع",
    newsKicker: "من الجمعية", newsTitle: "آخر الأخبار", newsLead: "تابع أحدث أخبار وفعاليات جمعية الآل والأصحاب.", readMore: "اقرأ الخبر", allNews: "عرض جميع الأخبار",
    projects: [
      ["كفالة الأسر البحرينية", "مساعدات نقدية شهرية للأسر المتعففة لتخفيف الأعباء المعيشية وتوفير احتياجاتها الأساسية."],
      ["المساعدات العلاجية", "المساهمة في تكاليف العلاج وشراء الأدوية للأسر المحتاجة."],
      ["كفالة طالب علم", "دعم طلاب العلم ومساندتهم حتى يتمكنوا من مواصلة مسيرتهم العلمية."],
      ["المطبوعات الدعوية", "طباعة الكتب والمطويات والمواد المرئية التي تعرّف بتراث الآل والأصحاب."],
      ["إفطار صائم", "توفير وجبات الإفطار للصائمين من الأسر المحتاجة وفي المساجد."],
      ["كفالة حاج ومعتمر", "تحمل نفقات الحج والعمرة لمن لم يسبق لهم أداؤهما من الأسر محدودة الدخل."],
    ],
    impactKicker: "أثرٌ يمتد", impactTitle: "نعمل للإنسان، ونبني جسور المحبة والمعرفة",
    stats: [["2006", "عام التأسيس"], ["+12", "مشروعًا خيريًا وعلميًا"], ["4", "مجالات للعمل المجتمعي"], ["7", "أيام لخدمة المستفيدين"]],
    libraryKicker: "المكتبة المقروءة", libraryTitle: "إصدارات معرفية تُنير طريق القارئ", libraryLead: "كتب ومقالات مختارة تعرّف بتاريخ الآل والأصحاب، وتُرسّخ معاني المحبة والإنصاف.", browse: "تصفّح المكتبة", books: [["من فضائل الصحابة", "مختارات من السيرة والتراجم"], ["محبة الآل والأصحاب", "إصدارات الجمعية"], ["أعلام من التاريخ الإسلامي", "قراءات وبحوث مختارة"]], previousBook: "الكتاب السابق", nextBook: "الكتاب التالي", exploreLibrary: "اكتشف المكتبة",
    nearby: "نحن بالقرب منك", contact: "تواصل معنا", addressLabel: "العنوان", address: "مملكة البحرين – الرفاع الشرقي، الحجيات، مجمع 929، طريق 2914، مبنى 686أ", phone: "الهاتف", email: "البريد الإلكتروني",
    hours: "ساعات استقبال الزوار", morning: "الفترة الصباحية: من 9:00 صباحًا إلى 1:00 ظهرًا", evening: "الفترة المسائية: من 5:00 مساءً إلى 9:00 مساءً", note: "الخميس فترة صباحية فقط، والجمعة إجازة.",
  },
  en: {
    video: "Introduction to Aal & Al Ashab Society",
    projectsKicker: "Ways to give", projectsTitle: "Our projects", projectsLead: "Diverse programs supporting families, students of knowledge, education, and people in need.", details: "Project details", allProjects: "View all projects and donate",
    newsKicker: "From the society", newsTitle: "Latest news", newsLead: "Follow the latest news and activities of Aal & Al Ashab Society.", readMore: "Read the news", allNews: "View all news",
    projects: [
      ["Bahraini Family Sponsorship", "Monthly financial assistance that helps low-income families meet essential living needs."],
      ["Medical Assistance", "Contributing to treatment costs and essential medication for families in need."],
      ["Student Sponsorship", "Supporting students of knowledge so they can continue their education."],
      ["Educational Publications", "Publishing books, leaflets, and media about the heritage of Ahl al-Bayt and the Companions."],
      ["Iftar Meals", "Providing iftar meals for fasting people, families in need, and local mosques."],
      ["Hajj and Umrah Sponsorship", "Covering pilgrimage costs for eligible low-income individuals who have not performed them before."],
    ],
    impactKicker: "Lasting impact", impactTitle: "Serving people and building bridges of love and knowledge",
    stats: [["2006", "Year established"], ["+12", "Charitable and educational projects"], ["4", "Areas of community work"], ["7", "Days serving beneficiaries"]],
    libraryKicker: "Reading library", libraryTitle: "Authentic knowledge about Ahl al-Bayt and the Companions", libraryLead: "Books, publications, and articles that highlight their status and the bonds of love and brotherhood between them.", browse: "Browse the library", books: [["Virtues of the Companions", "Selections from biography and history"], ["Love for Aal and Companions", "Society publications"], ["Figures of Islamic History", "Selected readings and research"]], previousBook: "Previous book", nextBook: "Next book", exploreLibrary: "Explore the library",
    nearby: "We are close to you", contact: "Contact us", addressLabel: "Address", address: "Kingdom of Bahrain – East Riffa, Al Hajiyat, Block 929, Road 2914, Building 686A", phone: "Phone", email: "Email",
    hours: "Visitor hours", morning: "Morning: 9:00 AM to 1:00 PM", evening: "Evening: 5:00 PM to 9:00 PM", note: "Thursday morning only. Friday is closed.",
  },
  fa: {
    video: "معرفی بنیاد آل و اصحاب",
    projectsKicker: "راه‌های نیکوکاری", projectsTitle: "طرح‌های ما", projectsLead: "برنامه‌هایی متنوع برای حمایت از خانواده‌ها، دانش‌پژوهان و نیازمندان و گسترش دانش.", details: "جزئیات طرح", allProjects: "مشاهده همه طرح‌ها و کمک مالی",
    newsKicker: "از بنیاد", newsTitle: "آخرین اخبار", newsLead: "تازه‌ترین اخبار و فعالیت‌های بنیاد آل و اصحاب را دنبال کنید.", readMore: "خواندن خبر", allNews: "مشاهده همه اخبار",
    projects: [
      ["حمایت از خانواده‌های بحرینی", "کمک مالی ماهانه به خانواده‌های کم‌برخوردار برای تأمین نیازهای اساسی زندگی."],
      ["کمک‌های درمانی", "مشارکت در هزینه‌های درمان و تهیه دارو برای خانواده‌های نیازمند."],
      ["حمایت از دانش‌پژوه", "پشتیبانی از دانش‌پژوهان برای ادامه مسیر علمی و آموزشی."],
      ["انتشارات فرهنگی", "چاپ کتاب، بروشور و محتوای رسانه‌ای درباره میراث اهل‌بیت و اصحاب."],
      ["افطاری روزه‌داران", "تأمین وعده‌های افطار برای خانواده‌های نیازمند و مساجد."],
      ["حمایت حج و عمره", "تأمین هزینه حج و عمره برای افراد واجد شرایط که پیش‌تر توفیق آن را نداشته‌اند."],
    ],
    impactKicker: "اثری ماندگار", impactTitle: "در خدمت انسان و سازنده پل‌های محبت و دانش",
    stats: [["2006", "سال تأسیس"], ["+12", "طرح خیریه و علمی"], ["4", "حوزه فعالیت اجتماعی"], ["7", "روز خدمت‌رسانی"]],
    libraryKicker: "کتابخانه خواندنی", libraryTitle: "دانشی اصیل درباره اهل‌بیت و اصحاب", libraryLead: "کتاب‌ها، مقالات و آثاری که جایگاه آنان و پیوندهای محبت و برادری میانشان را نشان می‌دهد.", browse: "مشاهده کتابخانه", books: [["فضیلت‌های صحابه", "گزیده‌هایی از سیره و تاریخ"], ["محبت آل و اصحاب", "انتشارات بنیاد"], ["چهره‌های تاریخ اسلام", "مطالعات و پژوهش‌های برگزیده"]], previousBook: "کتاب پیشین", nextBook: "کتاب بعدی", exploreLibrary: "کاوش در کتابخانه",
    nearby: "در کنار شما هستیم", contact: "تماس با ما", addressLabel: "نشانی", address: "پادشاهی بحرین – الرفاع شرقی، الحجیات، مجتمع 929، خیابان 2914، ساختمان 686A", phone: "تلفن", email: "ایمیل",
    hours: "ساعات پذیرش مراجعان", morning: "صبح: از ساعت 9 تا 13", evening: "عصر: از ساعت 17 تا 21", note: "پنجشنبه فقط نوبت صبح؛ جمعه تعطیل است.",
  },
};

export default function Home() {
  const { language } = useLanguage();
  const text = translations[language];
  const [activeBook, setActiveBook] = useState(1);
  const previousBook = () => setActiveBook((current) => (current + libraryBooks.length - 1) % libraryBooks.length);
  const nextBook = () => setActiveBook((current) => (current + 1) % libraryBooks.length);
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <video className={styles.heroVideo} autoPlay muted loop playsInline preload="metadata" aria-label={text.video}><source src="/hero.mp4" type="video/mp4" /></video>
      </section>
      <WaqfIntroSection />
      <section className={styles.newsSection}>
        <div className={styles.sectionInner}>
          <header className={styles.sectionHeader}><span>{text.newsKicker}</span><h2>{text.newsTitle}</h2><p>{text.newsLead}</p></header>
          <div className={styles.newsGrid}>
            {newsItems.slice(0, 3).map((item, index) => (
              <Link className={styles.newsCard} href={`/news/${item.slug}`} key={item.id}>
                <div className={styles.newsImage}><Image src="/aal-alashab-hero.webp" alt={item.title[language]} fill sizes="(max-width: 760px) 100vw, 390px" style={{ objectPosition: index === 0 ? "center 30%" : index === 1 ? "center 55%" : "center 75%" }} /></div>
                <div className={styles.newsContent}><div className={styles.newsMeta}><span>{item.category[language]}</span><time><FiCalendar aria-hidden />{item.date[language]}</time></div><h3>{item.title[language]}</h3><p>{item.excerpt[language]}</p><span className={styles.newsLink}>{text.readMore} <FiArrowLeft aria-hidden /></span></div>
              </Link>
            ))}
          </div>
          <Link className={styles.allNewsButton} href="/news">{text.allNews} <FiArrowLeft aria-hidden /></Link>
        </div>
      </section>
      <section id="library" className={styles.libraryShowcase}>
        <div className={styles.sectionInner}>
          <div className={styles.libraryIntro}><span><FiBookOpen aria-hidden /> {text.libraryKicker}</span><h2>{text.libraryTitle}</h2><p>{text.libraryLead}</p><Link className={styles.libraryCta} href="/library">{text.exploreLibrary} <FiArrowLeft aria-hidden /></Link></div>
          <div className={styles.bookStage}>
            <div className={styles.bookGlow} aria-hidden />
            {libraryBooks.map((book, index) => {
              const position = (index - activeBook + libraryBooks.length) % libraryBooks.length;
              const positionClass = position === 0 ? styles.bookActive : position === 1 ? styles.bookNext : styles.bookPrevious;
              return <Link className={`${styles.book} ${styles[book.tone]} ${positionClass}`} href={`/library/${book.slug}`} key={book.slug} aria-label={book.title[language]}><span className={styles.bookSpine} /><span className={styles.bookCover}><FiBookOpen aria-hidden /><strong>{book.title[language]}</strong><small>{book.subtitle[language]}</small><i>{language === "ar" ? "جمعية الآل والأصحاب" : language === "en" ? "Aal & Al Ashab Society" : "بنیاد آل و اصحاب"}</i></span><span className={styles.bookPages} /><span className={styles.bookCaption}><strong>{book.title[language]}</strong><small>{book.subtitle[language]}</small></span></Link>;
            })}
            <div className={styles.bookControls}><button type="button" onClick={previousBook} aria-label={text.previousBook}><FiChevronRight aria-hidden /></button><span>{String(activeBook + 1).padStart(2, "0")} <i>/</i> {String(libraryBooks.length).padStart(2, "0")}</span><button type="button" onClick={nextBook} aria-label={text.nextBook}><FiChevronLeft aria-hidden /></button></div>
          </div>
        </div>
      </section>
      <PostersSection />
      

      {/* <section id="contact" className={styles.contactSection}><div className={styles.sectionInner}><header className={styles.sectionHeader}><span>{text.nearby}</span><h2>{text.contact}</h2></header><div className={styles.contactGrid}><div className={styles.contactDetails}><a href="https://maps.google.com/?q=26.0978,50.5551" target="_blank" rel="noopener noreferrer"><FiMapPin /><span><strong>{text.addressLabel}</strong>{text.address}</span></a><a href="tel:+97317774001" dir="ltr"><FiPhone /><span><strong>{text.phone}</strong>+973 17774001</span></a><a href="mailto:tawasul.aalalashab@gmail.com" dir="ltr"><FiMail /><span><strong>{text.email}</strong>tawasul.aalalashab@gmail.com</span></a></div><div className={styles.hoursCard}><FiShield aria-hidden /><h3>{text.hours}</h3><p>{text.morning}</p><p>{text.evening}</p><small>{text.note}</small></div></div></div></section> */}
      <VisualLibrarySection />
      <SupportRequestBanner />
      <TestimonialsSection />
      <ProjectsSection />
      <LocationMapSection />
    </main>
  );
}

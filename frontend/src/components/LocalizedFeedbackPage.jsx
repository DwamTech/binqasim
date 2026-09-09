"use client";

import HeroSection from "./HeroSection";
import FeedbackForm from "./FeedbackForm";
import { useLanguage } from "../contexts/LanguageContext";

const translations = {
  complaint: {
    ar: { title: "صندوق الشكاوى", description: "نتلقى شكاوى المستفيدين بصدر رحب، ونعمل على دراستها ومعالجتها بأسرع وقت ممكن.", submit: "إرسال الشكوى" },
    en: { title: "Complaints", description: "We welcome beneficiary complaints and work to review and address them as quickly as possible.", submit: "Submit complaint" },
    fa: { title: "صندوق شکایات", description: "از شکایات بهره‌مندان استقبال می‌کنیم و برای بررسی و رسیدگی سریع به آن‌ها می‌کوشیم.", submit: "ارسال شکایت" },
  },
  suggestion: {
    ar: { title: "صندوق الاقتراحات", description: "نسعد باستقبال آرائكم واقتراحاتكم للمشاريع الخيرية والدعوية التي تدعم أهداف الجمعية وتنشر الخير والمعرفة.", submit: "إرسال الاقتراح" },
    en: { title: "Suggestions", description: "We welcome your ideas for charitable and educational projects that support the Society’s mission and spread goodness and knowledge.", submit: "Submit suggestion" },
    fa: { title: "صندوق پیشنهادها", description: "از دیدگاه‌ها و پیشنهادهای شما برای طرح‌های خیریه و فرهنگی در راستای اهداف بنیاد استقبال می‌کنیم.", submit: "ارسال پیشنهاد" },
  },
};

export default function LocalizedFeedbackPage({ type }) {
  const { language } = useLanguage();
  const text = translations[type][language];
  return <main><HeroSection title={text.title} imageSrc="/75884be2-3e9d-4126-ace3-770ef0c2f071_16x9_1200x676.webp" imageAlt={text.title} align="center" /><FeedbackForm title={text.title} description={text.description} submitLabel={text.submit} type={type} /></main>;
}

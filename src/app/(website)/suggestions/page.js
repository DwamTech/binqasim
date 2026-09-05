import HeroSection from "@/components/HeroSection";
import FeedbackForm from "@/components/FeedbackForm";

export default function SuggestionsPage() {
  return (
    <main>
      <HeroSection
        title="صندوق الإقتراحات"
        imageSrc="/ffdsfdf.webp"
        imageAlt="صندوق الإقتراحات"
        align="center"
      />
      <FeedbackForm
        title="صندوق الإقتراحات"
        description="نسعد باستقبال آرائكم واقتراحاتكم للمشاريع الخيرية والدعوية والتي تصب في أهداف الوقف ، وزيادة قدرته على دعم الخير ونشر العلم في ربوع الأرض"
        submitLabel="إرسال الإقتراح"
        type="suggestion"
      />
    </main>
  );
}

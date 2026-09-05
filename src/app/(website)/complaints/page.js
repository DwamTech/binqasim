import HeroSection from "@/components/HeroSection";
import FeedbackForm from "@/components/FeedbackForm";

export default function ComplaintsPage() {
  return (
    <main>
      <HeroSection
        title="صندوق الشكاوي"
        imageSrc="/75884be2-3e9d-4126-ace3-770ef0c2f071_16x9_1200x676.webp"
        imageAlt="صندوق الشكاوي"
        align="center"
      />
      <FeedbackForm
        title="صندوق الشكاوي"
        description="نتلقى بصدر رحب شكاوى المستفيدين ونعمل بشكل سريع على حلها ، ونعتذر مبدأياً إن واجهتكم أي من المشكلات والصعوبات ، على وعد بإذن الله على تذليل كافة الصعوبات لكم"
        submitLabel="إرسال الشكوى"
        type="complaint"
      />
    </main>
  );
}

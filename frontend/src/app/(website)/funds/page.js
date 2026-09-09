"use client";

import Image from "next/image";
import { FiCheck, FiPieChart } from "react-icons/fi";
import styles from "./page.module.css";
import { useLanguage } from "../../../contexts/LanguageContext";

const spendingItems = [
  "يضحى في كل عام عن جدي ووالديه ويكون عدد الأضاحي ثالثة أضاحي ويجوز نقلها من مكان إلى آخر حسب ما يراه الناظر",
  "يحجج في كل عام عدد من المسلمين في ثواب جدي و والدية.",
  "الأعمال الخيرية",
  "تحفيظ القرآن",
  "إنشاء المساجد",
  "المستشفيات أو المساهمة في إنشائها",
  "طبع الكتب الإسلامية أو شراء شيء مما طبع منها وتوزيعه و يستشار أهل العلم الموثوق فيهم ولا أذنه ان يطبع أو يشترى إلا ما كان نافعا للمسلمين في دنياهم وأخراهم",
  "الفقراء من الأقارب ويقدم في ذلك أهل الديانة والصالح حسب رأي الناظر",
  "المصارف الثمانية المعروفة باستثناء مصرف العاملين عليها ويقدم في ذلك حسب الحاجة",
  "الأيتام والأرامل والمرضى والسجناء ويقدم أهل الديانة والصالح على غيرهم حسب رأي الناظر.",
  "توزيع المياه والتمور والأطعمة",
  "وإفطار الصائمين خاصة في شهر رمضان في هذه البالد وغيرها من بالد المسلمين حسب ما يراه الناظر",
  "الأعمال الخيرية الأخرى فللناظر الصلاحية في تقدير ما يراه مناسبا للصرف فيها وتكون هذه المصارف في داخل المملكة أو خارجها ويقدم منها ما كان أنفع للواقف وأعظم مصلحة للمسلمين مع مراعاة اختلاف الأوقات والحاجات فقد يكون بعض هذه المصارف في زمن أنفع منهفي زمن آخر ويقدر ذلك الناظر",
];

const translations = {
  ar: { society: "جمعية الآل والأصحاب", title: "مصارف جمعية الآل والأصحاب", lead: "منهج متوازن يجمع بين صيانة أصول الجمعية، وتنمية مواردها، وتعظيم أثرها في أوجه البر والخير.", spendTitle: "أوجه صرف موارد الجمعية:", spend: "تُخصم مصاريف إصلاح أصول الجمعية وتجديدها وصيانتها عند الحاجة، إضافة إلى مصاريف التشغيل الإدارية والعمومية بما لا يتجاوز ١٠٪ من الموارد، وفق ميزانية معتمدة وكشف المحاسب القانوني.", investTitle: "الموارد المخصصة للاستثمار بنسبة ٢٥٪", invest: "يُستثمر ٢٥٪ من صافي الموارد بما لا يخالف أحكام الشريعة، وبما يحقق مصلحة الجمعية واستدامة برامجها.", restTitle: "مصارف النسبة المتبقية من الموارد وهي ٧٥٪", rest: "تُصرف النسبة المتبقية من صافي موارد الجمعية على ما يلي:", finalTitle: "من مصارف الجمعية:", final: "بعد خصم نفقات التشغيل والصيانة، تخصص نسبة ٢٥٪ لتنمية الموارد واستدامة الأصول، وتصرف نسبة ٧٥٪ في أعمال البر والمشروعات الخيرية والعلمية وفق الأولويات المعتمدة.", items: spendingItems },
  en: { society: "Aal & Al Ashab Society", title: "Society Spending Channels", lead: "A balanced approach that preserves the Society’s assets, grows its resources, and maximizes its charitable impact.", spendTitle: "Allocation of Society resources:", spend: "Necessary repair, renewal, and maintenance costs are deducted, along with approved administrative and operating expenses not exceeding 10% of resources, based on the approved budget and auditor’s statement.", investTitle: "Resources allocated to investment: 25%", invest: "Twenty-five percent of net resources is invested in Sharia-compliant activities that support the Society’s interests and program sustainability.", restTitle: "Allocation of the remaining 75%", rest: "The remaining share of net resources is allocated to the following causes:", finalTitle: "Society spending:", final: "After approved operating and maintenance expenses, 25% is allocated to resource growth and asset sustainability, while 75% supports charitable and educational projects according to approved priorities.", items: ["Annual Adahi on behalf of the donor and his parents, with transfer permitted when beneficial.", "Supporting eligible Muslims in performing Hajj.", "Charitable work", "Quran memorization", "Building mosques", "Hospitals and contributions to their establishment", "Printing and distributing beneficial Islamic books with trusted scholarly guidance", "Relatives in need, with priority based on need and integrity", "The recognized eligible Zakat categories, according to need", "Orphans, widows, patients, and prisoners", "Distribution of water, dates, and food", "Iftar meals during Ramadan", "Other charitable causes inside or outside the Kingdom according to benefit, priorities, and changing needs"] },
  fa: { society: "بنیاد آل و اصحاب", title: "مصارف بنیاد آل و اصحاب", lead: "رویکردی متوازن برای حفظ دارایی‌ها، رشد منابع و افزایش اثر بنیاد در امور نیکوکارانه.", spendTitle: "نحوه تخصیص منابع بنیاد:", spend: "هزینه‌های ضروری تعمیر، نوسازی و نگهداری دارایی‌ها و هزینه‌های اداری و اجرایی مصوب تا سقف ۱۰٪ منابع، بر پایه بودجه و گزارش حسابرس کسر می‌شود.", investTitle: "منابع اختصاص‌یافته به سرمایه‌گذاری: ۲۵٪", invest: "بیست‌وپنج درصد منابع خالص در فعالیت‌های سازگار با شریعت و در راستای منافع بنیاد و پایداری برنامه‌ها سرمایه‌گذاری می‌شود.", restTitle: "تخصیص ۷۵٪ باقی‌مانده", rest: "سهم باقی‌مانده منابع خالص در زمینه‌های زیر هزینه می‌شود:", finalTitle: "مصارف بنیاد:", final: "پس از هزینه‌های مصوب اجرا و نگهداری، ۲۵٪ برای رشد منابع و پایداری دارایی‌ها و ۷۵٪ برای طرح‌های خیریه و علمی بر پایه اولویت‌ها اختصاص می‌یابد.", items: ["قربانی سالانه به نیابت از واقف و والدین او، با امکان انتقال در صورت مصلحت", "حمایت از مسلمانان واجد شرایط برای حج", "امور خیریه", "حفظ قرآن", "ساخت مسجد", "بیمارستان‌ها و مشارکت در ساخت آن‌ها", "چاپ و توزیع کتاب‌های سودمند اسلامی با نظر عالمان مورد اعتماد", "خویشاوندان نیازمند با اولویت نیاز و شایستگی", "مصارف شناخته‌شده زکات بر پایه نیاز", "یتیمان، بیوه‌ها، بیماران و زندانیان", "توزیع آب، خرما و غذا", "افطاری در ماه رمضان", "دیگر امور خیریه در داخل یا خارج کشور بر پایه سودمندی و نیازهای متغیر"] },
};

export default function FundsPage() {
  const { language } = useLanguage();
  const text = translations[language];
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image
          src="/1e1d774f-79d8-4a61-b562-df90a0b9d85c.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}><FiPieChart aria-hidden />{text.society}</span><h1>{text.title}</h1><p>{text.lead}</p>
          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.container}>
          <article className={styles.introCard}>
            <h2>❀&nbsp;{text.spendTitle}&nbsp;</h2><p>{text.spend}</p>
          </article>

          <article className={styles.investmentCard}>
            <div>
              <h2>❀&nbsp;{text.investTitle}</h2><p>{text.invest}</p>
            </div>
          </article>

          <article className={styles.spendingCard}>
            <header className={styles.spendingHeader}>
              <div className={styles.spendingCopy}>
                <h2>❀&nbsp;{text.restTitle}</h2><p>{text.rest}</p>
              </div>
              <div className={styles.shareVisual} aria-hidden>
                <div className={styles.shareRing}>
                  <span>٧٥٪</span>
                </div>
              </div>
            </header>

            <div className={styles.itemsGrid}>
              {text.items.map((item, index) => (
                <div
                  className={`${styles.item} ${index === text.items.length - 1 ? styles.featuredItem : ""}`}
                  key={item}
                >
                  <div className={styles.itemTop}>
                    <span className={styles.itemCheck}><FiCheck aria-hidden /></span>
                    <span className={styles.itemNumber}>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.finalCard}>
            <h2>❀&nbsp;{text.finalTitle}</h2><p>{text.final}</p>
          </article>
        </div>
      </section>
    </main>
  );
}

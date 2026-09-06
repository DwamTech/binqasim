import styles from "../legal.module.css";

export const metadata = {
  title: "الشروط والأحكام | وقف عبد الله بن قاسم",
};

const sections = [
  ["قبول الشروط", "يعني استخدام هذا الموقع موافقتك على الالتزام بهذه الشروط والأحكام، وفي حال عدم الموافقة يرجى التوقف عن استخدام الموقع."],
  ["استخدام الموقع", "يُستخدم الموقع وخدماته للأغراض المشروعة، ويُمنع أي استخدام قد يضر بالموقع أو يؤثر في توفر خدماته أو حقوق مستخدميه."],
  ["محتوى الموقع", "نسعى إلى تقديم محتوى واضح ودقيق، وقد يتم تحديث المعلومات أو تعديلها عند الحاجة دون إشعار مسبق."],
  ["الروابط الخارجية", "قد يتضمن الموقع روابط لمواقع خارجية لتسهيل الوصول إلى خدمات أو معلومات ذات صلة، ولا نتحمل مسؤولية محتوى تلك المواقع أو سياساتها."],
  ["حقوق الملكية", "المحتوى والتصميم والعلامات والمواد المنشورة في الموقع محمية وفق الحقوق والأنظمة المعمول بها، ولا يجوز استخدامها دون إذن."],
  ["تحديث الشروط", "يجوز تحديث هذه الشروط والأحكام عند الحاجة، ويُعد استمرار استخدام الموقع بعد نشر التحديث قبولًا للشروط المحدثة."],
];

export default function TermsAndConditionsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <span>الروابط القانونية</span>
          <h1>الشروط والأحكام</h1>
        </div>
      </section>
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <article className={styles.contentCard}>
            <p className={styles.intro}>تنظم هذه الشروط استخدام موقع وقف عبد الله بن قاسم والخدمات والمعلومات المتاحة من خلاله.</p>
            <div className={styles.sections}>
              {sections.map(([title, content]) => (
                <section className={styles.section} key={title}>
                  <h2>{title}</h2>
                  <p>{content}</p>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

import styles from "../legal.module.css";

export const metadata = {
  title: "سياسة الخصوصية | وقف عبد الله بن قاسم",
};

const sections = [
  ["البيانات التي نجمعها", "قد نجمع البيانات التي تقدمها طوعًا عند استخدام نماذج التواصل أو تقديم الطلبات، مثل الاسم وبيانات الاتصال والمعلومات اللازمة لمعالجة الطلب."],
  ["استخدام البيانات", "تُستخدم البيانات لتقديم خدمات الموقع، والرد على الاستفسارات، ومعالجة الطلبات، وتحسين تجربة المستخدم وجودة الخدمات المقدمة."],
  ["حماية البيانات", "نتخذ التدابير التنظيمية والتقنية المناسبة للمحافظة على سرية البيانات والحد من الوصول غير المصرح به إليها."],
  ["مشاركة البيانات", "لا تتم مشاركة البيانات الشخصية مع جهات أخرى إلا عند الحاجة إلى تقديم الخدمة، أو بموافقة صاحب البيانات، أو عندما تقتضي الأنظمة ذلك."],
  ["حقوق المستخدم", "يمكنك التواصل معنا للاستفسار عن بياناتك أو طلب تحديثها أو تصحيحها وفق الأنظمة والسياسات المعمول بها."],
  ["تحديث السياسة", "قد يتم تحديث سياسة الخصوصية عند الحاجة، ويُعرض الإصدار المحدث على هذه الصفحة."],
];

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <span>الروابط القانونية</span>
          <h1>سياسة الخصوصية</h1>
        </div>
      </section>
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <article className={styles.contentCard}>
            <p className={styles.intro}>نحترم خصوصية مستخدمي موقع وقف عبد الله بن قاسم، ونسعى إلى التعامل مع البيانات بمسؤولية ووضوح.</p>
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

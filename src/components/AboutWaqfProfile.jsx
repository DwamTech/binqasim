import Image from "next/image";
import {
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiCompass,
  FiEye,
  FiFileText,
  FiHeart,
  FiHome,
  FiMapPin,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import styles from "./AboutWaqfProfile.module.css";

const identityItems = [
  {
    title: "رؤية الوقف",
    text: "نموذج يُرسّخ قيمَ وأثر الوقف في عمارة الأرض.",
    Icon: FiEye,
  },
  {
    title: "رسالة الوقف",
    text: "تعظيم النفع وتنمية المجتمع وتحقيق الاستدامة والنماء.",
    Icon: FiCompass,
  },
  {
    title: "قيم الوقف",
    text: "الإخلاص والإحسان، الحوكمة، المشاركة، المهنية والاحترافية.",
    Icon: FiHeart,
  },
];

const objectives = [
  "العمل على تبني مشاريع نوعية ومتميزة ينعكس أثرها على المجتمع بشكل عام.",
  "تمتين وتنمية وتطوير المؤسسات والجهات الخيرية القائمة.",
  "عقد الشراكات والتحالفات مع الجهات الأخرى من مؤسسات مانحة وجهات حكومية ذات علاقة وجمعيات خيرية وقطاع خاص لتطوير القطاع الخيري.",
  "خدمة المستفيد وتجويد الخدمة تأتي في قائمة أولويات العمل لدينا لتحقيق الرضى لديه.",
  "الإسهام في تحقيق التوازن في التنمية المجتمعية في مختلف المجالات الاجتماعية والصحية والإغاثية والإعلامية والتعليمية والدعوية.",
  "دفع العمل الخيري لتحقيق مكانته المرموقة في المجتمع ليكون قطاعًا ثالثًا فاعلًا ومؤثرًا.",
];

const profileFacts = [
  {
    label: "اسم الواقف",
    value: "عبدالله بن قاسم بن محمد آل ثاني، رحمه الله، المتوفى بتاريخ 29/10/1400هـ بالصك رقم 3266 الصادر من المحكمة الشرعية بدولة قطر.",
    Icon: FiUser,
  },
  { label: "نوع الوقف", value: "نخل سابقًا وحاليًا أرض بياض.", Icon: FiHome },
  { label: "تاريخ الوقف", value: "قبل أربعين سنة أو تزيد.", Icon: FiCalendar },
  { label: "كيف آل الوقف إلى الواقف", value: "آل إليه بالشراء من عبدالعزيز بن حسن القصيبي.", Icon: FiBriefcase },
  { label: "موقع الوقف", value: "مدينة صفوى بمحافظة القطيف.", Icon: FiMapPin },
  { label: "الجهة المشرفة", value: "مجلس نظارة أوقاف آل ثاني بمحافظة القطيف.", Icon: FiShield },
  {
    label: "مستندات الملكية",
    value: "بموجب الصكين الصادرين من كتابة عدل القطيف برقم (80 في 11/5/1368هـ) والصك رقم (79 في 11/5/1368هـ).",
    Icon: FiFileText,
  },
  {
    label: "حالة الوقف حاليًا",
    value: "كانت نخيلاً ثم اندثرت وأصبحت أراضي بيضاء بها بقايا أشجار ونخيل ميتة.",
    Icon: FiBookOpen,
  },
];

const supervisors = [
  { name: "خالد بن أحمد الزهراني", id: "1006518821" },
  { name: "تركي بن علي اللطيف", id: "1004783807" },
  { name: "عبدالله بن سليمان الشايع", id: "1066010958" },
];

const beneficiaries = [
  "يُضحّى في كل عام عن جد الواقف ووالديه، ويكون عدد الأضاحي ثلاثة، ويجوز نقلها من مكان إلى آخر حسب ما يراه الناظر.",
  "يُحجّج في كل عام عدد من المسلمين في ثواب جد الواقف ووالديه.",
  "الأعمال الخيرية.",
  "تحفيظ القرآن الكريم.",
  "إنشاء المساجد.",
  "المستشفيات أو المساهمة في إنشائها.",
  "طبع الكتب الإسلامية أو شراء النافع منها وتوزيعه، بعد استشارة أهل العلم الموثوق فيهم.",
  "الفقراء من الأقارب، ويُقدّم أهل الديانة والصلاح حسب رأي الناظر.",
  "المصارف الثمانية المعروفة، باستثناء مصرف العاملين عليها، مع تقديم الأيتام والأرامل والمرضى والسجناء حسب الحاجة.",
  "توزيع المياه والتمور والأطعمة.",
  "إفطار الصائمين خاصة في شهر رمضان في هذه البلاد وغيرها من بلاد المسلمين حسب ما يراه الناظر.",
  "الأعمال الخيرية الأخرى التي يقدّر الناظر مناسبتها، مع تقديم ما هو أنفع للواقف وأعظم مصلحة للمسلمين ومراعاة اختلاف الأوقات والحاجات.",
];

export default function AboutWaqfProfile() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Image
          src="/about/4484.png"
          alt="أحد أصول أوقاف عبدالله بن قاسم آل ثاني"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>عن الوقف</span>
          <h1>تعريف بأوقاف عبدالله بن قاسم آل ثاني</h1>
          <p>بمدينة صفوى بمحافظة القطيف</p>
          <a href="#waqf-profile" className={styles.exploreLink}>
            استكشف الوقف
            <span aria-hidden>↓</span>
          </a>
        </div>
      </section>

      <main id="waqf-profile">
        <section className={styles.identitySection}>
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <span>هويتنا المؤسسية</span>
              <h2>أثرٌ ممتد، وتنميةٌ مستدامة</h2>
              <p>منظومة وقفية تُعظّم النفع وتبني شراكات تصنع فرقًا مستدامًا في المجتمع.</p>
            </header>

            <div className={styles.identityGrid}>
              {identityItems.map(({ title, text, Icon }) => (
                <article className={styles.identityCard} key={title}>
                  <span className={styles.cardIcon}><Icon aria-hidden /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>

            <div className={styles.objectivesBox}>
              <div className={styles.objectivesIntro}>
                <span className={styles.largeNumber}>06</span>
                <span>أهداف استراتيجية</span>
                <h2>أهداف الوقف</h2>
              </div>
              <ol className={styles.objectivesList}>
                {objectives.map((objective, index) => (
                  <li key={objective}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{objective}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className={styles.profileSection}>
          <div className={styles.container}>
            <header className={`${styles.sectionHeader} ${styles.sectionHeaderStart}`}>
              <span>السجل الوقفي</span>
              <h2>معلومات الوقف</h2>
            </header>
            <div className={styles.factsGrid}>
              {profileFacts.map(({ label, value, Icon }) => (
                <article className={styles.factCard} key={label}>
                  <span className={styles.factIcon}><Icon aria-hidden /></span>
                  <div>
                    <h3>{label}</h3>
                    <p>{value}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.supervisionPanel}>
              <div className={styles.supervisionIntro}>
                <span className={styles.supervisionIcon}><FiUsers aria-hidden /></span>
                <div>
                  <span>الإدارة والإشراف</span>
                  <h2>الناظر على الوقف</h2>
                </div>
              </div>
              <p className={styles.supervisionText}>
                بموجب صك الولاية الصادر من المحكمة العامة بمحافظة القطيف برقم
                (32/4) في 5/3/1430هـ، المتضمن ولاية كل من:
              </p>
              <div className={styles.supervisorsGrid}>
                {supervisors.map((supervisor, index) => (
                  <article key={supervisor.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{supervisor.name}</h3>
                    <bdi>{supervisor.id}</bdi>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.conditionsSection}>
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <span>الوصية والمصارف</span>
              <h2>شروط الواقف والمستفيدون</h2>
            </header>

            <div className={styles.conditionsGrid}>
              <article className={styles.conditionsCard}>
                <span className={styles.cardLabel}>شروط الواقف</span>
                <h3>ضوابط صرف ريع الوقف</h3>
                <div className={styles.conditionItem}>
                  <span>01</span>
                  <p>أن يُصرف ريعها في أعمال البر عامة.</p>
                </div>
                <div className={styles.conditionItem}>
                  <span>02</span>
                  <p>
                    إن احتاج أحد من الذرية فهو أولى، ولله الحمد لا يوجد في ذرية
                    جدنا قاسم من يحتاج. والذي يدير الأمور اليوم من أملاك جدي
                    ووصاياه هو صاحب السمو الشيخ حمد بن خليفة آل ثاني أمير دولة
                    قطر، وقد أسند سموه الأمر وأوكل به إلى ابن عمه الشيخ حسن بن
                    خالد آل ثاني. وكلنا من ذرية جدنا عبد الله رحمه الله، ولا يوجد
                    ناظر على أعيان الوقف وهي معطلة، وأطلب تعيين الشيخ خالد بن أحمد
                    بن علي المضحوي الزهراني، سعودي الجنسية بموجب سجله المدني رقم
                    <bdi> 1006518821 </bdi>ناظرًا على الوقف.
                  </p>
                </div>
              </article>

              <article className={styles.beneficiariesCard}>
                <div className={styles.beneficiariesHeading}>
                  <span className={styles.cardLabel}>المستفيدون من الوقف</span>
                  <h3>مصارف نسبة 75٪ من صافي غلة الوقف</h3>
                </div>
                <ul>
                  {beneficiaries.map((item) => (
                    <li key={item}><FiCheck aria-hidden /><span>{item}</span></li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.assetsSection}>
          <div className={styles.container}>
            <div className={styles.assetCard}>
              <div className={styles.assetImageWrap}>
                <Image
                  src="/about/445454.jpg"
                  alt="العمارتان التجاريتان من أصول الوقف في الخبر الشمالية"
                  fill
                  sizes="(max-width: 800px) 100vw, 50vw"
                  className={styles.assetImage}
                />
                <span>من أصول الوقف</span>
              </div>
              <div className={styles.assetContent}>
                <span className={styles.assetKicker}>استدامة الأصل ونماء الأثر</span>
                <h2>أصول وقفية في الخبر الشمالية</h2>
                <p>
                  من الأصول المنقولة لأوقاف عبدالله بن قاسم آل ثاني بالمنطقة
                  الشرقية عمارتان تجاريتان مبنيتان بالكامل، كل عمارة على قطعتين
                  من الأراضي وتقعان في محافظة الخبر الشمالية.
                </p>
                <div className={styles.assetStats}>
                  <div><span>تاريخ الشراء</span><strong>02/05/1440هـ</strong></div>
                  <div><span>قيمة الشراء</span><strong>13,950,000 ريال</strong></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

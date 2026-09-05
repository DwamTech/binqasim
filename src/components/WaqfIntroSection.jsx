import { FiCheck, FiEye, FiHeart, FiMessageCircle } from "react-icons/fi";
import styles from "./WaqfIntroSection.module.css";

const identityItems = [
  {
    title: "رؤية الوقف",
    description: "نموذج يُرسّخ قيمَ وأثر الوقف في عمارة الأرض.",
    Icon: FiEye,
  },
  {
    title: "رسالة الوقف",
    description: "تعظيم النفع وتنمية المجتمع وتحقيق الاستدامة والنماء.",
    Icon: FiMessageCircle,
  },
  {
    title: "قيم الوقف",
    description: "الإخلاص والإحسان، الحوكمة، المشاركة، المهنية والاحترافية.",
    Icon: FiHeart,
  },
];

const objectives = [
  "العمل على تبني مشاريع نوعية ومتميزة ينعكس أثرها على المجتمع بشكل عام.",
  "تمتين وتنمية وتطوير المؤسسات والجهات الخيرية القائمة.",
  "عقد الشراكات والتحالفات مع الجهات الأخرى من مؤسسات مانحة وجهات حكومية ذات علاقة وجمعيات خيرية وقطاع خاص لتطوير القطاع الخيري.",
  "خدمة المستفيد وتجويد الخدمة تأتي في قائمة أولويات العمل لدينا لتحقيق الرضى لديه.",
  "الإسهام في تحقيق التوازن في التنمية المجتمعية في مختلف المجالات الاجتماعية والصحية والإغاثية والإعلامية والتعليمية والدعوية.",
  "دفع العمل الخيري لتحقيق مكانته المرموقة في المجتمع ليكون قطاعاً ثالثاً فاعلاً ومؤثراً.",
];

export default function WaqfIntroSection() {
  return (
    <section className={styles.about}>
      <div className={styles.aboutInner}>
        <header className={styles.aboutHeader}>
          <span className={styles.sectionKicker}>عن الوقف</span>
          <h2 className={styles.aboutTitle}>ما هو وقف عبد الله بن قاسم ثاني؟</h2>
          <span className={styles.titleAccent} aria-hidden />
        </header>

        <div className={styles.identityCards}>
          {identityItems.map(({ title, description, Icon }) => (
            <article className={styles.identityCard} key={title}>
              <span className={styles.identityIcon}><Icon aria-hidden /></span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.objectivesPanel}>
          <div className={styles.objectivesHeading}>
            <span className={styles.objectivesNumber}>06</span>
            <div>
              <span>مسارات تصنع الأثر</span>
              <h3>أهداف الوقف</h3>
            </div>
          </div>
          <ul className={styles.objectivesList}>
            {objectives.map((objective) => (
              <li key={objective}>
                <FiCheck aria-hidden />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

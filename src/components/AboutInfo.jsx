import styles from "./AboutInfo.module.css";

export default function AboutInfo({
  title,
  paragraphs,
  goalsTitle,
  goals,
  notes,
}) {
  return (
    <section className={styles.frameSection}>
      <div className={styles.frameInner}>
        <h2 className={styles.title}>{title || "وقف الصالح الخيري"}</h2>
        {(paragraphs && paragraphs.length
          ? paragraphs
          : [
              "لَأنّ الدنيا وما فيها لا تَسوى عند الله جناح بعوضة، تم بفضل الله وتوفيقه تدشين وقف الصالح الخيري - بمكة المكرمة.",
              "وقف الصالح الخيري مخصص لرعاية طلاب العلم ومساندتهم في سبيل تحصيلهم للعلم والقيام بواجب الدعوة إلى الله تعالى على منهج أهل السنة والجماعة.",
              "كما أنه يستهدف أبواب البر والخير عمومًا في حال وجود فائض أو حاجة طارئة تتطلب الانتقال إلى المصارف الأخرى قبل طلاب العلم.",
            ]
        ).map((para, idx) => (
          <p key={`p-${idx}`} className={styles.text}>{para}</p>
        ))}

        {(goals && goals.length) ? (
          <div className={styles.goalsBlock}>
            <div className={styles.goalsTitle}>{goalsTitle || "الأهداف"}</div>
            <ul className={styles.list}>
              {goals.map((g, idx) => <li key={`g-${idx}`}>{g}</li>)}
            </ul>
          </div>
        ) : (
          <div className={styles.goalsBlock}>
            <div className={styles.goalsTitle}>الأهداف</div>
            <ul className={styles.list}>
              <li>تحقيق غبطة الواقف وإجراء الأجر عليه.</li>
              <li>رعاية طلبة العلم وإعانتهم على تحصيله ومن ثم الدعوة إلى الله على بصيرة.</li>
              <li>المساهمة في أبواب البر والخير عمومًا.</li>
              <li>تنمية الوقف بالاستثمار وفق اللوائح والأنظمة.</li>
            </ul>
          </div>
        )}

        {(notes && notes.length) ? notes.map((n, idx) => (
          <p key={`n-${idx}`} className={styles.text}>{n}</p>
        )) : null}
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";
import { activities, getActivityCategory } from "../../../data/activities";
import styles from "./page.module.css";

export const metadata = { title: "أنشطة وفعاليات | جمعية الآل والأصحاب", description: "أنشطة وفعاليات جمعية الآل والأصحاب العلمية والثقافية والمجتمعية." };

export default async function ActivitiesPage({ searchParams }) {
  const query = await searchParams;
  const selectedId = getActivityCategory(query?.category) ? query.category : "all";
  const selectedCategory = getActivityCategory(selectedId);
  const visibleActivities = selectedId === "all" ? activities : activities.filter((item) => item.category === selectedId);

  return <main className={styles.page}>
    <section className={styles.hero}><Image src="/aal-alashab-hero.webp" alt="" fill priority sizes="100vw" /><div className={styles.heroOverlay} /><div className={styles.container}><span><FiCalendar /> أنشطة وفعاليات</span><h1>{selectedCategory?.title || "حكايات من العمل والأثر"}</h1><p>{selectedCategory?.description || "تعرّف على فعاليات الجمعية وبرامجها العلمية والثقافية والمجتمعية من خلال مجموعة متنوعة من الأنشطة."}</p></div></section>
    <section className={styles.content}><div className={styles.container}>
      <div className={styles.resultsHeader}><div><span>{selectedCategory ? "أنشطة القسم" : "كل الأنشطة"}</span><h2>{selectedCategory?.title || "أحدث الأنشطة والفعاليات"}</h2></div><strong>{visibleActivities.length.toLocaleString("ar-EG")} بطاقات</strong></div>
      <div className={styles.grid}>{visibleActivities.map((activity, index) => { const category = getActivityCategory(activity.category); return <article className={styles.card} key={activity.slug}><Link className={styles.image} href={`/activities/${activity.slug}`}><Image src={activity.image} alt={activity.title} fill sizes="(max-width: 650px) 100vw, (max-width: 980px) 50vw, 33vw" priority={index < 3} /><span>{category.title}</span></Link><div className={styles.cardBody}><small>{String(index + 1).padStart(2, "0")}</small><h2><Link href={`/activities/${activity.slug}`}>{activity.title}</Link></h2><p>{activity.summary}</p><Link className={styles.more} href={`/activities/${activity.slug}`}>عرض التفاصيل <FiArrowLeft /></Link></div></article>; })}</div>
    </div></section>
  </main>;
}

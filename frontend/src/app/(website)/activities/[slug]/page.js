import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { activities, getActivity, getActivityCategory } from "../../../../data/activities";
import styles from "../page.module.css";

export function generateStaticParams() { return activities.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const activity = getActivity(slug);
  return activity ? { title: `${activity.title} | جمعية الآل والأصحاب`, description: activity.summary } : {};
}

export default async function ActivityDetailsPage({ params }) {
  const { slug } = await params;
  const activity = getActivity(slug);
  if (!activity) notFound();
  const category = getActivityCategory(activity.category);
  const related = activities.filter((item) => item.category === activity.category && item.slug !== activity.slug).slice(0, 2);
  return <main className={styles.page}>
    <section className={styles.detailHero}><Image src={activity.image} alt={activity.title} fill priority sizes="100vw" /><div className={styles.heroOverlay} /><div className={`${styles.container} ${styles.detailHeroInner}`}><nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/activities">الأنشطة والفعاليات</Link><span>/</span><Link href={`/activities?category=${category.id}`}>{category.title}</Link></nav><h1>{activity.title}</h1><p>{activity.summary}</p></div></section>
    <section className={styles.articleSection}><div className={`${styles.container} ${styles.articleGrid}`}><article className={styles.article}><span>{category.title}</span><h2>{activity.title}</h2>{activity.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article><aside className={styles.sideCard}><small>اكتشف المزيد</small><h3>{category.title}</h3><p>{category.description}</p><Link href={`/activities?category=${category.id}`}>كل بطاقات القسم <FiArrowLeft /></Link></aside></div></section>
    {related.length > 0 && <section className={styles.related}><div className={styles.container}><h2>مواضيع ذات صلة</h2><div className={styles.grid}>{related.map((item) => <article className={styles.card} key={item.slug}><Link className={styles.image} href={`/activities/${item.slug}`}><Image src={item.image} alt={item.title} fill sizes="(max-width: 620px) 100vw, 50vw" /></Link><div className={styles.cardBody}><h2><Link href={`/activities/${item.slug}`}>{item.title}</Link></h2><p>{item.summary}</p><Link className={styles.more} href={`/activities/${item.slug}`}>عرض التفاصيل <FiArrowLeft /></Link></div></article>)}</div></div></section>}
  </main>;
}

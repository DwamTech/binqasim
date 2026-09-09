import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import styles from "../page.module.css";

export const metadata = { title: "مشاريع التبرع | جمعية الآل والأصحاب" };

const projects = [
  { title: "المساعدات العلاجية", text: "المساهمة في تكاليف العلاج والأدوية والعمليات الجراحية للحالات غير القادرة.", href: "/donations/projects/medicine-aids", image: "/WhatsApp-Image-2021-02-16-at-8.45.01-PM-1024x754.jpeg" },
  { title: "كفالة الأسر البحرينية", text: "مساعدات نقدية تسهم في تخفيف الأعباء المعيشية عن الأسر المحتاجة.", href: "/donate#bank-accounts", image: "/aal-alashab-hero.webp" },
  { title: "المساعدات الموسمية", text: "توفير الاحتياجات الموسمية وكسوة العيد والحقائب المدرسية للأسر.", href: "/donate#bank-accounts", image: "/Bahrain beauty.jpg" },
  { title: "إفطار صائم", text: "توفير وجبات الإفطار للصائمين من العمال والأسر المحتاجة في رمضان.", href: "/donate#bank-accounts", image: "/Bahrain.jpg" },
  { title: "كفالة طالب علم", text: "مساندة طلاب العلم وتمكينهم من مواصلة مسيرتهم التعليمية.", href: "/donate#bank-accounts", image: "/aal-alashab-hero.webp" },
  { title: "تفريج الغارمين", text: "المساهمة في تفريج كربة الغارمين ومساندة أسرهم.", href: "/donate#bank-accounts", image: "/flag-of-bahrain-rounded-corners.png" },
];

export default function DonationProjectsPage() {
  return <main className={styles.page}><section className={styles.projectsHero}><div className={styles.container}><h1>مشاريع التبرع</h1><p>اختر المجال الأقرب إلى قلبك وساهم في دعم أحد مشاريع الجمعية الخيرية.</p></div></section><section className={styles.projectsSection}><div className={`${styles.container} ${styles.projectsGrid}`}>{projects.map((project, index) => <article className={styles.projectCard} key={project.title}><div className={styles.projectImage}><Image src={project.image} alt={project.title} fill sizes="(max-width: 590px) 100vw, (max-width: 820px) 50vw, 33vw" /></div><div className={styles.projectBody}><small>{String(index + 1).padStart(2, "0")} · مشروع خيري</small><h2>{project.title}</h2><p>{project.text}</p><Link href={project.href}>تبرع للمشروع <FiArrowLeft /></Link></div></article>)}</div></section></main>;
}

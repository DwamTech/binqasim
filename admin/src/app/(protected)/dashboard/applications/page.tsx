import Link from "next/link";
import { requireDashboardAdmin } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";
import {
  joinApplicationTypes,
  joinApplicationTypeLabels,
} from "@/features/join-applications/join-applications.contracts";
import styles from "@/features/join-applications/components/join-applications.module.css";

export default async function ApplicationsOverviewPage() {
  await requireDashboardAdmin();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="الطلبات العامة"
          title="إدارة طلبات الانضمام"
          description="نقطة موحدة لمراجعة العضويات والمتطوعين والمرشدين وطلبات التوظيف."
        />
      }
    >
      <div className={styles.formGrid}>
        {joinApplicationTypes.map((type) => (
          <Link
            key={type}
            className={`${styles.applicationTypeCard} ui-card ui-focus`}
            href={`/dashboard/applications/${type}`}
          >
            <div>
              <span className={styles.eyebrow}>سجل إداري</span>
              <h2>{joinApplicationTypeLabels[type]}</h2>
              <p>عرض الطلبات وتحديث حالتها وإدارة بياناتها.</p>
            </div>
            <span aria-hidden="true">←</span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

"use client";

import { useRouter } from "next/navigation";

import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import type { SettingsTab } from "../settings.contracts";
import { ContactSettings } from "./contact-settings";
import { SiteStatusSettings } from "./site-status-settings";
import { SupportSettingsPanel } from "./support-settings-panel";
import { SystemContentSettings } from "./system-content-settings";
import styles from "./settings.module.css";

const tabs: Array<{
  id: SettingsTab;
  label: string;
  description: string;
  adminOnly: boolean;
}> = [
  {
    id: "contact",
    label: "بيانات التواصل",
    description: "القنوات وبيانات المنشأة",
    adminOnly: false,
  },
  {
    id: "support",
    label: "الخدمات والموديولات",
    description: "إتاحة الخدمات العامة",
    adminOnly: true,
  },
  {
    id: "status",
    label: "حالة الموقع",
    description: "فتح أو إيقاف الموقع",
    adminOnly: true,
  },
  {
    id: "content",
    label: "محتوى النظام",
    description: "النصوص العامة المعتمدة",
    adminOnly: true,
  },
];

export function SettingsPageView({
  initialTab,
  isAdmin,
}: {
  initialTab: SettingsTab;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const visibleTabs = tabs.filter((tab) => isAdmin || !tab.adminOnly);

  const selectTab = (tab: SettingsTab) => {
    if (!visibleTabs.some((item) => item.id === tab)) return;
    router.replace(`/dashboard/settings?tab=${tab}`, { scroll: false });
  };

  return (
    <PageContainer>
      <main className={styles.page}>
        <HeroSection
          eyebrow="مركز التحكم"
          title={dashboardCopy.modules.settings.pages.list}
          description="حدّث بيانات التواصل والخدمات والمحتوى العام من مكان واحد، مع حفظ مستقل وواضح لكل مجموعة."
          actions={
            <div className={styles.heroBadge} aria-label="حالة الاتصال">
              <span aria-hidden="true" />
              متصل بالنظام الحقيقي
            </div>
          }
        />

        <nav className={styles.tabs} aria-label="أقسام الإعدادات">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={initialTab === tab.id}
              className={initialTab === tab.id ? styles.activeTab : undefined}
              onClick={() => selectTab(tab.id)}
            >
              <strong>{tab.label}</strong>
              <small>{tab.description}</small>
            </button>
          ))}
        </nav>

        <section role="tabpanel" className={styles.panel}>
          {initialTab === "contact" && <ContactSettings />}
          {isAdmin && initialTab === "support" && <SupportSettingsPanel />}
          {isAdmin && initialTab === "status" && <SiteStatusSettings />}
          {isAdmin && initialTab === "content" && <SystemContentSettings />}
        </section>
      </main>
    </PageContainer>
  );
}

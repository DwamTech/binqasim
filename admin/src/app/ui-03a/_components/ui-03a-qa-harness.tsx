"use client";

import { useState } from "react";

import {
  AdminShell,
  type AdminShellAdmin,
  type NavigationItem,
} from "@/shared/components/layout/admin-shell";
import { PageContainer } from "@/shared/components/layout/page-container";
import { SessionExpiryDialog } from "@/shared/components/layout/session-expiry-dialog";
import { Button, PageHeader } from "@/shared/components/ui";

import styles from "./ui-03a-qa-harness.module.css";

const qaAdmin: AdminShellAdmin = {
  id: "qa-admin-static",
  name: "مدير الاختبار طويل الاسم",
  email: "qa-admin@example.test",
  role: "super_admin",
};

const qaNavigation: NavigationItem[] = [
  {
    id: "qa-dashboard",
    label: "لوحة اختبار الواجهة",
    href: "/ui-03a/overview",
  },
  {
    id: "qa-parent-section",
    label: "قسم متداخل للاختبار",
    href: "/ui-03a/section",
    children: [
      {
        id: "qa-current-page",
        label: "الصفحة الحالية",
        href: "/ui-03a",
      },
    ],
  },
  {
    id: "qa-disabled-item",
    label: "عنصر معطّل",
    href: "/ui-03a/disabled",
    disabled: true,
  },
];

export function Ui03aQaHarness() {
  const [dismissibleDialogOpen, setDismissibleDialogOpen] = useState(false);
  const [controlledDialogOpen, setControlledDialogOpen] = useState(false);

  return (
    <AdminShell
      admin={qaAdmin}
      navigation={qaNavigation}
      onLogout={() => undefined}
    >
      <PageContainer
        header={
          <PageHeader
            title="مختبر تجربة لوحة التحكم"
            description="مساحة معاينة ثابتة لمراجعة التفاصيل البصرية وسلوك الوصول"
          />
        }
      >
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>UI-٠٣A / EXPERIENCE LAB</p>
            <h2 className={styles.heroTitle}>
              واجهة أكثر وضوحًا، هدوءًا، وثقة في كل تفصيلة.
            </h2>
            <p className={styles.heroDescription}>
              بيئة عرض محلية ثابتة — لا تستخدم المصادقة أو واجهات API — لتجربة
              التنقل، الحالة، وإدارة التركيز بشكل بصري مريح.
            </p>
          </div>
          <div className={styles.heroMeta}>
            <div className={styles.metric}>
              <strong>RTL</strong>
              <span>مصمم للعربية من البداية</span>
            </div>
            <div className={styles.metric}>
              <strong>١٠٠٪</strong>
              <span>بيانات العرض ثابتة وآمنة</span>
            </div>
          </div>
        </section>
        <section className={styles.section}>
          <article className={styles.panel}>
            <p className={styles.panelLabel}>NAVIGATION REVIEW</p>
            <h2>التنقل بدون تشتيت</h2>
            <p>
              جرّب طي الشريط، العنصر المتداخل، العنصر المعطّل، والتنقل المحمول.
            </p>
            <ul className={styles.checkList}>
              <li>تمييز واضح للصفحة الحالية</li>
              <li>سلوك لوحة المفاتيح واستعادة التركيز</li>
              <li>تجربة متجاوبة للشاشات الصغيرة</li>
            </ul>
          </article>
          <article className={`${styles.panel} ${styles.panelAccent}`}>
            <p className={styles.panelLabel}>SESSION DIALOG</p>
            <h2>حالات انتهاء الجلسة</h2>
            <p>
              قارني بين الحوار القابل للإغلاق والحوار الذي تتحكم به الإجراءات
              فقط.
            </p>
            <div className={styles.actions}>
              <Button onClick={() => setDismissibleDialogOpen(true)}>
                فتح حوار قابل للإغلاق
              </Button>
              <Button
                variant="secondary"
                onClick={() => setControlledDialogOpen(true)}
              >
                فتح حوار يتحكم به الإجراء فقط
              </Button>
            </div>
          </article>
        </section>
      </PageContainer>
      <SessionExpiryDialog
        open={dismissibleDialogOpen}
        remainingSeconds={90}
        onClose={() => setDismissibleDialogOpen(false)}
        onExtend={() => setDismissibleDialogOpen(false)}
        onLogout={() => setDismissibleDialogOpen(false)}
      />
      <SessionExpiryDialog
        open={controlledDialogOpen}
        remainingSeconds={90}
        onExtend={() => setControlledDialogOpen(false)}
        onLogout={() => setControlledDialogOpen(false)}
      />
    </AdminShell>
  );
}

"use client";

import Link from "next/link";

import { PageContainer } from "@/shared/components/layout/page-container";
import { Alert, Button } from "@/shared/components/ui";

export default function PagesError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageContainer>
      <div dir="rtl">
        <Alert variant="error" title="تعذر فتح إدارة الصفحات">
          <p>لم نتمكن من تحميل هذه الشاشة. يمكنك إعادة المحاولة أو العودة إلى لوحة التحكم.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBlockStart: "var(--space-3)" }}>
            <Button onClick={reset}>إعادة المحاولة</Button>
            <Link className="ui-button ui-button--secondary ui-focus" href="/dashboard">العودة إلى لوحة التحكم</Link>
          </div>
        </Alert>
      </div>
    </PageContainer>
  );
}

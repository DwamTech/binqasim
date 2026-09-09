"use client";

import { ErrorState } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";

export default function VisualsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer>
      <ErrorState
        title={`تعذّر فتح ${dashboardCopy.modules.visuals.navigation}`}
        description="حاول مرة أخرى."
        onRetry={reset}
      />
    </PageContainer>
  );
}

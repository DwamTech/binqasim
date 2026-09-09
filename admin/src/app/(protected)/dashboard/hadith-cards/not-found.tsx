import Link from "next/link";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { EmptyState } from "@/shared/components/ui";

export default function HadithCardsNotFound() {
  return (
    <EmptyState
      title="المشروع المطلوب غير موجود"
      description="ربما حُذف المشروع أو تغير رابطه."
      action={
        <Link
          href="/dashboard/hadith-cards"
          className="ui-button ui-button--secondary ui-focus"
        >
          العودة إلى {dashboardCopy.modules.hadithCards.navigation}
        </Link>
      }
    />
  );
}

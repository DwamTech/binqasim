import Link from "next/link";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { EmptyState } from "@/shared/components/ui";

export default function ListeningNotFound() {
  return (
    <EmptyState
      title="السجل المطلوب غير موجود"
      description="ربما حُذف السجل أو تغير رابطه."
      action={
        <Link
          href="/dashboard/listening"
          className="ui-button ui-button--secondary ui-focus"
        >
          العودة إلى {dashboardCopy.modules.listening.navigation}
        </Link>
      }
    />
  );
}

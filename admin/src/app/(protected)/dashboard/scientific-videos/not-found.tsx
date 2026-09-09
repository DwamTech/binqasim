import Link from "next/link";

import { EmptyState } from "@/shared/components/ui";

export default function ScientificVideoNotFound() {
  return (
    <EmptyState
      title="المادة المرئية غير موجودة"
      description="ربما حُذفت المادة أو تغير رابطها."
      action={
        <Link
          href="/dashboard/scientific-videos"
          className="ui-button ui-button--secondary ui-focus"
        >
          العودة إلى المرئيات
        </Link>
      }
    />
  );
}

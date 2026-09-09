import Link from "next/link";

import { EmptyState } from "@/shared/components/ui";

export default function FatwaInboxNotFound() {
  return (
    <EmptyState
      title="السؤال غير موجود"
      description="ربما حُذف السؤال أو لم تعد تملك صلاحية عرض تفاصيله."
      action={
        <Link
          href="/dashboard/scientific-fatwas/inbox"
          className="ui-button ui-button--secondary ui-focus"
        >
          العودة إلى صندوق الأسئلة
        </Link>
      }
    />
  );
}

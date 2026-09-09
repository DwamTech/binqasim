import Link from "next/link";

import { EmptyState } from "@/shared/components/ui";

export default function DissertationNotFound() {
  return (
    <EmptyState
      title="الرسالة العلمية غير موجودة"
      description="ربما حُذفت الرسالة أو تغير رابطها."
      action={
        <Link
          href="/dashboard/dissertations"
          className="ui-button ui-button--secondary ui-focus"
        >
          العودة إلى الرسائل العلمية
        </Link>
      }
    />
  );
}

import Link from "next/link";
import { EmptyState } from "@/shared/components/ui";

export default function ScientificFatwaNotFound() {
  return (
    <EmptyState
      title="المسألة غير موجودة"
      description="ربما حُذفت أو تغير رابطها."
      action={
        <Link
          href="/dashboard/scientific-fatwas"
          className="ui-button ui-button--secondary ui-focus"
        >
          العودة إلى الفتاوى
        </Link>
      }
    />
  );
}

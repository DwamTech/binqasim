import Link from "next/link";

import { EmptyState } from "@/shared/components/ui";

export default function CommentNotFound() {
  return (
    <EmptyState
      title="التعليق غير موجود"
      description="ربما حُذف التعليق أو أن الرابط غير صحيح."
      action={
        <Link
          href="/dashboard/comments"
          className="ui-button ui-button--secondary ui-focus"
        >
          العودة إلى إدارة التعليقات
        </Link>
      }
    />
  );
}

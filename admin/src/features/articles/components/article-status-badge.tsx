import { Badge } from "@/shared/components/ui";

import { articleStatusLabels, type ArticleStatus } from "../articles.contracts";

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <Badge
      variant={
        status === "published"
          ? "success"
          : status === "scheduled"
            ? "warning"
            : status === "archived"
              ? "warning"
              : "default"
      }
    >
      {articleStatusLabels[status]}
    </Badge>
  );
}

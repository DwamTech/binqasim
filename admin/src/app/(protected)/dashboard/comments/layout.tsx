import type { ReactNode } from "react";

import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export default function CommentsLayout({ children }: { children: ReactNode }) {
  requireDashboardModuleEnabled("comments");
  return children;
}

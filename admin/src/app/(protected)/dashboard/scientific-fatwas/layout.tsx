import type { ReactNode } from "react";

import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export default function ScientificFatwasDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  requireDashboardModuleEnabled("scientificFatwas");
  return children;
}

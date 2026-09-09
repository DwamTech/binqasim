import type { Metadata } from "next";

import { TourGuidesOverview } from "@/features/tour-guides/presentation/tour-guides-overview";

export const metadata: Metadata = { title: "إدارة الرحلات السياحية" };

export default function TourGuidesPage() {
  return <TourGuidesOverview />;
}

import type { Metadata } from "next";

import { TourGuidesListView } from "@/features/tour-guides/presentation/tour-guides-list-view";

export const metadata: Metadata = { title: "إدارة المرشدين السياحيين السياحيين" };

export default function TourGuidesListPage() {
  return <TourGuidesListView />;
}

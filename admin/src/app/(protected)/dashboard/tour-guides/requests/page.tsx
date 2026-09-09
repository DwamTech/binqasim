import type { Metadata } from "next";

import { TourRequestsListView } from "@/features/tour-guides/presentation/tour-requests-list-view";

export const metadata: Metadata = { title: "طلبات الرحلات السياحية" };

export default function TourRequestsPage() {
  return <TourRequestsListView />;
}

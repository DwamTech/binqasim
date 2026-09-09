import type { Metadata } from "next";

import { TourRequestDetailView } from "@/features/tour-guides/presentation/tour-request-detail-view";

export const metadata: Metadata = { title: "تفاصيل طلب الرحلة" };

export default async function TourRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TourRequestDetailView requestId={id} />;
}

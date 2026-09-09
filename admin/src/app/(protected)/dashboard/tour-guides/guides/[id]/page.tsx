import type { Metadata } from "next";

import { TourGuideDetailView } from "@/features/tour-guides/presentation/tour-guide-detail-view";

export const metadata: Metadata = { title: "بيانات المرشد السياحي" };

export default async function TourGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TourGuideDetailView guideId={id} />;
}

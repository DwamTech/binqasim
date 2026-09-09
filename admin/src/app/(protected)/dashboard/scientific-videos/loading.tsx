import { dashboardCopy } from "@/core/config/dashboard-copy";
import { LoadingState } from "@/shared/components/ui";

export default function ScientificVideosLoading() {
  return (
    <LoadingState
      label={`جارٍ تحميل ${dashboardCopy.modules.scientificVideos.navigation}...`}
    />
  );
}

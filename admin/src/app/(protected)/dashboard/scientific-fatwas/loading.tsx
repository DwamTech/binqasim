import { dashboardCopy } from "@/core/config/dashboard-copy";
import { LoadingState } from "@/shared/components/ui";

export default function ScientificFatwasLoading() {
  return (
    <LoadingState
      label={`جارٍ تحميل ${dashboardCopy.modules.scientificFatwas.navigation}...`}
    />
  );
}

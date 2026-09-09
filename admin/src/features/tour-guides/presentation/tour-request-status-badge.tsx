import {
  tourRequestStatusLabels,
  type TourRequestStatus,
} from "../domain/tour-guides.contracts";
import styles from "./tour-guides.module.css";

export function TourRequestStatusBadge({
  status,
}: {
  status: TourRequestStatus;
}) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      {tourRequestStatusLabels[status]}
    </span>
  );
}

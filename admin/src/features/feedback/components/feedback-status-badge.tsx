import {
  feedbackStatusLabels,
  type FeedbackStatus,
} from "../feedback.contracts";
import styles from "./feedback.module.css";

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      <i aria-hidden="true" />
      {feedbackStatusLabels[status]}
    </span>
  );
}

import {
  commentStatusLabels,
  type CommentStatus,
} from "../domain/comments.contracts";
import styles from "./comments.module.css";

export function CommentStatusBadge({ status }: { status: CommentStatus }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      <i aria-hidden="true" />
      {commentStatusLabels[status]}
    </span>
  );
}

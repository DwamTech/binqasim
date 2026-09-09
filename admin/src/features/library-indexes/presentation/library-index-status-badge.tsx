import type { LibraryIndexSubmissionStatus } from "../domain/library-indexes.contracts";
import { libraryIndexSubmissionStatusLabels } from "../domain/library-indexes.contracts";
import styles from "./library-indexes.module.css";

export function LibraryIndexStatusBadge({
  status,
}: {
  status: LibraryIndexSubmissionStatus;
}) {
  return (
    <span
      className={`${styles.statusBadge} ${styles[`status_${status}`] ?? ""}`}
    >
      <i aria-hidden="true" />
      {libraryIndexSubmissionStatusLabels[status]}
    </span>
  );
}

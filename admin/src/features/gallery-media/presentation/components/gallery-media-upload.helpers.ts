import type {
  GalleryMediaMutationResult,
  GalleryMediaUploadState,
} from "../../domain/gallery-media.contracts";

export type UploadQueueItem = {
  file: File;
  state: GalleryMediaUploadState;
  error?: string;
};
export type UploadFileAction = (
  file: File,
) => Promise<GalleryMediaMutationResult>;

function failureMessage(
  result: Extract<GalleryMediaMutationResult, { success: false }>,
) {
  return (
    result.fieldErrors?.["files.0"]?.[0] ??
    result.fieldErrors?.files?.[0] ??
    result.message
  );
}

/** Uploads one request at a time so the server-action body cap is never exceeded. */
export async function uploadGalleryMediaSequentially(
  items: readonly UploadQueueItem[],
  action: UploadFileAction,
  update: (index: number, item: UploadQueueItem) => void,
): Promise<{ succeeded: number; attempted: number }> {
  let succeeded = 0;
  let attempted = 0;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (item === undefined || item.state === "success") continue;
    attempted += 1;
    update(index, { file: item.file, state: "uploading" });
    const result = await action(item.file);
    if (result.success) {
      succeeded += 1;
      update(index, { file: item.file, state: "success" });
    } else
      update(index, {
        file: item.file,
        state: "failed",
        error: failureMessage(result),
      });
  }
  return { succeeded, attempted };
}

export function shouldRedirectAfterGalleryUpload(result: {
  succeeded: number;
  attempted: number;
}): boolean {
  return result.attempted > 0 && result.succeeded === result.attempted;
}

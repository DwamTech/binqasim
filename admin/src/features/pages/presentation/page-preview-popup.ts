import type { PagePreview } from "../domain/pages.contracts";

type PreviewWindow = {
  close(): void;
  location: { replace(url: string): void };
  opener: unknown;
};

type OpenPreviewWindow = (url: string, target: string) => PreviewWindow | null;

export class PagePreviewPopupBlockedError extends Error {
  constructor(
    message = "تعذر فتح نافذة المعاينة. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.",
  ) {
    super(message);
    this.name = "PagePreviewPopupBlockedError";
  }
}

export async function openPagePreview(
  createPreview: () => Promise<PagePreview>,
  openWindow: OpenPreviewWindow = (url, target) =>
    window.open(url, target) as PreviewWindow | null,
  targetName = "cms_page_preview",
): Promise<PagePreview> {
  const previewWindow = openWindow("about:blank", targetName);

  if (previewWindow === null) {
    throw new PagePreviewPopupBlockedError();
  }

  try {
    previewWindow.opener = null;
  } catch {
    previewWindow.close();
    throw new PagePreviewPopupBlockedError(
      "تعذر فتح نافذة معاينة آمنة. تحقق من إعدادات المتصفح ثم حاول مرة أخرى.",
    );
  }

  try {
    const preview = await createPreview();
    previewWindow.location.replace(preview.preview_url);
    return preview;
  } catch (error) {
    previewWindow.close();
    throw error;
  }
}

export function notifyPreviewUpdate(pageId: string | number): void {
  try {
    if (typeof window !== "undefined") {
      const channel = new BroadcastChannel("cms_page_preview_channel");
      channel.postMessage({ type: "PREVIEW_UPDATED", pageId: String(pageId) });
      channel.close();
      localStorage.setItem(
        `cms_page_preview_updated_${pageId}`,
        String(Date.now()),
      );
    }
  } catch {
    // Ignore in non-browser environments
  }
}

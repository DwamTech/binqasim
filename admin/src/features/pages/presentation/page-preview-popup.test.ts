import { describe, expect, it, vi } from "vitest";

import {
  openPagePreview,
  PagePreviewPopupBlockedError,
} from "./page-preview-popup";

const preview = {
  token: "a".repeat(64),
  expires_at: "2026-08-28T12:00:00Z",
  preview_url: `https://public.example.com/pages-preview/${"a".repeat(64)}`,
};

function popup() {
  return {
    close: vi.fn(),
    location: { replace: vi.fn() },
    opener: {} as unknown,
  };
}

describe("Pages Preview popup workflow", () => {
  it("opens synchronously, clears opener, then navigates after Preview creation", async () => {
    const events: string[] = [];
    const window = popup();
    const openWindow = vi.fn(() => {
      events.push("open");
      return window;
    });
    let resolvePreview: ((value: typeof preview) => void) | undefined;
    const createPreview = vi.fn(
      () =>
        new Promise<typeof preview>((resolve) => {
          events.push("request");
          resolvePreview = resolve;
        }),
    );

    const pending = openPagePreview(createPreview, openWindow);

    expect(events).toEqual(["open", "request"]);
    expect(openWindow).toHaveBeenCalledWith("about:blank", "cms_page_preview");
    expect(window.opener).toBeNull();
    expect(window.location.replace).not.toHaveBeenCalled();

    resolvePreview?.(preview);
    await expect(pending).resolves.toEqual(preview);
    expect(window.location.replace).toHaveBeenCalledWith(preview.preview_url);
    expect(window.close).not.toHaveBeenCalled();
  });

  it("does not create a token when the browser blocks the placeholder", async () => {
    const createPreview = vi.fn(() => Promise.resolve(preview));

    await expect(openPagePreview(createPreview, () => null)).rejects.toThrow(
      "اسمح بالنوافذ المنبثقة",
    );
    expect(createPreview).not.toHaveBeenCalled();
  });

  it("closes the placeholder and preserves the API error on failure", async () => {
    const window = popup();
    const failure = new Error("Preview failed");

    await expect(
      openPagePreview(
        () => Promise.reject(failure),
        () => window,
      ),
    ).rejects.toBe(failure);
    expect(window.close).toHaveBeenCalledOnce();
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it("closes and fails safely if opener cannot be cleared", async () => {
    const window = popup();
    Object.defineProperty(window, "opener", {
      set() {
        throw new Error("unsupported");
      },
    });
    const createPreview = vi.fn(() => Promise.resolve(preview));

    await expect(
      openPagePreview(createPreview, () => window),
    ).rejects.toBeInstanceOf(PagePreviewPopupBlockedError);
    expect(window.close).toHaveBeenCalledOnce();
    expect(createPreview).not.toHaveBeenCalled();
  });
});

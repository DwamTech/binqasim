import { describe, expect, it, vi } from "vitest";

import {
  guardedAnchorDestination,
  PagesUnsavedNavigationGuardController,
  type PagesPendingNavigation,
  type PagesUnsavedNavigationGuardOptions,
} from "./pages-unsaved-navigation-guard.core";

type TestEvent = Event & { immediateStopped: boolean };
type TestClickEvent = TestEvent &
  Pick<
    MouseEvent,
    | "altKey"
    | "button"
    | "ctrlKey"
    | "defaultPrevented"
    | "metaKey"
    | "shiftKey"
    | "target"
  >;

class FakeEventSource {
  private readonly listeners = new Map<string, EventListener[]>();

  addEventListener(type: string, listener: EventListener): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  removeEventListener(type: string, listener: EventListener): void {
    this.listeners.set(
      type,
      (this.listeners.get(type) ?? []).filter((item) => item !== listener),
    );
  }

  emit(type: string, event: TestEvent): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
      if (event.immediateStopped) break;
    }
  }

  count(type: string): number {
    return this.listeners.get(type)?.length ?? 0;
  }
}

function testEvent(
  extra: Record<string, unknown> = {},
  cancelable = true,
): TestEvent {
  const event = {
    cancelable,
    defaultPrevented: false,
    immediateStopped: false,
    preventDefault() {
      if (this.cancelable) this.defaultPrevented = true;
    },
    stopImmediatePropagation() {
      this.immediateStopped = true;
    },
    stopPropagation() {},
    ...extra,
  };

  return event as unknown as TestEvent;
}

function clickEvent({
  href,
  target = "",
  download = false,
  button = 0,
  altKey = false,
  ctrlKey = false,
  metaKey = false,
  shiftKey = false,
  anchor = true,
}: {
  href: string;
  target?: string;
  download?: boolean;
  button?: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  anchor?: boolean;
}): TestClickEvent {
  return testEvent({
    altKey,
    button,
    ctrlKey,
    metaKey,
    shiftKey,
    target: {
      closest: () =>
        anchor
          ? {
              hasAttribute: (name: string) => name === "download" && download,
              href,
              target,
            }
          : null,
    },
  }) as TestClickEvent;
}

function navigationEvent(href: string, key = "destination"): TestEvent {
  return testEvent({
    destination: { key, url: href },
    navigationType: "traverse",
  });
}

function createHarness({ navigationApi = true } = {}) {
  const editorHref =
    "https://dashboard.test/dashboard/pages/7/edit?tab=content";
  const windowEvents = new FakeEventSource();
  const documentEvents = new FakeEventSource();
  const navigationEvents = new FakeEventSource();
  const location = {
    href: editorHref,
    origin: "https://dashboard.test",
  };
  const editorState = { __NA: true, editor: 7 };
  const history = {
    back: vi.fn(),
    pushState: vi.fn((state: unknown, _unused: string, url?: string | URL) => {
      history.state = state;
      if (url !== undefined) location.href = new URL(url, location.href).href;
    }),
    state: editorState as unknown,
  };
  const traverseTo = vi.fn(() => ({ finished: Promise.resolve() }));
  const navigate = vi.fn();
  const pending: Array<PagesPendingNavigation | null> = [];
  const windowLike = {
    addEventListener: windowEvents.addEventListener.bind(windowEvents),
    removeEventListener: windowEvents.removeEventListener.bind(windowEvents),
    history,
    location,
    ...(navigationApi
      ? {
          navigation: {
            addEventListener:
              navigationEvents.addEventListener.bind(navigationEvents),
            removeEventListener:
              navigationEvents.removeEventListener.bind(navigationEvents),
            traverseTo,
          },
        }
      : {}),
  } satisfies PagesUnsavedNavigationGuardOptions["window"];
  const controller = new PagesUnsavedNavigationGuardController({
    document: {
      addEventListener: documentEvents.addEventListener.bind(documentEvents),
      removeEventListener:
        documentEvents.removeEventListener.bind(documentEvents),
    },
    navigate,
    onPendingChange: (value) => pending.push(value),
    window: windowLike,
  });

  return {
    controller,
    documentEvents,
    editorHref,
    editorState,
    history,
    location,
    navigate,
    navigationEvents,
    pending,
    traverseTo,
    windowEvents,
  };
}

describe("Pages unsaved navigation guard", () => {
  it("does not intercept clean Pages links, shared anchors, Back, or Forward", () => {
    const harness = createHarness();

    harness.controller.requestNavigation("/dashboard/pages");
    expect(harness.navigate).toHaveBeenCalledWith("/dashboard/pages");

    const sharedLink = clickEvent({
      href: "https://dashboard.test/dashboard/articles",
    });
    harness.documentEvents.emit("click", sharedLink);
    expect(sharedLink.defaultPrevented).toBe(false);

    for (const href of [
      "https://dashboard.test/dashboard",
      "https://dashboard.test/dashboard/pages",
    ]) {
      const traversal = navigationEvent(href);
      harness.navigationEvents.emit("navigate", traversal);
      expect(traversal.defaultPrevented).toBe(false);
    }
  });

  it("prompts Pages Back and Revision History through one guard", () => {
    const harness = createHarness();
    harness.controller.setDirty(true);

    harness.controller.requestNavigation("/dashboard/pages");
    harness.controller.requestNavigation("/dashboard/pages/7/revisions");

    expect(harness.pending.at(-1)).toEqual({
      kind: "anchor",
      href: "/dashboard/pages",
    });
    expect(harness.navigate).not.toHaveBeenCalled();

    harness.controller.stay();
    harness.controller.requestNavigation("/dashboard/pages/7/revisions");
    harness.controller.discard();
    expect(harness.navigate).toHaveBeenCalledOnce();
    expect(harness.navigate).toHaveBeenCalledWith(
      "/dashboard/pages/7/revisions",
    );
  });

  it("captures a shared same-origin destination exactly and Stay performs no work", () => {
    const harness = createHarness();
    harness.controller.setDirty(true);
    const edits = {
      title: "عنوان محلي",
      component: { title: "Hero محلي" },
      seo: { title: "SEO محلي" },
    };
    const click = clickEvent({
      href: "https://dashboard.test/dashboard/articles?page=2#recent",
    });

    harness.documentEvents.emit("click", click);
    expect(click.defaultPrevented).toBe(true);
    expect(harness.pending.at(-1)).toEqual({
      kind: "anchor",
      href: "/dashboard/articles?page=2#recent",
    });

    harness.controller.stay();
    expect(harness.location.href).toBe(harness.editorHref);
    expect(edits).toEqual({
      title: "عنوان محلي",
      component: { title: "Hero محلي" },
      seo: { title: "SEO محلي" },
    });
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it("discards to the captured shared destination without saving", () => {
    const harness = createHarness();
    harness.controller.setDirty(true);
    const click = clickEvent({
      href: "https://dashboard.test/dashboard/gallery?filter=active",
    });

    harness.documentEvents.emit("click", click);
    harness.controller.discard();

    expect(harness.navigate).toHaveBeenCalledOnce();
    expect(harness.navigate).toHaveBeenCalledWith(
      "/dashboard/gallery?filter=active",
    );
  });

  it.each([
    ["external", { href: "https://example.com/about" }],
    [
      "new tab",
      { href: "https://dashboard.test/pages/about", target: "_blank" },
    ],
    ["download", { href: "https://dashboard.test/file.pdf", download: true }],
    ["Ctrl click", { href: "https://dashboard.test/dashboard", ctrlKey: true }],
    ["Cmd click", { href: "https://dashboard.test/dashboard", metaKey: true }],
    [
      "Shift click",
      { href: "https://dashboard.test/dashboard", shiftKey: true },
    ],
    ["Alt click", { href: "https://dashboard.test/dashboard", altKey: true }],
    ["middle click", { href: "https://dashboard.test/dashboard", button: 1 }],
    ["same-page fragment", { href: `${createHarness().editorHref}#seo` }],
    ["non-anchor", { href: "https://dashboard.test/dashboard", anchor: false }],
  ])("does not hijack excluded %s navigation", (_label, input) => {
    const harness = createHarness();
    harness.controller.setDirty(true);
    const click = clickEvent(input);

    harness.documentEvents.emit("click", click);

    expect(click.defaultPrevented).toBe(false);
    expect(harness.pending).toEqual([]);
  });

  it("guards Back and Forward symmetrically through the Navigation API", () => {
    const harness = createHarness();
    harness.controller.setDirty(true);

    const back = navigationEvent(
      "https://dashboard.test/dashboard/pages",
      "back-key",
    );
    harness.navigationEvents.emit("navigate", back);
    expect(back.defaultPrevented).toBe(true);
    expect(harness.location.href).toBe(harness.editorHref);

    harness.controller.stay();
    const forward = navigationEvent(
      "https://dashboard.test/dashboard/articles",
      "forward-key",
    );
    harness.navigationEvents.emit("navigate", forward);
    expect(forward.defaultPrevented).toBe(true);

    harness.controller.discard();
    expect(harness.traverseTo).toHaveBeenCalledWith("forward-key");
    const approved = navigationEvent(
      "https://dashboard.test/dashboard/articles",
      "forward-key",
    );
    harness.navigationEvents.emit("navigate", approved);
    expect(approved.defaultPrevented).toBe(false);

    harness.location.href = "https://dashboard.test/dashboard/articles";
    harness.windowEvents.emit("popstate", testEvent());
    const nextAttempt = navigationEvent(
      "https://dashboard.test/dashboard/settings",
      "next-key",
    );
    harness.navigationEvents.emit("navigate", nextAttempt);
    expect(nextAttempt.defaultPrevented).toBe(true);
  });

  it("uses one reusable editor entry for popstate fallback and preserves Next's state", () => {
    const harness = createHarness({ navigationApi: false });
    const nextListener = vi.fn();
    harness.controller.setDirty(true);
    harness.windowEvents.addEventListener("popstate", nextListener);

    harness.location.href = "https://dashboard.test/dashboard/pages";
    harness.windowEvents.emit("popstate", testEvent());

    expect(nextListener).not.toHaveBeenCalled();
    expect(harness.history.pushState).toHaveBeenCalledWith(
      harness.editorState,
      "",
      harness.editorHref,
    );
    expect(harness.location.href).toBe(harness.editorHref);
    expect(harness.pending.at(-1)).toEqual({
      kind: "history",
      href: "https://dashboard.test/dashboard/pages",
      strategy: "popstate",
    });

    harness.controller.stay();
    harness.location.href = "https://dashboard.test/dashboard/pages";
    harness.windowEvents.emit("popstate", testEvent());
    expect(harness.history.pushState).toHaveBeenCalledTimes(2);
  });

  it("completes fallback history traversal with a one-shot bypass", () => {
    const harness = createHarness({ navigationApi: false });
    harness.controller.setDirty(true);
    const destination = "https://dashboard.test/dashboard/pages";

    harness.location.href = destination;
    harness.windowEvents.emit("popstate", testEvent());
    harness.controller.discard();
    expect(harness.history.back).toHaveBeenCalledOnce();

    harness.location.href = destination;
    harness.windowEvents.emit("popstate", testEvent());
    expect(harness.history.pushState).toHaveBeenCalledOnce();

    harness.location.href = "https://dashboard.test/dashboard/articles";
    harness.windowEvents.emit("popstate", testEvent());
    expect(harness.history.pushState).toHaveBeenCalledTimes(2);
  });

  it("registers beforeunload only while dirty and removes every listener", () => {
    const harness = createHarness();
    expect(harness.windowEvents.count("beforeunload")).toBe(0);

    harness.controller.setDirty(true);
    const unload = testEvent();
    harness.windowEvents.emit("beforeunload", unload);
    expect(unload.defaultPrevented).toBe(true);
    expect(harness.windowEvents.count("beforeunload")).toBe(1);
    expect(harness.documentEvents.count("click")).toBe(1);
    expect(harness.windowEvents.count("popstate")).toBe(1);

    harness.controller.dispose();
    expect(harness.windowEvents.count("beforeunload")).toBe(0);
    expect(harness.documentEvents.count("click")).toBe(0);
    expect(harness.windowEvents.count("popstate")).toBe(0);
    expect(harness.navigationEvents.count("navigate")).toBe(0);
  });

  it("successful Save disables protection while failed Save leaves it active", () => {
    const successful = createHarness();
    successful.controller.setDirty(true);
    successful.controller.setDirty(false);
    successful.controller.requestNavigation("/dashboard/pages");
    expect(successful.navigate).toHaveBeenCalledWith("/dashboard/pages");

    const failed = createHarness();
    failed.controller.setDirty(true);
    failed.controller.requestNavigation("/dashboard/pages");
    expect(failed.navigate).not.toHaveBeenCalled();
    expect(failed.pending.at(-1)).toEqual({
      kind: "anchor",
      href: "/dashboard/pages",
    });
  });
});

describe("guardedAnchorDestination", () => {
  it("rejects malformed and non-http destinations", () => {
    const current = "https://dashboard.test/dashboard/pages/7/edit";
    expect(
      guardedAnchorDestination(
        clickEvent({ href: "mailto:admin@example.com" }),
        current,
      ),
    ).toBeNull();
    expect(
      guardedAnchorDestination(clickEvent({ href: "tel:+201234" }), current),
    ).toBeNull();
  });
});

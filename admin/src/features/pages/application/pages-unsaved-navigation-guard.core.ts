export type PagesPendingNavigation =
  | { kind: "anchor"; href: string }
  | {
      kind: "history";
      href: string;
      strategy: "navigation-api";
      destinationKey: string;
    }
  | { kind: "history"; href: string; strategy: "popstate" };

type NavigationDestination = { key: string; url: string };
type NavigationEventLike = Event & {
  destination: NavigationDestination;
  navigationType: string;
};
type NavigationResultLike = { finished?: Promise<unknown> };
type NavigationApiLike = {
  addEventListener(type: "navigate", listener: EventListener): void;
  removeEventListener(type: "navigate", listener: EventListener): void;
  traverseTo(key: string): NavigationResultLike | undefined;
};
type WindowLike = {
  addEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions,
  ): void;
  history: Pick<History, "back" | "pushState" | "state">;
  location: Pick<Location, "href" | "origin">;
  navigation?: NavigationApiLike;
};
type DocumentLike = {
  addEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions,
  ): void;
};
type AnchorLike = {
  hasAttribute(name: string): boolean;
  href: string;
  target: string;
};
type AnchorTargetLike = { closest(selector: string): AnchorLike | null };

export type PagesUnsavedNavigationGuardOptions = {
  document: DocumentLike;
  navigate: (href: string) => void;
  onPendingChange: (pending: PagesPendingNavigation | null) => void;
  window: WindowLike;
};

function samePageIgnoringHash(left: URL, right: URL): boolean {
  return (
    left.origin === right.origin &&
    left.pathname === right.pathname &&
    left.search === right.search
  );
}

function isLeavingEditor(destination: string, editorHref: string): boolean {
  try {
    return !samePageIgnoringHash(new URL(destination), new URL(editorHref));
  } catch {
    return false;
  }
}

function anchorFromClick(event: MouseEvent): AnchorLike | null {
  const target = event.target as Partial<AnchorTargetLike> | null;

  return typeof target?.closest === "function"
    ? target.closest("a[href]")
    : null;
}

export function guardedAnchorDestination(
  event: Pick<
    MouseEvent,
    | "altKey"
    | "button"
    | "ctrlKey"
    | "defaultPrevented"
    | "metaKey"
    | "shiftKey"
    | "target"
  >,
  currentHref: string,
): string | null {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return null;
  }

  const anchor = anchorFromClick(event as MouseEvent);
  if (anchor === null || anchor.hasAttribute("download")) return null;

  const target = anchor.target.trim().toLowerCase();
  if (target !== "" && target !== "_self") return null;

  try {
    const current = new URL(currentHref);
    const destination = new URL(anchor.href, current);

    if (
      (destination.protocol !== "http:" && destination.protocol !== "https:") ||
      destination.origin !== current.origin ||
      samePageIgnoringHash(destination, current)
    ) {
      return null;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}

export class PagesUnsavedNavigationGuardController {
  private active = false;
  private bypassHistoryHref: string | null = null;
  private editorHref = "";
  private editorHistoryState: unknown;
  private pending: PagesPendingNavigation | null = null;

  constructor(private readonly options: PagesUnsavedNavigationGuardOptions) {}

  setDirty(dirty: boolean): void {
    if (dirty === this.active) return;
    if (dirty) this.activate();
    else this.deactivate();
  }

  requestNavigation(href: string): void {
    if (!this.active) {
      this.options.navigate(href);
      return;
    }

    this.queue({ kind: "anchor", href });
  }

  stay(): void {
    this.setPending(null);
  }

  discard(): void {
    const pending = this.pending;
    if (pending === null) return;

    this.setPending(null);

    if (pending.kind === "anchor") {
      this.options.navigate(pending.href);
      return;
    }

    this.bypassHistoryHref = pending.href;

    if (pending.strategy === "navigation-api") {
      try {
        const result = this.options.window.navigation?.traverseTo(
          pending.destinationKey,
        );
        void result?.finished?.catch(() => {
          this.bypassHistoryHref = null;
        });
      } catch {
        this.bypassHistoryHref = null;
      }
      return;
    }

    this.options.window.history.back();
  }

  dispose(): void {
    this.deactivate();
  }

  private activate(): void {
    this.active = true;
    this.editorHref = this.options.window.location.href;
    this.editorHistoryState = this.options.window.history.state;
    this.options.window.addEventListener("beforeunload", this.onBeforeUnload);
    this.options.document.addEventListener("click", this.onDocumentClick, true);
    this.options.window.addEventListener("popstate", this.onPopState, true);
    this.options.window.navigation?.addEventListener(
      "navigate",
      this.onNavigate,
    );
  }

  private deactivate(): void {
    if (!this.active) return;
    this.active = false;
    this.bypassHistoryHref = null;
    this.options.window.removeEventListener(
      "beforeunload",
      this.onBeforeUnload,
    );
    this.options.document.removeEventListener(
      "click",
      this.onDocumentClick,
      true,
    );
    this.options.window.removeEventListener("popstate", this.onPopState, true);
    this.options.window.navigation?.removeEventListener(
      "navigate",
      this.onNavigate,
    );
    this.setPending(null);
  }

  private queue(pending: PagesPendingNavigation): void {
    if (this.pending !== null) return;
    this.setPending(pending);
  }

  private setPending(pending: PagesPendingNavigation | null): void {
    this.pending = pending;
    this.options.onPendingChange(pending);
  }

  private readonly onBeforeUnload = (event: Event): void => {
    event.preventDefault();
    (event as BeforeUnloadEvent).returnValue = "";
  };

  private readonly onDocumentClick = (event: Event): void => {
    const destination = guardedAnchorDestination(
      event as MouseEvent,
      this.options.window.location.href,
    );
    if (destination === null) return;

    event.preventDefault();
    event.stopPropagation();
    this.queue({ kind: "anchor", href: destination });
  };

  private readonly onNavigate = (event: Event): void => {
    const navigationEvent = event as NavigationEventLike;
    if (
      navigationEvent.navigationType !== "traverse" ||
      !isLeavingEditor(navigationEvent.destination.url, this.editorHref)
    ) {
      return;
    }

    if (this.bypassHistoryHref === navigationEvent.destination.url) return;
    if (!event.cancelable) return;

    event.preventDefault();
    this.queue({
      kind: "history",
      href: navigationEvent.destination.url,
      strategy: "navigation-api",
      destinationKey: navigationEvent.destination.key,
    });
  };

  /**
   * Popstate cannot be cancelled. On browsers without the Navigation API, the
   * capture listener therefore stops Next from consuming the attempted entry
   * and immediately pushes the saved editor entry back on top. The attempted
   * destination is now exactly one Back step away. Stay keeps that editor
   * entry; Discard sets a one-shot destination bypass and performs that Back.
   * A repeated attempt replaces the prior forward editor entry instead of
   * installing a permanent sentinel or growing the stack without bound.
   */
  private readonly onPopState = (event: Event): void => {
    const destination = this.options.window.location.href;

    if (this.bypassHistoryHref === destination) {
      this.bypassHistoryHref = null;
      return;
    }
    if (!isLeavingEditor(destination, this.editorHref)) return;

    event.stopImmediatePropagation();
    this.options.window.history.pushState(
      this.editorHistoryState,
      "",
      this.editorHref,
    );
    this.queue({ kind: "history", href: destination, strategy: "popstate" });
  };
}

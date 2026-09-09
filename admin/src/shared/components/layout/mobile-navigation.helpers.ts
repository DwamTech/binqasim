export type BodyOverflowStyle = {
  overflow: string;
};

export function lockBodyScroll(style: BodyOverflowStyle): () => void {
  const previousOverflow = style.overflow;
  style.overflow = "hidden";

  return () => {
    style.overflow = previousOverflow;
  };
}

export function focusDrawerAndRestoreTrigger(
  drawer: Pick<HTMLElement, "focus"> | null,
  trigger: Pick<HTMLElement, "focus"> | null,
): () => void {
  drawer?.focus();
  return () => trigger?.focus();
}

export function getFocusTrapDestination({
  key,
  shiftKey,
  activeElement,
  first,
  last,
}: {
  key: string;
  shiftKey: boolean;
  activeElement: unknown;
  first: unknown;
  last: unknown;
}): "first" | "last" | null {
  if (key !== "Tab") return null;
  if (shiftKey && activeElement === first) return "last";
  if (!shiftKey && activeElement === last) return "first";
  return null;
}

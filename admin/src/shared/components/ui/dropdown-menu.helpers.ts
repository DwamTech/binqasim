export function isPointerOutsideDropdown(
  target: Node,
  trigger: Pick<Node, "contains"> | null,
  menu: Pick<Node, "contains"> | null,
): boolean {
  return !trigger?.contains(target) && !menu?.contains(target);
}

export function getNextMenuItemIndex(
  currentIndex: number,
  itemCount: number,
  key: string,
): number | null {
  if (itemCount === 0) return null;
  if (key === "Home") return 0;
  if (key === "End") return itemCount - 1;
  if (key === "ArrowDown") return (currentIndex + 1 + itemCount) % itemCount;
  if (key === "ArrowUp") return (currentIndex - 1 + itemCount) % itemCount;
  return null;
}

export function getToggledDropdownState(open: boolean): boolean {
  return !open;
}

export function shouldCloseDropdownForKey(key: string): boolean {
  return key === "Escape";
}

export function focusElement(element: Pick<HTMLElement, "focus"> | null): void {
  element?.focus();
}

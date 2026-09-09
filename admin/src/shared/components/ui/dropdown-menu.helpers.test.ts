import { describe, expect, it, vi } from "vitest";

import {
  focusElement,
  getNextMenuItemIndex,
  getToggledDropdownState,
  isPointerOutsideDropdown,
  shouldCloseDropdownForKey,
} from "./dropdown-menu.helpers";

describe("dropdown menu behavior", () => {
  it("closes only when the pointer is outside both trigger and menu", () => {
    const triggerTarget = {} as Node;
    const menuTarget = {} as Node;
    const outsideTarget = {} as Node;
    const trigger = { contains: (target: Node) => target === triggerTarget };
    const menu = { contains: (target: Node) => target === menuTarget };

    expect(isPointerOutsideDropdown(triggerTarget, trigger, menu)).toBe(false);
    expect(isPointerOutsideDropdown(menuTarget, trigger, menu)).toBe(false);
    expect(isPointerOutsideDropdown(outsideTarget, trigger, menu)).toBe(true);
  });

  it("supports wrapping arrows and Home/End keyboard navigation", () => {
    expect(getNextMenuItemIndex(0, 3, "ArrowDown")).toBe(1);
    expect(getNextMenuItemIndex(2, 3, "ArrowDown")).toBe(0);
    expect(getNextMenuItemIndex(0, 3, "ArrowUp")).toBe(2);
    expect(getNextMenuItemIndex(1, 3, "Home")).toBe(0);
    expect(getNextMenuItemIndex(1, 3, "End")).toBe(2);
    expect(getNextMenuItemIndex(1, 3, "Tab")).toBeNull();
  });

  it("covers opening, Escape closure, and focus restoration primitives", () => {
    expect(getToggledDropdownState(false)).toBe(true);
    expect(getToggledDropdownState(true)).toBe(false);
    expect(shouldCloseDropdownForKey("Escape")).toBe(true);
    expect(shouldCloseDropdownForKey("Enter")).toBe(false);

    const focus = vi.fn();
    focusElement({ focus });
    expect(focus).toHaveBeenCalledOnce();
  });
});

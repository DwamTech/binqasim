import type { NavigationItem } from "./admin-shell";
import type { AdminShellAdmin } from "./admin-shell";

const adminRoleLabels: Record<AdminShellAdmin["role"], string> = {
  admin: "مدير النظام",
  super_admin: "مدير النظام",
  editor: "محرر",
  author: "كاتب",
  reviewer: "مراجع",
};

export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
): boolean {
  return (
    item.href === pathname ||
    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) ||
    item.children?.some((child) => isNavigationItemActive(child, pathname)) ===
      true
  );
}

export function getCurrentNavigationItemId(
  items: NavigationItem[],
  pathname: string,
): string | undefined {
  let current: { id: string; hrefLength: number; depth: number } | undefined;

  const visit = (item: NavigationItem, depth: number) => {
    const matchesOwnRoute =
      item.href === pathname ||
      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

    if (
      matchesOwnRoute &&
      (!current ||
        item.href.length > current.hrefLength ||
        (item.href.length === current.hrefLength && depth > current.depth))
    ) {
      current = { id: item.id, hrefLength: item.href.length, depth };
    }

    item.children?.forEach((child) => visit(child, depth + 1));
  };

  items.forEach((item) => visit(item, 0));
  return current?.id;
}

export function getAdminInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "؟";
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}

export function getAdminRoleLabel(role: AdminShellAdmin["role"]): string {
  return adminRoleLabels[role];
}

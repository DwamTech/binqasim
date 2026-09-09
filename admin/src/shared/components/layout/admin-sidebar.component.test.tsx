import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AdminSidebarView } from "./admin-sidebar";
import type { NavigationItem } from "./admin-shell";

const navigation: NavigationItem[] = [
  { id: "dashboard", label: "لوحة التحكم", href: "/dashboard" },
  {
    id: "sections",
    label: "إدارة الأقسام",
    href: "/dashboard/sections",
    children: [
      {
        id: "sections-new",
        label: "إضافة قسم",
        href: "/dashboard/sections/new",
      },
    ],
  },
  {
    id: "email-management",
    label: "إدارة الإيميل",
    href: "https://mail.albakry.net/",
    external: true,
  },
  {
    id: "comments",
    label: "إدارة التعليقات",
    href: "/dashboard/comments",
    notification: { count: 4, label: "تعليقات بانتظار المراجعة" },
  },
];

function render(collapsed: boolean, pathname = "/dashboard/sections/new") {
  return renderToStaticMarkup(
    <AdminSidebarView
      navigation={navigation}
      pathname={pathname}
      collapsed={collapsed}
      onCollapsedChange={vi.fn()}
      onLogout={vi.fn()}
    />,
  );
}

describe("AdminSidebarView", () => {
  it("renders native keyboard-activatable links and nested active state", () => {
    const markup = render(false);
    expect(markup).toContain('href="/dashboard"');
    expect(markup).toContain('href="/dashboard/sections/new"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("إدارة الأقسام");
    expect(markup).toContain("إضافة قسم");
    expect(markup).toContain('href="https://mail.albakry.net/"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
  });

  it("keeps every collapsed destination accessible by title and icon", () => {
    const markup = render(true);
    expect(markup).toContain('title="لوحة التحكم"');
    expect(markup).toContain('title="إدارة الأقسام"');
    expect(markup).toContain("<svg");
    expect(markup).not.toContain('href="/dashboard/sections/new"');
    expect(markup).toContain("توسيع الشريط الجانبي");
  });

  it("renders a dedicated comments glyph instead of the generic grid", () => {
    const markup = render(false);
    expect(markup).toContain('href="/dashboard/comments"');
    expect(markup).toContain(
      'd="M6.5 4h8A2.5 2.5 0 0 1 17 6.5v4a2.5 2.5 0 0 1-2.5 2.5H10l-4 3v-3.2A2.5 2.5 0 0 1 4 10.35V6.5A2.5 2.5 0 0 1 6.5 4Z"',
    );
  });

  it("renders a compact, accessible pending-review badge", () => {
    const markup = render(false, "/dashboard/comments");
    expect(markup).toContain("٤");
    expect(markup).toContain(
      'aria-label="إدارة التعليقات، ٤ تعليقات بانتظار المراجعة"',
    );
    expect(markup).toContain("notificationBadge");
  });

  it("renders the technical support contact as a WhatsApp link", () => {
    const markup = render(false);
    expect(markup).toContain('href="https://wa.me/2015558558579"');
    expect(markup).toContain("الدعم الفني");
    expect(markup).toContain("تواصل عبر واتساب");
    expect(markup).not.toContain("تحتاج إلى مساعدة");
    expect(markup).not.toContain("٠١٥٥٥٨٥٥٨٥٧٩");
    expect(markup).toContain('target="_blank"');
  });
});

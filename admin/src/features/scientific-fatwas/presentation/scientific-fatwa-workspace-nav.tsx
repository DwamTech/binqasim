import Link from "next/link";

type WorkspaceSection = "catalog" | "inbox" | "categories";

const links: ReadonlyArray<{
  section: WorkspaceSection;
  href: string;
  label: string;
}> = [
  {
    section: "catalog",
    href: "/dashboard/scientific-fatwas",
    label: "المسائل والفتاوى",
  },
  {
    section: "inbox",
    href: "/dashboard/scientific-fatwas/inbox",
    label: "صندوق الأسئلة",
  },
  {
    section: "categories",
    href: "/dashboard/scientific-fatwas/categories",
    label: "إدارة قائمة التصنيفات",
  },
];

export function ScientificFatwaWorkspaceNav({
  current,
  canManage = true,
}: {
  current: WorkspaceSection;
  canManage?: boolean;
}) {
  return (
    <>
      {links
        .filter((link) => canManage || link.section === "inbox")
        .map((link) => (
          <Link
            key={link.section}
            href={link.href}
            aria-current={current === link.section ? "page" : undefined}
            className={`ui-button ui-focus ${
              current === link.section
                ? "ui-button--primary"
                : "ui-button--secondary"
            }`}
          >
            {link.label}
          </Link>
        ))}
    </>
  );
}

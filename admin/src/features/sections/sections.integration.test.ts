import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("sections vertical slice integration", () => {
  const list = source(
    "src/features/sections/components/sections-list-view.tsx",
  );
  const form = source("src/features/sections/components/section-form.tsx");
  const detail = source(
    "src/features/sections/components/section-detail-view.tsx",
  );
  const deletion = source(
    "src/features/sections/components/delete-section-dialog.tsx",
  );

  it("covers list search filter reset pagination and all list states", () => {
    expect(list).toContain("setTimeout");
    expect(list).toContain("module:");
    expect(list).toContain("إعادة ضبط الفلاتر");
    expect(list).toContain("page.current_page - 1");
    expect(list).toContain("page.current_page + 1");
    expect(list).toContain("<Skeleton");
    expect(list).toContain("<EmptyState");
    expect(list).toContain("<ErrorState");
  });

  it("uses one form for create and edit with field and backend validation", () => {
    expect(form).toContain('mode: "create" | "edit"');
    expect(form).toContain("sectionFormSchema.safeParse");
    expect(form).toContain("reason.fieldErrors?.name");
    expect(form).toContain("submitting");
    expect(form).toContain("is_active");
  });

  it("renders safe detail and accessible conflict-aware deletion", () => {
    expect(detail).toContain("formatSectionDate");
    expect(detail).not.toContain("JSON.stringify(section");
    expect(deletion).toContain("<Dialog");
    expect(deletion).toContain("لا يمكن التراجع");
    expect(deletion).toContain('role="alert"');
  });

  it("keeps view and edit actions available regardless of active state", () => {
    expect(list).toContain("href={`/dashboard/sections/${section.id}`}");
    expect(list).toContain("href={`/dashboard/sections/${section.id}/edit`}");
    expect(list).not.toContain("العرض والتعديل غير متاحين حاليًا");
    expect(list).not.toContain("contractGap");
  });

  it("populates inactive edit state and refreshes after reactivation", () => {
    expect(form).toContain("is_active: section.is_active");
    expect(form).toContain("checked={values.is_active}");
    expect(form).toContain("router.refresh()");
  });

  it("guards all four pages server-side with sections.manage", () => {
    for (const path of [
      "src/app/(protected)/dashboard/sections/page.tsx",
      "src/app/(protected)/dashboard/sections/new/page.tsx",
      "src/app/(protected)/dashboard/sections/[id]/page.tsx",
      "src/app/(protected)/dashboard/sections/[id]/edit/page.tsx",
    ]) {
      expect(source(path)).toContain(
        'await requireDashboardPermission("sections.manage")',
      );
    }
  });

  it("keeps API calls out of presentation components", () => {
    for (const component of [list, form, detail, deletion]) {
      expect(component).not.toMatch(/\bfetch\s*\(/);
      expect(component).not.toContain("BACKEND_API_URL");
      expect(component).not.toContain("cms_session");
    }
  });
});

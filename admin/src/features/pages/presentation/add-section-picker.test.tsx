import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const source = (file: string) =>
  readFileSync(
    join(process.cwd(), "src/features/pages/presentation", file),
    "utf8",
  );

describe("PAGES-EDITOR-PICKER-UX: AddSectionPicker Visual Layout & Theme Palette", () => {
  it("renders visual structural previews for all 12 component section types", () => {
    const previews = source("section-previews.tsx");

    expect(previews).toContain("case \"hero\":");
    expect(previews).toContain("case \"rich_content\":");
    expect(previews).toContain("case \"image_text\":");
    expect(previews).toContain("case \"cards\":");
    expect(previews).toContain("case \"faq\":");
    expect(previews).toContain("case \"cta\":");
    expect(previews).toContain("case \"image\":");
    expect(previews).toContain("case \"video\":");
    expect(previews).toContain("case \"audio\":");
    expect(previews).toContain("case \"gallery\":");
    expect(previews).toContain("case \"statistics\":");
    expect(previews).toContain("case \"downloads\":");
  });

  it("organizes components with themed group badges and guidance subtitle", () => {
    const picker = source("add-section-picker.tsx");

    expect(picker).toContain("اختر التخطيط المناسب لمحتوى الصفحة");
    expect(picker).toContain("SectionStructuralPreview");
    expect(picker).toContain("groupBadgeContent");
    expect(picker).toContain("groupBadgeMedia");
    expect(picker).toContain("groupBadgeUtility");
  });

  it("applies theme palette, visual layout box, hover transforms, and high contrast styling", () => {
    const css = source("pages.module.css");

    expect(css).toContain(".pickerPreviewBox");
    expect(css).toContain(".pickerTitleRow");
    expect(css).toContain(".pickerAddHoverBtn");
    expect(css).toContain(".groupBadgeContent");
    expect(css).toContain(".groupBadgeMedia");
    expect(css).toContain(".groupBadgeUtility");
  });
});

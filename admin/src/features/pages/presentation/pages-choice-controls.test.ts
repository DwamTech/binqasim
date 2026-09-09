import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const presentationSource = (file: string) =>
  readFileSync(
    join(process.cwd(), "src/features/pages/presentation", file),
    "utf8",
  );

const sectionEditor = presentationSource("page-section-editor.tsx");
const seoEditor = presentationSource("page-seo-editor.tsx");
const choiceField = presentationSource("pages-choice-field.tsx");
const choiceStyles = presentationSource("pages-choice-field.module.css");

describe("Pages editor choice controls", () => {
  it("removes native select triggers from the Pages section and SEO editors", () => {
    expect(sectionEditor).not.toContain("<select");
    expect(seoEditor).not.toContain("<select");
    expect(sectionEditor).toContain("<Select");
    expect(seoEditor).toContain("<Select");
  });

  it("presents the four Hero layouts as accessible visual Arabic radio cards", () => {
    expect(sectionEditor).toContain("<PagesChoiceField");
    expect(choiceField).toContain('type="radio"');
    expect(choiceField).toContain("<fieldset");
    expect(choiceField).toContain("<legend");
    expect(sectionEditor).toContain('label: "في المنتصف"');
    expect(sectionEditor).toContain('label: "صورة يسار"');
    expect(sectionEditor).toContain('label: "صورة يمين"');
    expect(sectionEditor).toContain('label: "صورة خلفية"');
    expect(sectionEditor).not.toContain('label: "image_left"');
    expect(sectionEditor).not.toContain('label: "background_image"');
  });

  it("retains the exact Hero, theme, and spacing storage values", () => {
    for (const value of [
      "centered",
      "image_left",
      "image_right",
      "background_image",
    ]) {
      expect(sectionEditor).toContain(`value: "${value}"`);
    }
    expect(sectionEditor).toContain(
      '["default", "light", "primary", "secondary", "dark"] as const',
    );
    expect(sectionEditor).toContain(
      '["none", "small", "medium", "large", "xl"] as const',
    );
    expect(sectionEditor).toContain('xl: "كبيرة جدًا"');
  });

  it("keeps disclosure state separate from content updates", () => {
    const disclosure = sectionEditor.match(
      /<details className=\{styles\.settingsDisclosure\}>[\s\S]*?<\/details>/,
    )?.[0];
    expect(disclosure).toBeDefined();
    expect(disclosure).not.toContain("onToggle");
    expect(choiceField).toContain(
      "onChange={() => onValueChange(option.value)}",
    );
  });

  it("uses explicit non-submit semantics for every local action button", () => {
    const buttons = sectionEditor.match(/<(?:Button|IconButton)\b[\s\S]*?>/g);
    expect(buttons?.length).toBeGreaterThan(0);
    for (const button of buttons ?? []) {
      expect(button).toContain('type="button"');
    }
    expect(choiceField).not.toContain("<button");
  });

  it("propagates the editor disabled state into every media field", () => {
    expect(sectionEditor).not.toContain("disabled={false}");
    expect(sectionEditor).toContain("<HeroFields");
    expect(sectionEditor).toContain("<VideoFields");
    expect(sectionEditor).toContain("disabled={disabled}");
  });

  it("keeps upload failures beside the exact media slot that failed", () => {
    const mediaFields = sectionEditor.match(/<MediaUploadField[\s\S]*?\/>/g);
    expect(mediaFields).toHaveLength(9);
    for (const mediaField of mediaFields ?? []) {
      expect(mediaField).toContain("error={uploadError(");
      expect(mediaField).toContain("?? null}");
    }
    expect(sectionEditor).toContain('error={uploadError("poster") ?? null}');
    expect(sectionEditor).toContain(
      "error={uploadError(`gallery:${index}`) ?? null}",
    );
    expect(sectionEditor).toContain(
      "error={uploadError(`cards:${index}`) ?? null}",
    );
    expect(sectionEditor).toContain(
      "error={uploadError(`downloads:${index}`) ?? null}",
    );
  });

  it("places canonical validation beside the canonical SEO field", () => {
    expect(seoEditor).toContain("canonicalError?: string");
    expect(seoEditor).toContain("canonicalError ??");
    expect(seoEditor).toContain("error={Boolean(canonicalError)}");
  });

  it("provides RTL-safe responsive cards with focus and disabled states", () => {
    expect(choiceStyles).toContain(":has(.input:focus-visible)");
    expect(choiceStyles).toContain(":has(.input:disabled)");
    expect(choiceStyles).toContain("@media (max-width: 64rem)");
    expect(choiceStyles).toContain("@media (max-width: 34rem)");
    expect(choiceStyles).toContain("direction: ltr");
  });
});

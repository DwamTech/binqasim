import { describe, expect, it } from "vitest";
import { emptyScientificFatwaForm } from "../domain/scientific-fatwas.contracts";
import {
  createScientificFatwaFormData,
  validateScientificFatwaForm,
} from "./scientific-fatwas.form";

describe("scientific fatwa form contract", () => {
  it("requires every field rendered by the public design", () => {
    expect(
      Object.keys(validateScientificFatwaForm(emptyScientificFatwaForm)),
    ).toEqual(
      expect.arrayContaining([
        "title",
        "category_id",
        "question",
        "answer",
        "date_label",
      ]),
    );
  });

  it("serializes sources, keywords, featured and publication state", () => {
    const body = createScientificFatwaFormData({
      ...emptyScientificFatwaForm,
      title: "عنوان المسألة",
      category_id: "4",
      category: "علل الحديث",
      question: "هذا سؤال حديثي مكتمل للاختبار.",
      answer: "هذا جواب علمي مكتمل للاختبار.",
      date_label: "١٢ رجب ١٤٤٦هـ",
      sources: "مرجع أول\nمرجع ثان",
      keywords: "العلة، التخريج",
      is_featured: true,
      is_published: true,
    });
    expect(JSON.parse(String(body.get("sources")))).toEqual([
      "مرجع أول",
      "مرجع ثان",
    ]);
    expect(body.get("is_featured")).toBe("1");
    expect(body.get("is_listed")).toBe("1");
    expect(body.get("category_id")).toBe("4");
    expect(body.has("category")).toBe(false);
    expect(body.has("slug")).toBe(false);
    expect(body.get("published_at")).toBe("");
  });
});

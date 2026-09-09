import { describe, expect, it } from "vitest";

import { emptyDissertationForm } from "../domain/dissertations.contracts";
import {
  createDissertationFormData,
  validateDissertationForm,
} from "./dissertations.form";

const valid = {
  ...emptyDissertationForm,
  slug: "dissertation-019",
  title: "عنوان الرسالة",
  researcher_name: "اسم الباحث",
  university: "جامعة أم القرى",
  college: "كلية الدعوة",
  year: "1446",
  specialization: "السنة وعلومها",
  participation_type: "مناقش",
  degree: "دكتوراه",
  abstract: "ملخص علمي",
};

describe("dissertation form contract", () => {
  it("allows a safe draft without a source", () => {
    expect(validateDissertationForm(valid, {})).toEqual({});
    const body = createDissertationFormData(valid, {});
    expect(body.get("source_type")).toBe("");
    expect(body.get("is_published")).toBe("0");
  });

  it("lets the backend generate the public slug", () => {
    const automatic = { ...valid, slug: "" };
    expect(validateDissertationForm(automatic, {})).toEqual({});
    expect(createDissertationFormData(automatic, {}).has("slug")).toBe(false);
  });

  it("allows all academic metadata fields to remain empty", () => {
    const optionalAcademicFields = {
      ...valid,
      university: "",
      college: "",
      year: "",
      specialization: "",
      participation_type: "",
      degree: "",
    };

    expect(validateDissertationForm(optionalAcademicFields, {})).toEqual({});
    const body = createDissertationFormData(optionalAcademicFields, {});
    expect(body.get("university")).toBe("");
    expect(body.get("year")).toBe("");
  });

  it("requires a secure URL for linked sources", () => {
    expect(
      validateDissertationForm(
        { ...valid, source_type: "link", source_link: "http://example.com" },
        {},
      ),
    ).toHaveProperty("source_link");
  });
});

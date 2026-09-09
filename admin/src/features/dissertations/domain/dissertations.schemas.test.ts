import { describe, expect, it } from "vitest";

import {
  dissertationDetailResponseSchema,
  dissertationPageSchema,
} from "./dissertations.schemas";

const item = {
  id: 19,
  slug: "dissertation-019",
  title: "عنوان الرسالة",
  researcher_name: "اسم الباحث",
  university: "جامعة أم القرى",
  college: null,
  year: 1446,
  specialization: "السنة وعلومها",
  participation_type: "مناقش",
  degree: "دكتوراه",
  abstract: null,
  participation_description: null,
  source_type: null,
  file_path: null,
  file_url: null,
  source_link: null,
  keywords: null,
  is_published: 0,
  published_at: null,
};

describe("dissertation runtime contracts", () => {
  it("normalizes Laravel resources while preserving an intentionally empty source", () => {
    const parsed = dissertationDetailResponseSchema.parse({ data: item });
    expect(parsed).toMatchObject({
      id: "19",
      college: "",
      year: "1446",
      source_type: null,
      keywords: [],
      is_published: false,
    });
  });

  it("normalizes a Laravel resource paginator with real filters and stats", () => {
    const parsed = dissertationPageSchema.parse({
      data: [item],
      links: {},
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      filter_options: {
        years: [1446],
        universities: ["جامعة أم القرى"],
        specializations: ["السنة وعلومها"],
        participation_types: ["مناقش"],
        degrees: ["دكتوراه"],
      },
      stats: {
        total_dissertations: 1,
        published_dissertations: 0,
        draft_dissertations: 1,
      },
    });
    expect(parsed.filter_options.years).toEqual(["1446"]);
    expect(parsed.stats.draft_dissertations).toBe(1);
  });

  it("normalizes nullable academic metadata for optional forms", () => {
    const parsed = dissertationDetailResponseSchema.parse({
      data: {
        ...item,
        university: null,
        college: null,
        year: null,
        specialization: null,
        participation_type: null,
        degree: null,
      },
    });

    expect(parsed).toMatchObject({
      university: "",
      college: "",
      year: "",
      specialization: "",
      participation_type: "",
      degree: "",
    });
  });
});

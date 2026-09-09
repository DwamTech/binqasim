import { describe, expect, it } from "vitest";
import {
  normalizeScientificFatwaQuery,
  scientificFatwaPageHref,
} from "./scientific-fatwas.query";

describe("scientific fatwa queries", () => {
  it("normalizes valid filters and rejects malformed values safely", () => {
    expect(
      normalizeScientificFatwaQuery({
        search: "  العلل  ",
        status: "scheduled",
        page: "2",
        per_page: "50",
      }),
    ).toMatchObject({
      search: "العلل",
      status: "scheduled",
      page: 2,
      per_page: 50,
    });
    expect(normalizeScientificFatwaQuery({ page: "bad" })).toEqual({
      page: 1,
      per_page: 20,
    });
  });

  it("retains filters while changing pages", () => {
    expect(
      scientificFatwaPageHref(
        { category: "علل الحديث", status: "published", page: 1, per_page: 20 },
        3,
      ),
    ).toContain("page=3");
  });
});

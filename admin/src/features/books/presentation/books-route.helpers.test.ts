import { describe, expect, it } from "vitest";

import {
  booksListHref,
  readBooksQuery,
  readBooksRouteId,
} from "./books-route.helpers";

describe("Books route helpers", () => {
  it("normalizes only confirmed list query values", () => {
    expect(
      readBooksQuery({
        section_id: "2",
        series_id: "3",
        type: "part",
        page: "4",
        search: "ignored",
      }),
    ).toEqual({ section_id: 2, series_id: 3, type: "part", page: 4 });
    expect(
      readBooksQuery({
        section_id: "0",
        series_id: "1.5",
        type: "unknown",
        page: "-2",
      }),
    ).toEqual({});
  });

  it("builds stable pagination links while preserving valid filters", () => {
    expect(
      booksListHref({ section_id: 2, series_id: 3, type: "single" }, 4),
    ).toBe("/dashboard/books?section_id=2&series_id=3&type=single&page=4");
    expect(booksListHref({}, 1)).toBe("/dashboard/books");
  });

  it("accepts only positive integer detail IDs", () => {
    expect(readBooksRouteId("12")).toBe("12");
    expect(readBooksRouteId("0")).toBeUndefined();
    expect(readBooksRouteId("12.3")).toBeUndefined();
    expect(readBooksRouteId("book")).toBeUndefined();
  });
});

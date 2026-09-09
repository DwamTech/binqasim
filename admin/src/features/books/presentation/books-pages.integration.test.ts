import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

const list = source("src/features/books/presentation/books-list-view.tsx");
const bookPage = source("src/app/(protected)/dashboard/books/[id]/page.tsx");
const createPage = source("src/app/(protected)/dashboard/books/new/page.tsx");
const editPage = source(
  "src/app/(protected)/dashboard/books/[id]/edit/page.tsx",
);
const seriesPage = source(
  "src/app/(protected)/dashboard/books/series/page.tsx",
);
const seriesManager = source(
  "src/features/books/presentation/book-series-manager.tsx",
);
const seriesDetail = source(
  "src/app/(protected)/dashboard/books/series/[id]/page.tsx",
);

describe("Books pages", () => {
  it("renders accessible supported list controls and pagination only", () => {
    expect(list).toContain('name="type"');
    expect(list).toContain('name="section_id"');
    expect(list).toContain('name="series_id"');
    expect(list).toContain('<th scope="col">');
    expect(list).toContain('aria-label="صفحات الكتب"');
    expect(list).toContain("styles.tableScroll");
    expect(list).toContain("deleteBook");
    expect(list).not.toContain('name="search"');
    expect(list).not.toContain('name="author"');
    expect(list).not.toContain('name="source_type"');
  });

  it("handles invalid IDs, not-found, and protected create/edit operations", () => {
    for (const page of [bookPage, seriesDetail]) {
      expect(page).toContain("readBooksRouteId");
      expect(page).toContain("notFound()");
      expect(page).toContain("error.status === 404");
    }
    expect(bookPage).toContain("BooksDetailView");
    expect(createPage).toContain('requireDashboardPermission("books.manage")');
    expect(editPage).toContain('requireDashboardPermission("books.manage")');
    expect(editPage).toContain("BookForm");
  });

  it("protects Series and provides explicit create, edit, and delete operations", () => {
    expect(seriesPage).toContain('requireDashboardPermission("books.manage")');
    expect(seriesPage).toContain("BookSeriesManager");
    expect(seriesManager).toContain("createBookSeries");
    expect(seriesManager).toContain("updateBookSeries");
    expect(seriesManager).toContain("deleteBookSeries");
    expect(seriesManager).toContain("يحذف الكتب المرتبطة");
  });
});

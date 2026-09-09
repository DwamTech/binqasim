import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  resolveScientificLibraryOptions,
  type ScientificLibraryItem,
} from "../domain/scientific-library.contracts";
import { ScientificLibraryListView } from "./scientific-library-list-view";

const item: ScientificLibraryItem = {
  id: "1",
  slug: "hadith-work",
  title: "مصنَّف في الحديث",
  short_title: "مصنَّف الحديث",
  author_name: "المؤلف",
  description: "الوصف",
  content_type: "الكتب والمؤلفات",
  scientific_field: "مصطلح الحديث",
  pages_count: 248,
  edition: "الطبعة الأولى",
  publication_info: null,
  source_type: "file",
  file_path: "private/library/work.pdf",
  source_link: null,
  source_url: null,
  reader_url: null,
  download_url: null,
  admin_file_url: "/api/admin/preview/1",
  cover_path: null,
  cover_url: null,
  keywords: [],
  download_allowed: false,
  is_featured: true,
  is_published: false,
  published_at: null,
  views_count: 0,
  created_at: null,
  updated_at: null,
};

describe("ScientificLibraryListView", () => {
  it("renders search, every requested filter, item actions and pagination", () => {
    const markup = renderToStaticMarkup(
      <ScientificLibraryListView
        page={{
          data: [item],
          links: { first: null, last: null, prev: null, next: null },
          meta: {
            current_page: 1,
            last_page: 2,
            per_page: 20,
            total: 21,
            from: 1,
            to: 20,
          },
        }}
        query={{ page: 1, per_page: 20 }}
        options={resolveScientificLibraryOptions()}
      />,
    );
    for (const name of [
      "search",
      "content_type",
      "scientific_field",
      "status",
      "source_type",
      "is_featured",
      "per_page",
    ])
      expect(markup).toContain(`name="${name}"`);
    expect(markup).toContain("مصنَّف في الحديث");
    expect(markup).toContain("مسودة");
    expect(markup).toContain("مميز");
    expect(markup).toContain("/dashboard/library/1/edit");
    expect(markup).toContain('aria-label="صفحات المكتبة العلمية"');
  });

  it("renders a useful filtered empty state", () => {
    const markup = renderToStaticMarkup(
      <ScientificLibraryListView
        page={{
          data: [],
          links: { first: null, last: null, prev: null, next: null },
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0,
            from: null,
            to: null,
          },
        }}
        query={{ search: "missing", page: 1, per_page: 20 }}
        options={resolveScientificLibraryOptions()}
      />,
    );
    expect(markup).toContain("لا توجد نتائج مطابقة");
    expect(markup).toContain("مسح الفلاتر");
  });
});

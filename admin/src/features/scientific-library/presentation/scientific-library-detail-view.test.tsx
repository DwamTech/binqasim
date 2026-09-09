import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  resolveScientificLibraryOptions,
  type ScientificLibraryItem,
} from "../domain/scientific-library.contracts";
import { ScientificLibraryDetailView } from "./scientific-library-detail-view";

const rawFileItem: ScientificLibraryItem = {
  id: "17",
  slug: "private-work",
  title: "مصنَّف خاص",
  short_title: null,
  author_name: "المؤلف",
  description: "الوصف",
  content_type: "الكتب والمؤلفات",
  scientific_field: "مصطلح الحديث",
  pages_count: 248,
  edition: "الطبعة الأولى",
  publication_info: null,
  source_type: "file",
  file_path: "scientific-library/files/private-work.pdf",
  source_link: null,
  source_url: "https://backend.test/api/admin/private-source",
  reader_url: "https://backend.test/api/admin/private-reader",
  download_url: null,
  admin_file_url:
    "https://backend.test/api/admin/scientific-library/items/17/file",
  cover_path: null,
  cover_url: null,
  keywords: [],
  download_allowed: false,
  is_featured: false,
  is_published: false,
  published_at: null,
  views_count: 0,
  created_at: null,
  updated_at: null,
};

describe("ScientificLibraryDetailView", () => {
  it("never renders direct protected backend URLs for private files", () => {
    const markup = renderToStaticMarkup(
      <ScientificLibraryDetailView
        item={rawFileItem}
        options={resolveScientificLibraryOptions()}
      />,
    );

    expect(markup).toContain("/api/scientific-library/items/17/file");
    expect(markup).not.toContain("backend.test");
    expect(markup).not.toContain("scientific-library/files/private-work.pdf");
    expect(markup).not.toContain("فتح القارئ العام");
  });
});

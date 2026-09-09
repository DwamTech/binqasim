import { describe, expect, it } from "vitest";

import type { ScientificLibraryItem } from "../domain/scientific-library.contracts";
import { presentScientificLibraryItem } from "./scientific-library-item.presenter";

const fileItem: ScientificLibraryItem = {
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

describe("presentScientificLibraryItem", () => {
  it("replaces every protected file URL with the same local authenticated BFF", () => {
    const presented = presentScientificLibraryItem(
      fileItem,
      "https://backend.test/api",
    );
    const expected = "/api/scientific-library/items/17/file";

    expect(presented.admin_file_url).toBe(expected);
    expect(presented.reader_url).toBe(expected);
    expect(presented.source_url).toBe(expected);
    expect(presented.file_path).toBeNull();
    expect(JSON.stringify(presented)).not.toContain(
      "backend.test/api/admin/private",
    );
    expect(JSON.stringify(presented)).not.toContain(
      "scientific-library/files/private-work.pdf",
    );
  });

  it("returns null private URLs when a file record has no stored file", () => {
    const presented = presentScientificLibraryItem({
      ...fileItem,
      file_path: null,
      admin_file_url: null,
    });

    expect(presented.admin_file_url).toBeNull();
    expect(presented.reader_url).toBeNull();
    expect(presented.source_url).toBeNull();
  });

  it("preserves external reader URLs for link records", () => {
    const presented = presentScientificLibraryItem({
      ...fileItem,
      source_type: "link",
      file_path: null,
      source_link: "https://drive.google.com/file/example",
      source_url: null,
      reader_url: "https://drive.google.com/file/example/preview",
      admin_file_url: null,
    });

    expect(presented.source_url).toBe("https://drive.google.com/file/example");
    expect(presented.reader_url).toBe(
      "https://drive.google.com/file/example/preview",
    );
  });
});

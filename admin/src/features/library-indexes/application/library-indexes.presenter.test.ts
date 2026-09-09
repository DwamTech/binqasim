import { describe, expect, it } from "vitest";

import type { LibraryIndexSubmission } from "../domain/library-indexes.contracts";
import { presentLibraryIndexSubmission } from "./library-indexes.presenter";

const item: LibraryIndexSubmission = {
  id: 1,
  type: "golden_visit",
  name: "زائر",
  title: null,
  visit_date: "2026-08-09",
  status: "pending",
  image_url: "/storage/library-indexes/golden/photo.webp",
  reviewed_at: null,
  reviewer: null,
  rejection_reason: null,
  created_at: "2026-08-09T10:00:00Z",
};

describe("presentLibraryIndexSubmission", () => {
  it("resolves relative storage paths against the backend origin", () => {
    expect(
      presentLibraryIndexSubmission(item, "https://back.example.test/api")
        .image_url,
    ).toBe(
      "https://back.example.test/storage/library-indexes/golden/photo.webp",
    );
  });

  it("preserves empty guest images without manufacturing a URL", () => {
    expect(
      presentLibraryIndexSubmission(
        { ...item, type: "guest", image_url: null },
        "https://back.example.test/api",
      ).image_url,
    ).toBeNull();
  });
});

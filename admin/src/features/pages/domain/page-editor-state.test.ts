import { describe, expect, it } from "vitest";

import {
  arePageEditorStatesEqual,
  pageEditorDraftState,
  stablePagesValue,
} from "./page-editor-state";

const state = () =>
  pageEditorDraftState(
    "About",
    "about",
    null,
    { schema_version: 1, sections: [] },
    [],
  );

describe("Pages editor semantic dirty baseline", () => {
  it("treats structurally equal drafts as clean regardless of object key order", () => {
    const left = pageEditorDraftState(
      "About",
      "about",
      null,
      { schema_version: 1, sections: [] },
      { title: "SEO", custom: { b: 2, a: 1 } },
    );
    const right = pageEditorDraftState(
      "About",
      "about",
      null,
      { schema_version: 1, sections: [] },
      { custom: { a: 1, b: 2 }, title: "SEO" },
    );
    expect(arePageEditorStatesEqual(left, right)).toBe(true);
    expect(stablePagesValue(left)).toBe(stablePagesValue(right));
  });

  it("tracks title, identity, content, media references, SEO, and meaningful array ordering", () => {
    const baseline = state();
    expect(
      arePageEditorStatesEqual(
        baseline,
        pageEditorDraftState(
          "New",
          "about",
          null,
          { schema_version: 1, sections: [] },
          [],
        ),
      ),
    ).toBe(false);
    expect(
      arePageEditorStatesEqual(
        baseline,
        pageEditorDraftState(
          "About",
          "new",
          2,
          { schema_version: 1, sections: [] },
          [],
        ),
      ),
    ).toBe(false);
    expect(
      arePageEditorStatesEqual(
        baseline,
        pageEditorDraftState(
          "About",
          "about",
          null,
          {
            schema_version: 1,
            sections: [
              {
                id: "a",
                type: "hero",
                version: 1,
                is_visible: true,
                data: { image: { media_id: 1 } },
                settings: {},
              } as never,
            ],
          },
          [],
        ),
      ),
    ).toBe(false);
    expect(
      arePageEditorStatesEqual(
        pageEditorDraftState(
          "About",
          "about",
          null,
          { schema_version: 1, sections: [{ id: "a" }, { id: "b" }] as never },
          [],
        ),
        pageEditorDraftState(
          "About",
          "about",
          null,
          { schema_version: 1, sections: [{ id: "b" }, { id: "a" }] as never },
          [],
        ),
      ),
    ).toBe(false);
    expect(
      arePageEditorStatesEqual(
        baseline,
        pageEditorDraftState(
          "About",
          "about",
          null,
          { schema_version: 1, sections: [] },
          { title: "SEO" },
        ),
      ),
    ).toBe(false);
  });

  it("does not create false dirty state for untouched empty or legacy SEO lists", () => {
    expect(arePageEditorStatesEqual(state(), state())).toBe(true);
    const legacy = pageEditorDraftState(
      "About",
      "about",
      null,
      { schema_version: 1, sections: [] },
      ["legacy", { provider: true }],
    );
    expect(arePageEditorStatesEqual(legacy, legacy)).toBe(true);
  });
});

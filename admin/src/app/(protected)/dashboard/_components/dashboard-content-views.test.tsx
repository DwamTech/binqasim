import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ContentViewsPulse } from "./dashboard-landing-view";

describe("dashboard content views", () => {
  it("shows the aggregate and per-module views without trusting backend labels", () => {
    const markup = renderToStaticMarkup(
      <ContentViewsPulse
        summary={{
          total: 19,
          modules: [
            {
              key: "articles",
              label: "Backend articles",
              items_count: 4,
              views_count: 19,
            },
          ],
        }}
      />,
    );
    const visibleText = markup.replace(/<[^>]*>/g, " ");

    expect(visibleText).toContain("إجمالي المشاهدات");
    expect(visibleText).toContain("١٩");
    expect(visibleText).toContain("المقالات");
    expect(visibleText).toContain("٤ عنصر مسجل");
    expect(visibleText).not.toContain("Backend articles");
  });

  it("keeps the existing dashboard unchanged when the backend is still old", () => {
    expect(renderToStaticMarkup(<ContentViewsPulse summary={null} />)).toBe("");
  });
});

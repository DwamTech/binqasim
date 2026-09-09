import type { PageContent, PageSeoData } from "./pages.contracts";

export type PageEditorDraftState = {
  title: string;
  slug: string;
  parent_id: number | null;
  content: PageContent;
  seo_data: PageSeoData;
};

export function pageEditorDraftState(
  title: string,
  slug: string,
  parentId: number | null,
  content: PageContent,
  seoData: PageSeoData,
): PageEditorDraftState {
  return { title, slug, parent_id: parentId, content, seo_data: seoData };
}

export function arePageEditorStatesEqual(
  left: PageEditorDraftState | null,
  right: PageEditorDraftState | null,
): boolean {
  return (
    left !== null &&
    right !== null &&
    stablePagesValue(left) === stablePagesValue(right)
  );
}

export function stablePagesValue(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return `[${value.map(stablePagesValue).join(",")}]`;

  switch (typeof value) {
    case "boolean":
    case "number":
    case "string":
      return JSON.stringify(value);
    case "undefined":
      return "undefined";
    case "object": {
      const record = value as Record<string, unknown>;
      return `{${Object.keys(record)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stablePagesValue(record[key])}`)
        .join(",")}}`;
    }
    default:
      return JSON.stringify(String(value));
  }
}

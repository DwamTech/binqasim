import type { PageSeoData } from "./pages.contracts";

export const editableSeoKeys = [
  "title",
  "description",
  "canonical",
  "index",
  "robots",
] as const;
export type EditableSeoKey = (typeof editableSeoKeys)[number];
export type SeoIndexValue = "default" | "allow" | "block";
export type PageSeoEditorValues = {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  index: SeoIndexValue;
};
export type PageSeoShape = "object" | "empty-list" | "legacy-list";

const stringKeys = ["title", "description", "canonical", "robots"] as const;
const emptyValues = (): PageSeoEditorValues => ({
  title: "",
  description: "",
  canonical: "",
  robots: "",
  index: "default",
});

export function pageSeoShape(seo: PageSeoData): PageSeoShape {
  return Array.isArray(seo)
    ? seo.length === 0
      ? "empty-list"
      : "legacy-list"
    : "object";
}

export function pageSeoEditorValues(seo: PageSeoData): PageSeoEditorValues {
  if (Array.isArray(seo)) return emptyValues();
  return {
    title: typeof seo.title === "string" ? seo.title : "",
    description: typeof seo.description === "string" ? seo.description : "",
    canonical: typeof seo.canonical === "string" ? seo.canonical : "",
    robots: typeof seo.robots === "string" ? seo.robots : "",
    index:
      seo.index === true ? "allow" : seo.index === false ? "block" : "default",
  };
}

export function validateCanonical(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function mergePageSeo(
  original: PageSeoData,
  values: PageSeoEditorValues,
  touched: ReadonlySet<EditableSeoKey>,
): PageSeoData {
  if (touched.size === 0 || pageSeoShape(original) === "legacy-list")
    return original;
  const next: Record<string, unknown> = Array.isArray(original)
    ? {}
    : { ...original };
  for (const key of stringKeys) {
    if (!touched.has(key)) continue;
    const value = values[key].trim();
    if (value) next[key] = value;
    else delete next[key];
  }
  if (touched.has("index")) {
    if (values.index === "default") delete next.index;
    else next.index = values.index === "allow";
  }
  return next;
}

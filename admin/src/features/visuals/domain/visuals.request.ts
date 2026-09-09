import type {
  CreateVisualInput,
  UpdateVisualInput,
  VisualListQuery,
} from "./visuals.contracts";

export function compactVisualQuery(query: VisualListQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined),
  );
}

function appendOptional(
  form: FormData,
  key: string,
  value: string | number | undefined,
) {
  if (value !== undefined && value !== "") form.append(key, String(value));
}

export function createVisualFormData(
  input: CreateVisualInput | UpdateVisualInput,
): FormData {
  const form = new FormData();
  form.append("title", input.title);
  form.append("type", input.type);
  appendOptional(form, "description", input.description);
  appendOptional(form, "url", input.url);
  appendOptional(form, "section_id", input.section_id);
  appendOptional(form, "keywords", input.keywords);
  appendOptional(form, "rating", input.rating);
  if (input.file !== undefined) form.append("file", input.file);
  if (input.thumbnail !== undefined) form.append("thumbnail", input.thumbnail);
  return form;
}

export function createVisualJson(input: CreateVisualInput | UpdateVisualInput) {
  return {
    title: input.title,
    type: input.type,
    ...(input.description === undefined
      ? {}
      : { description: input.description }),
    ...(input.url === undefined ? {} : { url: input.url }),
    ...(input.section_id === undefined ? {} : { section_id: input.section_id }),
    ...(input.keywords === undefined ? {} : { keywords: input.keywords }),
    ...(input.rating === undefined ? {} : { rating: input.rating }),
  };
}

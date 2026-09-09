import type {
  ScientificFatwaFormValues,
  ScientificFatwaItem,
} from "../domain/scientific-fatwas.contracts";

export function validateScientificFatwaForm(
  values: ScientificFatwaFormValues,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const required: Array<[keyof ScientificFatwaFormValues, string, number]> = [
    ["title", "عنوان المسألة مطلوب.", 3],
    ["category_id", "التصنيف العلمي مطلوب.", 1],
    ["question", "نص السؤال مطلوب ولا يقل عن عشرة أحرف.", 10],
    ["answer", "الجواب العلمي مطلوب ولا يقل عن عشرة أحرف.", 10],
    ["date_label", "تاريخ العرض مطلوب.", 1],
  ];
  for (const [field, message, minimum] of required) {
    const value = values[field];
    if (typeof value === "string" && value.trim().length < minimum)
      errors[field] = [message];
  }
  return errors;
}

function lines(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[\r\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function createScientificFatwaFormData(
  values: ScientificFatwaFormValues,
): FormData {
  const body = new FormData();
  for (const field of ["title", "question", "answer", "date_label"] as const)
    body.set(field, values[field].trim());
  body.set("category_id", values.category_id.trim());
  body.set("sources", JSON.stringify(lines(values.sources)));
  body.set("keywords", JSON.stringify(lines(values.keywords)));
  body.set("is_featured", values.is_featured ? "1" : "0");
  body.set("is_listed", values.is_listed ? "1" : "0");
  body.set("is_published", values.is_published ? "1" : "0");
  body.set(
    "published_at",
    values.is_published && values.published_at
      ? values.published_at.replace("T", " ")
      : "",
  );
  return body;
}

export function publicationLabel(item: ScientificFatwaItem): string {
  if (item.status === "scheduled") return "مجدولة";
  return item.status === "published" ? "منشورة" : "مسودة";
}

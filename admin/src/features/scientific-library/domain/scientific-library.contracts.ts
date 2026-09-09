export const scientificLibrarySourceTypes = ["file", "link", "embed"] as const;
export const scientificLibraryStatuses = [
  "draft",
  "scheduled",
  "published",
] as const;

export type ScientificLibrarySourceType =
  (typeof scientificLibrarySourceTypes)[number];
export type ScientificLibraryStatus =
  (typeof scientificLibraryStatuses)[number];

export type ScientificLibraryOption = {
  value: string;
  label: string;
};

export type ScientificLibraryOptions = {
  content_types: ScientificLibraryOption[];
  scientific_fields: ScientificLibraryOption[];
  source_types: ScientificLibraryOption[];
  statuses: ScientificLibraryOption[];
};

export const fallbackScientificLibraryOptions: ScientificLibraryOptions = {
  content_types: [
    { value: "الكتب والمؤلفات", label: "الكتب والمؤلفات" },
    { value: "التحقيقات العلمية", label: "التحقيقات العلمية" },
    { value: "الأبحاث المحكمة", label: "الأبحاث المحكمة" },
    { value: "المقالات والدراسات", label: "المقالات والدراسات" },
    { value: "المحاضرات المكتوبة", label: "المحاضرات المكتوبة" },
    { value: "المواد التعليمية", label: "المواد التعليمية" },
    { value: "الإصدارات الحديثة", label: "الإصدارات الحديثة" },
  ],
  scientific_fields: [
    { value: "مصطلح الحديث", label: "مصطلح الحديث" },
    { value: "علم الرجال", label: "علم الرجال" },
    { value: "الجرح والتعديل", label: "الجرح والتعديل" },
    { value: "علل الحديث", label: "علل الحديث" },
    {
      value: "التخريج ودراسة الأسانيد",
      label: "التخريج ودراسة الأسانيد",
    },
    { value: "مختلف الحديث", label: "مختلف الحديث" },
    { value: "شروح الحديث", label: "شروح الحديث" },
    { value: "مناهج المحدثين", label: "مناهج المحدثين" },
    {
      value: "الدراسات الحديثية المعاصرة",
      label: "الدراسات الحديثية المعاصرة",
    },
  ],
  source_types: [
    { value: "file", label: "ملف مرفوع" },
    { value: "link", label: "رابط خارجي أو Google Drive" },
    { value: "embed", label: "رابط تضمين آمن" },
  ],
  statuses: [
    { value: "draft", label: "مسودة" },
    { value: "scheduled", label: "مجدول" },
    { value: "published", label: "منشور" },
  ],
};

function mergeOptionGroup(
  fallback: ScientificLibraryOption[],
  received: ScientificLibraryOption[],
): ScientificLibraryOption[] {
  const merged = new Map<string, ScientificLibraryOption>();
  for (const option of [...fallback, ...received]) {
    if (!merged.has(option.value)) merged.set(option.value, option);
  }
  return [...merged.values()];
}

export function resolveScientificLibraryOptions(
  received?: Partial<ScientificLibraryOptions>,
): ScientificLibraryOptions {
  return {
    content_types: mergeOptionGroup(
      fallbackScientificLibraryOptions.content_types,
      received?.content_types ?? [],
    ),
    scientific_fields: mergeOptionGroup(
      fallbackScientificLibraryOptions.scientific_fields,
      received?.scientific_fields ?? [],
    ),
    source_types: mergeOptionGroup(
      fallbackScientificLibraryOptions.source_types,
      received?.source_types ?? [],
    ),
    statuses: mergeOptionGroup(
      fallbackScientificLibraryOptions.statuses,
      received?.statuses ?? [],
    ),
  };
}

export type ScientificLibraryItem = {
  id: string;
  slug: string;
  title: string;
  short_title: string | null;
  author_name: string;
  description: string;
  content_type: string;
  scientific_field: string;
  pages_count: number;
  edition: string;
  publication_info: string | null;
  source_type: ScientificLibrarySourceType;
  file_path: string | null;
  source_link: string | null;
  source_url: string | null;
  reader_url: string | null;
  download_url: string | null;
  admin_file_url: string | null;
  cover_path: string | null;
  cover_url: string | null;
  keywords: string[];
  download_allowed: boolean;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  views_count: number;
  created_at: string | null;
  updated_at: string | null;
};

export type ScientificLibraryPage = {
  data: ScientificLibraryItem[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
};

export type ScientificLibraryQuery = {
  search?: string;
  content_type?: string;
  scientific_field?: string;
  status?: ScientificLibraryStatus;
  source_type?: ScientificLibrarySourceType;
  is_featured?: "0" | "1";
  page: number;
  per_page: number;
};

export type ScientificLibraryFormValues = {
  slug: string;
  title: string;
  short_title: string;
  author_name: string;
  description: string;
  content_type: string;
  scientific_field: string;
  pages_count: string;
  edition: string;
  publication_info: string;
  source_type: ScientificLibrarySourceType;
  source_link: string;
  keywords: string;
  download_allowed: boolean;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
};

export type ScientificLibraryFormFiles = {
  file?: File | undefined;
  cover?: File | undefined;
  removeCover?: boolean | undefined;
};

export type ScientificLibraryMutationResponse = {
  message: string;
  data: ScientificLibraryItem;
};

export type ScientificLibraryDeleteResponse = { message: string };

export const emptyScientificLibraryForm: ScientificLibraryFormValues = {
  slug: "",
  title: "",
  short_title: "",
  author_name: "",
  description: "",
  content_type: fallbackScientificLibraryOptions.content_types[0]?.value ?? "",
  scientific_field:
    fallbackScientificLibraryOptions.scientific_fields[0]?.value ?? "",
  pages_count: "",
  edition: "",
  publication_info: "",
  source_type: "file",
  source_link: "",
  keywords: "",
  download_allowed: false,
  is_featured: false,
  is_published: false,
  published_at: "",
};

export function scientificLibraryStatusOf(
  item: Pick<ScientificLibraryItem, "is_published" | "published_at">,
  now = new Date(),
): ScientificLibraryStatus {
  if (!item.is_published) return "draft";
  if (item.published_at) {
    const publicationDate = new Date(item.published_at);
    if (!Number.isNaN(publicationDate.getTime()) && publicationDate > now)
      return "scheduled";
  }
  return "published";
}

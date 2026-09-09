export type ScientificFatwaStatus = "published" | "scheduled" | "draft";

export type ScientificFatwaCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type ScientificFatwaCategory = ScientificFatwaCategoryOption & {
  is_active: boolean;
  sort_order: number;
  items_count?: number | undefined;
  inbox_questions_count?: number | undefined;
};

export type ScientificFatwaItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  category_id: string | null;
  category_option: ScientificFatwaCategoryOption | null;
  question: string;
  answer: string;
  date_label: string;
  sources: string[];
  keywords: string[];
  is_featured: boolean;
  is_listed: boolean;
  is_published: boolean;
  source_fatwa_id: string | null;
  managed_by_inbox: boolean;
  status: ScientificFatwaStatus;
  published_at: string | null;
  public_url: string | null;
  created_at?: string | null | undefined;
  updated_at?: string | null | undefined;
};

export type ScientificFatwaPage = {
  data: ScientificFatwaItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  filter_options: {
    categories: string[];
    category_options: ScientificFatwaCategoryOption[];
    statuses: ScientificFatwaStatus[];
  };
  stats: {
    total: number;
    published: number;
    scheduled: number;
    drafts: number;
  };
};

export type ScientificFatwaQuery = {
  search?: string | undefined;
  category?: string | undefined;
  status?: ScientificFatwaStatus | undefined;
  is_featured?: "0" | "1" | undefined;
  is_listed?: "0" | "1" | undefined;
  page: number;
  per_page: number;
};

export type ScientificFatwaFormValues = {
  title: string;
  category_id: string;
  category: string;
  question: string;
  answer: string;
  date_label: string;
  sources: string;
  keywords: string;
  is_featured: boolean;
  is_listed: boolean;
  is_published: boolean;
  published_at: string;
};

export type ScientificFatwaMutationResponse = {
  message: string;
  data: ScientificFatwaItem;
};

export type ScientificFatwaDeleteResponse = { message: string };

export const emptyScientificFatwaForm: ScientificFatwaFormValues = {
  title: "",
  category_id: "",
  category: "",
  question: "",
  answer: "",
  date_label: "",
  sources: "",
  keywords: "",
  is_featured: false,
  is_listed: true,
  is_published: false,
  published_at: "",
};

export function scientificFatwaToFormValues(
  item: ScientificFatwaItem,
): ScientificFatwaFormValues {
  return {
    title: item.title,
    category_id: item.category_id ?? "",
    category: item.category,
    question: item.question,
    answer: item.answer,
    date_label: item.date_label,
    sources: item.sources.join("\n"),
    keywords: item.keywords.join(", "),
    is_featured: item.is_featured,
    is_listed: item.is_listed,
    is_published: item.is_published,
    published_at: item.published_at?.slice(0, 16) ?? "",
  };
}

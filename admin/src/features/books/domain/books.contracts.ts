export const bookTypes = ["single", "part"] as const;
export const bookSourceTypes = ["file", "link", "embed"] as const;
export const bookCoverTypes = ["auto", "upload"] as const;
export type BookType = (typeof bookTypes)[number];
export type BookSourceType = (typeof bookSourceTypes)[number];
export type BookCoverType = (typeof bookCoverTypes)[number];
export type AdminBook = {
  id: number;
  title: string;
  type: BookType;
  description?: string | null | undefined;
  source_type?: BookSourceType | null | undefined;
  file_path?: string | null | undefined;
  source_link?: string | null | undefined;
  cover_type?: BookCoverType | null | undefined;
  cover_path?: string | null | undefined;
  keywords?: string[] | null | undefined;
  author_name?: string | null | undefined;
  book_series_id?: number | null | undefined;
  section_id?: number | null | undefined;
  slug?: string | null | undefined;
  short_title?: string | null | undefined;
  pages_count?: number | null | undefined;
  edition?: string | null | undefined;
  publication_info?: string | null | undefined;
  download_allowed?: boolean | undefined;
  is_published?: boolean | undefined;
  published_at?: string | null | undefined;
  views_count?: number | undefined;
  rating_count?: number | undefined;
  average_rating?: number | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
  section?:
    | {
        id: number;
        name: string;
        is_active?: boolean | undefined;
      }
    | null
    | undefined;
};
export type AdminBooksPaginator = {
  current_page: number;
  data: AdminBook[];
  per_page: number;
  total: number;
};
export type BookSeries = {
  id: number;
  name: string;
  description?: string | null | undefined;
};
export type LibraryCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null | undefined;
  is_active: boolean;
  sort_order: number;
  parent_id: number;
  books_count: number;
};
export type LibraryCategoriesResponse = {
  data: LibraryCategory[];
  area: { id: number; name: string; slug: string };
};
export type BookSeriesSummary = {
  name?: string | null | undefined;
};
export type BookSectionSummary = {
  name?: string | null | undefined;
};
export type RelatedBookPart = {
  id: number;
  title: string;
  cover_path: string | null;
  cover_type: BookCoverType;
};
export type AdminBookDetail = {
  id: number;
  title: string;
  description: string;
  source_type: BookSourceType;
  file_path: string | null;
  source_link: string | null;
  cover_type: BookCoverType;
  cover_path: string | null;
  keywords: string[] | null;
  views_count: number;
  rating_sum: string | number;
  rating_count: number;
  author_name: string;
  type: BookType;
  book_series_id: number | null;
  section_id: number | null;
  created_at: string;
  updated_at: string;
  average_rating: number;
  series: BookSeriesSummary | null;
  section: BookSectionSummary | null;
  slug?: string | null | undefined;
  short_title?: string | null | undefined;
  pages_count?: number | null | undefined;
  edition?: string | null | undefined;
  publication_info?: string | null | undefined;
  download_allowed?: boolean | undefined;
  is_published?: boolean | undefined;
  published_at?: string | null | undefined;
};
export type AdminBookDetailResponse = {
  book: AdminBookDetail;
  related_parts: RelatedBookPart[];
};
export type AdminBooksQuery = {
  area?: import("./library-areas").LibraryAreaSlug;
  section_id?: number;
  series_id?: number;
  type?: BookType;
  page?: number;
};

export type BookFormValues = {
  title: string;
  description: string;
  source_type: BookSourceType;
  source_link: string;
  cover_type: BookCoverType;
  keywords: string;
  author_name: string;
  type: BookType;
  book_series_id: string;
  section_id: string;
  slug: string;
  short_title: string;
  pages_count: string;
  edition: string;
  publication_info: string;
  download_allowed: boolean;
  is_published: boolean;
  published_at: string;
};

export type BookFormFiles = {
  file?: File | undefined;
  cover?: File | undefined;
};

export type BookCatalogs = {
  authors: string[];
  series: BookSeries[];
  sections: Array<{
    id: string;
    name: string;
    is_active?: boolean;
    slug?: string;
    parent_id?: string | null | undefined;
  }>;
  sectionsWarning: string | null;
};

export type BookMutationResponse = {
  message: string;
  data: AdminBook;
};

export type BookDeleteResponse = {
  message: string;
};

export const emptyBookForm: BookFormValues = {
  title: "",
  description: "",
  source_type: "link",
  source_link: "",
  cover_type: "auto",
  keywords: "",
  author_name: "",
  type: "single",
  book_series_id: "",
  section_id: "",
  slug: "",
  short_title: "",
  pages_count: "",
  edition: "",
  publication_info: "",
  download_allowed: false,
  is_published: false,
  published_at: "",
};

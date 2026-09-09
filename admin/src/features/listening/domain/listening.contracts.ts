export const listeningBookSourceTypes = ["file", "link"] as const;
export type ListeningBookSourceType = (typeof listeningBookSourceTypes)[number];

export const listeningAudioSourceTypes = ["file", "link"] as const;
export type ListeningAudioSourceType =
  (typeof listeningAudioSourceTypes)[number];

export const listeningVisualVariants = [
  "gold",
  "sage",
  "clay",
  "bronze",
  "slate",
] as const;
export type ListeningVisualVariant = (typeof listeningVisualVariants)[number];

export type ListeningSeriesSummary = {
  id: string;
  slug: string | null;
  title: string;
  short_title: string;
};

export type ListeningSeries = ListeningSeriesSummary & {
  category: string;
  description: string;
  period_label: string;
  visual_variant: ListeningVisualVariant | null;
  book_source_type: ListeningBookSourceType | null;
  book_file_path: string | null;
  book_file_url?: string | null | undefined;
  book_source_link: string | null;
  book_url?: string | null | undefined;
  book_download_allowed: boolean;
  is_published: boolean;
  published_at: string | null;
  sessions_count: number;
  published_sessions_count: number;
  created_at?: string | null | undefined;
  updated_at?: string | null | undefined;
  sessions?: ListeningSession[] | undefined;
};

export type ListeningSession = {
  id: string;
  listening_series_id: string;
  series?: ListeningSeriesSummary | null | undefined;
  slug: string | null;
  sequence_number: number;
  title: string;
  date_label: string;
  duration_minutes: number;
  description: string;
  audio_source_type: ListeningAudioSourceType | null;
  audio_file_path: string | null;
  audio_file_url?: string | null | undefined;
  audio_source_link: string | null;
  audio_url?: string | null | undefined;
  audio_download_allowed: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at?: string | null | undefined;
  updated_at?: string | null | undefined;
};

export type ListeningStats = {
  total: number;
  published: number;
  drafts: number;
};

export type ListeningSeriesPage = {
  data: ListeningSeries[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  filter_options: {
    categories: string[];
    visual_variants: ListeningVisualVariant[];
  };
  stats: ListeningStats;
};

export type ListeningSessionPage = {
  data: ListeningSession[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  filter_options: { series: ListeningSeriesSummary[] };
  stats: ListeningStats;
};

export type ListeningSeriesQuery = {
  search?: string | undefined;
  category?: string | undefined;
  is_published?: "0" | "1" | undefined;
  page: number;
  per_page: number;
};

export type ListeningSessionQuery = {
  search?: string | undefined;
  series_id?: string | undefined;
  is_published?: "0" | "1" | undefined;
  page: number;
  per_page: number;
};

export type ListeningSeriesFormValues = {
  slug: string;
  title: string;
  short_title: string;
  category: string;
  description: string;
  period_label: string;
  visual_variant: ListeningVisualVariant | "none";
  book_source_type: ListeningBookSourceType | "none";
  book_source_link: string;
  book_download_allowed: boolean;
  is_published: boolean;
  published_at: string;
};

export type ListeningSeriesFormFiles = { book_file?: File | undefined };

export type ListeningSessionFormValues = {
  listening_series_id: string;
  slug: string;
  sequence_number: string;
  title: string;
  date_label: string;
  duration_minutes: string;
  description: string;
  audio_source_type: ListeningAudioSourceType | "none";
  audio_source_link: string;
  audio_download_allowed: boolean;
  is_published: boolean;
  published_at: string;
};

export type ListeningSessionFormFiles = { audio_file?: File | undefined };

export type ListeningSeriesMutationResponse = {
  message: string;
  data: ListeningSeries;
};

export type ListeningSessionMutationResponse = {
  message: string;
  data: ListeningSession;
};

export type ListeningDeleteResponse = { message: string };

export const emptyListeningSeriesForm: ListeningSeriesFormValues = {
  slug: "",
  title: "",
  short_title: "",
  category: "",
  description: "",
  period_label: "",
  visual_variant: "none",
  book_source_type: "none",
  book_source_link: "",
  book_download_allowed: false,
  is_published: false,
  published_at: "",
};

export const emptyListeningSessionForm: ListeningSessionFormValues = {
  listening_series_id: "",
  slug: "",
  sequence_number: "",
  title: "",
  date_label: "",
  duration_minutes: "",
  description: "",
  audio_source_type: "none",
  audio_source_link: "",
  audio_download_allowed: false,
  is_published: false,
  published_at: "",
};

export function listeningSeriesToFormValues(
  series: ListeningSeries,
): ListeningSeriesFormValues {
  return {
    slug: series.slug ?? "",
    title: series.title,
    short_title: series.short_title,
    category: series.category,
    description: series.description,
    period_label: series.period_label,
    visual_variant: series.visual_variant ?? "none",
    book_source_type: series.book_source_type ?? "none",
    book_source_link: series.book_source_link ?? "",
    book_download_allowed: series.book_download_allowed,
    is_published: series.is_published,
    published_at: series.published_at?.slice(0, 16) ?? "",
  };
}

export function listeningSessionToFormValues(
  session: ListeningSession,
): ListeningSessionFormValues {
  return {
    listening_series_id: session.listening_series_id,
    slug: session.slug ?? "",
    sequence_number: String(session.sequence_number),
    title: session.title,
    date_label: session.date_label,
    duration_minutes: String(session.duration_minutes),
    description: session.description,
    audio_source_type: session.audio_source_type ?? "none",
    audio_source_link: session.audio_source_link ?? "",
    audio_download_allowed: session.audio_download_allowed,
    is_published: session.is_published,
    published_at: session.published_at?.slice(0, 16) ?? "",
  };
}

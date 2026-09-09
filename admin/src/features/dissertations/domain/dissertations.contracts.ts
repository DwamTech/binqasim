export const dissertationSourceTypes = ["file", "link", "embed"] as const;
export type DissertationSourceType = (typeof dissertationSourceTypes)[number];
export const dissertationPublicationStatuses = [
  "draft",
  "scheduled",
  "published",
] as const;
export type DissertationPublicationStatus =
  (typeof dissertationPublicationStatuses)[number];

export type Dissertation = {
  id: string;
  slug: string;
  title: string;
  researcher_name: string;
  university: string;
  college: string;
  year: string;
  specialization: string;
  participation_type: string;
  degree: string;
  abstract: string | null;
  participation_description: string | null;
  source_type: DissertationSourceType | null;
  file_path: string | null;
  has_file: boolean;
  file_url?: string | null | undefined;
  source_link: string | null;
  keywords: string[];
  is_published: boolean;
  status?: DissertationPublicationStatus | undefined;
  published_at: string | null;
  created_at?: string | null | undefined;
  updated_at?: string | null | undefined;
};

export type DissertationPage = {
  data: Dissertation[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  filter_options: {
    years: string[];
    universities: string[];
    specializations: string[];
    participation_types: string[];
    degrees: string[];
  };
  stats: {
    total_dissertations: number;
    published_dissertations: number;
    draft_dissertations: number;
    scheduled_dissertations: number;
  };
};

export type DissertationQuery = {
  search?: string | undefined;
  year?: string | undefined;
  university?: string | undefined;
  specialization?: string | undefined;
  participation_type?: string | undefined;
  degree?: string | undefined;
  is_published?: "0" | "1" | undefined;
  status?: DissertationPublicationStatus | undefined;
  page: number;
  per_page: number;
};

export type DissertationFormValues = {
  slug: string;
  title: string;
  researcher_name: string;
  university: string;
  college: string;
  year: string;
  specialization: string;
  participation_type: string;
  degree: string;
  abstract: string;
  participation_description: string;
  source_type: DissertationSourceType | "none";
  source_link: string;
  keywords: string;
  is_published: boolean;
  published_at: string;
};

export type DissertationFormFiles = { file?: File | undefined };

export type DissertationMutationResponse = {
  message: string;
  data: Dissertation;
};

export type DissertationDeleteResponse = { message: string };

export function dissertationPublicationStatusOf(
  dissertation: Pick<Dissertation, "is_published" | "published_at" | "status">,
  now = new Date(),
): DissertationPublicationStatus {
  if (dissertation.status) return dissertation.status;
  if (!dissertation.is_published) return "draft";
  if (dissertation.published_at) {
    const publicationDate = new Date(dissertation.published_at);
    if (!Number.isNaN(publicationDate.getTime()) && publicationDate > now) {
      return "scheduled";
    }
  }
  return "published";
}

export const emptyDissertationForm: DissertationFormValues = {
  slug: "",
  title: "",
  researcher_name: "",
  university: "",
  college: "",
  year: "",
  specialization: "",
  participation_type: "",
  degree: "",
  abstract: "",
  participation_description: "",
  source_type: "none",
  source_link: "",
  keywords: "",
  is_published: false,
  published_at: "",
};

export function dissertationToFormValues(
  dissertation: Dissertation,
): DissertationFormValues {
  return {
    slug: dissertation.slug,
    title: dissertation.title,
    researcher_name: dissertation.researcher_name,
    university: dissertation.university,
    college: dissertation.college,
    year: dissertation.year,
    specialization: dissertation.specialization,
    participation_type: dissertation.participation_type,
    degree: dissertation.degree,
    abstract: dissertation.abstract ?? "",
    participation_description: dissertation.participation_description ?? "",
    source_type: dissertation.source_type ?? "none",
    source_link: dissertation.source_link ?? "",
    keywords: dissertation.keywords.join(", "),
    is_published: dissertation.is_published,
    published_at: dissertation.published_at?.slice(0, 16) ?? "",
  };
}

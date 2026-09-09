import { toArabicDigits } from "@/shared/lib/arabic-format";

export const tourRequestStatuses = ["new", "in_progress", "completed"] as const;

export type TourRequestStatus = (typeof tourRequestStatuses)[number];

export const tourRequestStatusLabels: Record<TourRequestStatus, string> = {
  new: "طلب جديد",
  in_progress: "قيد التنفيذ",
  completed: "طلب منتهي",
};

export const tourVisitorTypeLabels: Record<string, string> = {
  individual: "فرد",
  group: "مجموعة",
  company: "شركة",
  campaign: "حملة",
};

export type TourGuide = {
  id: number;
  slug: string;
  name: string;
  title: string;
  bio: string | null;
  experience_years: number;
  languages: string[];
  tour_routes: string[];
  photo_url: string | null;
  is_active: boolean;
  is_archived: boolean;
  display_order: number;
  license_number: string | null;
  phone: string | null;
  email: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TourRequestHistoryEntry = {
  id: string;
  fromStatus: TourRequestStatus | null;
  toStatus: TourRequestStatus | null;
  note: string | null;
  actor: { id: string; name: string } | null;
  createdAt: string | null;
};

export type TourRequest = {
  id: number;
  reference: string;
  guide: TourGuide;
  full_name: string;
  phone: string;
  email: string;
  tour_route: string;
  tour_goal: string;
  visitor_type: string;
  preferred_date: string | null;
  preferred_time: string | null;
  participants_count: number;
  status: TourRequestStatus;
  admin_note: string | null;
  privacy_accepted_at: string | null;
  status_history: TourRequestHistoryEntry[];
  created_at: string | null;
  updated_at: string | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type PaginatedResource<T> = {
  data: T[];
  links: Record<string, unknown>;
  meta: PaginationMeta;
};

export type TourGuidesSummary = {
  guides_total: number;
  guides_active: number;
  guides_inactive: number;
};

export type TourRequestsSummary = {
  requests_total: number;
  new: number;
  in_progress: number;
  completed: number;
};

export type TourModuleSummary = TourGuidesSummary & TourRequestsSummary;

export type TourGuidesQuery = {
  search?: string | undefined;
  is_active?: "true" | "false" | undefined;
  page: number;
  per_page: number;
};

export type TourRequestsQuery = {
  search?: string | undefined;
  status?: TourRequestStatus | undefined;
  guide_id?: number | undefined;
  date_from?: string | undefined;
  date_to?: string | undefined;
  page: number;
  per_page: number;
};

export type TourGuideFormValues = {
  name: string;
  slug: string;
  title: string;
  bio: string;
  experience_years: number;
  languages: string[];
  tour_routes: string[];
  is_active: boolean;
  display_order: number;
  license_number: string;
  phone: string;
  email: string;
};

export const emptyTourGuideForm: TourGuideFormValues = {
  name: "",
  slug: "",
  title: "",
  bio: "",
  experience_years: 0,
  languages: ["العربية"],
  tour_routes: [""],
  is_active: true,
  display_order: 0,
  license_number: "",
  phone: "",
  email: "",
};

export function tourGuideToFormValues(guide: TourGuide): TourGuideFormValues {
  return {
    name: guide.name,
    slug: guide.slug,
    title: guide.title,
    bio: guide.bio ?? "",
    experience_years: guide.experience_years,
    languages: guide.languages.length ? guide.languages : [""],
    tour_routes: guide.tour_routes.length ? guide.tour_routes : [""],
    is_active: guide.is_active,
    display_order: guide.display_order,
    license_number: guide.license_number ?? "",
    phone: guide.phone ?? "",
    email: guide.email ?? "",
  };
}

export function formatTourDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    ...(value.includes("T") ? { timeStyle: "short" as const } : {}),
  }).format(date);
}

export function formatTourTime(value: string | null | undefined): string {
  if (!value) return "";

  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return value;

  const period = hours >= 12 ? "مساءً" : "صباحًا";
  const displayHours = hours % 12 || 12;
  return `${toArabicDigits(`${displayHours}:${match[2]}`)} ${period}`;
}

export function formatPreferredSchedule(request: TourRequest): string {
  if (!request.preferred_date && !request.preferred_time) return "مرن";
  return [
    request.preferred_date ? formatTourDate(request.preferred_date) : null,
    request.preferred_time ? formatTourTime(request.preferred_time) : null,
  ]
    .filter(Boolean)
    .join(" — ");
}

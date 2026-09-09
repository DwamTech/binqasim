import type {
  ScientificFatwaCategory,
  ScientificFatwaCategoryOption,
} from "./scientific-fatwas.contracts";

export type FatwaInboxStatus = "new" | "answered" | "archived";
export type FatwaVisibility = "public" | "private";

export type FatwaInboxListItem = {
  id: string;
  reference_number: string;
  name: string | null;
  email: string;
  question_preview: string;
  question_title: string | null;
  status: FatwaInboxStatus;
  status_label: string;
  visibility: FatwaVisibility | null;
  category: string | null;
  category_id: string | null;
  category_option: ScientificFatwaCategoryOption | null;
  is_listed: boolean;
  public_url: string | null;
  created_at: string;
  answered_at: string | null;
};

export type FatwaActivityLog = {
  id: string;
  action: string;
  user_id: string | null;
  created_at: string;
  new_values: Record<string, unknown> | null;
};

export type FatwaInboxDetail = Omit<FatwaInboxListItem, "question_preview"> & {
  question: string;
  answer: string | null;
  answered_by: string | null;
  archived_by: string | null;
  archived_at: string | null;
  published_at: string | null;
  answer_revision: number;
  answer_notification_sent_at: string | null;
  updated_at: string;
  category_options: ScientificFatwaCategory[];
  activity_logs: FatwaActivityLog[];
};

export type FatwaInboxPage = {
  data: FatwaInboxListItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type FatwaInboxSummary = {
  total: number;
  new: number;
  answered: number;
  archived: number;
  public: number;
  private: number;
};

export type FatwaInboxQuery = {
  search?: string | undefined;
  status?: FatwaInboxStatus | undefined;
  visibility?: FatwaVisibility | undefined;
  page: number;
  per_page: number;
};

export type FatwaAnswerValues = {
  answer: string;
  question_title: string;
  category_id: string;
  visibility: FatwaVisibility;
  is_listed: boolean;
  notify_user: boolean;
  expected_updated_at: string;
};

export type FatwaInboxMutation = {
  id: string;
  reference_number: string;
  status: FatwaInboxStatus;
  visibility: FatwaVisibility | null;
  answer: string | null;
  question_title: string | null;
  category: string | null;
  category_id: string | null;
  category_option: ScientificFatwaCategoryOption | null;
  is_listed: boolean;
  public_url: string | null;
  answered_at: string | null;
  archived_at: string | null;
  published_at: string | null;
  answer_revision: number;
  updated_at: string;
};

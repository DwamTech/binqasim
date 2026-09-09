export const reportModuleKeys = [
  "content",
  "users",
  "support",
  "feedback",
  "files",
  "seo",
] as const;

export type ReportModuleKey = (typeof reportModuleKeys)[number];

export type ReportPeriod =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "month_to_date"
  | "quarter_to_date"
  | "year_to_date"
  | "custom";

export type ReportGroupBy = "day" | "week" | "month";
export type ReportCompare = "none" | "previous_period" | "previous_year";

export type ReportQuery = {
  period: ReportPeriod;
  group_by: ReportGroupBy;
  compare: ReportCompare;
  date_from?: string;
  date_to?: string;
  timezone: "Africa/Cairo";
};

export type ReportComparison = {
  available: boolean;
  value: unknown;
  formatted_value: string | null;
  change: number | string | null;
  change_percentage: number | null;
  percentage_change: number | null;
  direction: string;
  status: string;
  reason: string | null;
  warnings: string[];
};

export type ReportMetric = {
  key: string;
  label: string;
  description: string;
  value: unknown;
  formatted_value: string | null;
  type: string;
  available: boolean;
  availability_status: string;
  quality: string;
  sensitivity: string;
  reason: string | null;
  comparison: ReportComparison | null;
  warnings: string[];
};

export type ReportSection = {
  key: string;
  label: string;
  description: string | null;
  metrics: ReportMetric[];
  warnings: string[];
};

export type ReportPayload = {
  report_key: string;
  period: {
    key: ReportPeriod;
    date_from: string;
    date_to: string;
    timezone: string;
    group_by: string;
    compare: string;
    starts_at_utc: string;
    ends_at_utc: string;
    previous_starts_at_utc: string | null;
    previous_ends_at_utc: string | null;
  };
  sections: ReportSection[];
  warnings: string[];
  generated_at: string;
};

export type ReportModuleDefinition = {
  key: ReportModuleKey;
  title: string;
  eyebrow: string;
  description: string;
  endpoint: string;
};

export const reportModules: Record<ReportModuleKey, ReportModuleDefinition> = {
  content: {
    key: "content",
    title: "تحليلات المحتوى والنشر",
    eyebrow: "المحتوى",
    description:
      "قياس حجم المحتوى، توزيعه، وتيرة إنشائه وحالة النشر عبر الموديولات.",
    endpoint: "/admin/reports/analytics/content",
  },
  users: {
    key: "users",
    title: "تحليلات المستخدمين",
    eyebrow: "المستخدمون",
    description:
      "قراءة نمو المستخدمين وتوزيع الأدوار مع احترام خصوصية بيانات الحسابات.",
    endpoint: "/admin/reports/analytics/users",
  },
  support: {
    key: "support",
    title: "تقارير الدعم والطلبات",
    eyebrow: "الدعم",
    description:
      "متابعة تدفق طلبات الدعم وحالات المعالجة ومؤشرات الإنجاز والرفض.",
    endpoint: "/admin/reports/analytics/support",
  },
  feedback: {
    key: "feedback",
    title: "رضا المستفيدين والملاحظات",
    eyebrow: "جودة التجربة",
    description:
      "متوسط الرضا وتوزيع التقييمات وحجم الشكاوى والمقترحات دون عرض بيانات شخصية.",
    endpoint: "/admin/reports/analytics/feedback",
  },
  files: {
    key: "files",
    title: "تقارير الملفات والتخزين",
    eyebrow: "الأصول الرقمية",
    description:
      "حجم التخزين وأنواع الملفات وجودة الرفع والنسخ الاحتياطية من مصادر موثوقة.",
    endpoint: "/admin/reports/analytics/files",
  },
  seo: {
    key: "seo",
    title: "تحليلات تحسين الظهور في محركات البحث",
    eyebrow: "الظهور الرقمي",
    description:
      "مؤشرات الفهرسة والجاهزية والتحسينات الفنية المرتبطة بالمحتوى المنشور.",
    endpoint: "/admin/reports/analytics/seo",
  },
};

export function isReportModuleKey(value: string): value is ReportModuleKey {
  return reportModuleKeys.includes(value as ReportModuleKey);
}

import type {
  ReportCompare,
  ReportGroupBy,
  ReportPeriod,
  ReportQuery,
} from "../domain/reports.contracts";

type SearchValues = Record<string, string | string[] | undefined>;

const periods: ReportPeriod[] = [
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "month_to_date",
  "quarter_to_date",
  "year_to_date",
  "custom",
];
const groups: ReportGroupBy[] = ["day", "week", "month"];
const comparisons: ReportCompare[] = [
  "none",
  "previous_period",
  "previous_year",
];

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function oneOf<T extends string>(
  value: string | undefined,
  values: readonly T[],
  fallback: T,
): T {
  return value !== undefined && values.includes(value as T)
    ? (value as T)
    : fallback;
}

function date(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

export function normalizeReportQuery(values: SearchValues): ReportQuery {
  const period = oneOf(single(values.period), periods, "last_30_days");
  const dateFrom = date(single(values.date_from));
  const dateTo = date(single(values.date_to));
  const validCustom = period === "custom" && dateFrom && dateTo;

  return {
    period: validCustom ? "custom" : period === "custom" ? "last_30_days" : period,
    group_by: oneOf(single(values.group_by), groups, "day"),
    compare: oneOf(single(values.compare), comparisons, "none"),
    timezone: "Africa/Cairo",
    ...(validCustom ? { date_from: dateFrom, date_to: dateTo } : {}),
  };
}

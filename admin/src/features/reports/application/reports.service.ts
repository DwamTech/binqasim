import "server-only";

import { cookies } from "next/headers";

import { serverEnv } from "@/core/env/server";
import { sessionCookieName } from "@/server/cookies/session-cookie";

import type { ContentViewModuleKey } from "../domain/content-views.contracts";
import { contentViewModuleKeys } from "../domain/content-views.contracts";
import type { ReportModuleKey, ReportQuery } from "../domain/reports.contracts";
import { reportModules } from "../domain/reports.contracts";
import { DashboardSummaryRepository } from "../infrastructure/dashboard-summary.repository";
import { ReportsRepository } from "../infrastructure/reports.repository";

const repository = new ReportsRepository();
const dashboardSummaryRepository = new DashboardSummaryRepository();

async function token(): Promise<string | undefined> {
  return (await cookies()).get(sessionCookieName)?.value;
}

export async function getReportsOverview(query: ReportQuery) {
  return repository.get("/admin/reports/overview", query, await token());
}

export async function getDashboardContentViews() {
  return dashboardSummaryRepository.getContentViews(await token());
}

export function getEnabledContentViewModuleKeys(): ContentViewModuleKey[] {
  const flags: Record<ContentViewModuleKey, boolean> = {
    articles: serverEnv.DASHBOARD_MODULE_ARTICLES_ENABLED,
    scientific_library: serverEnv.DASHBOARD_MODULE_LIBRARY_ENABLED,
    dissertations: serverEnv.DASHBOARD_MODULE_DISSERTATIONS_ENABLED,
    listening: serverEnv.DASHBOARD_MODULE_LISTENING_ENABLED,
    scientific_fatwas: serverEnv.DASHBOARD_MODULE_SCIENTIFIC_FATWAS_ENABLED,
    scientific_videos: serverEnv.DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_ENABLED,
    hadith_cards: serverEnv.DASHBOARD_MODULE_HADITH_CARDS_ENABLED,
  };

  return contentViewModuleKeys.filter((key) => flags[key]);
}

export async function getModuleReport(
  module: ReportModuleKey,
  query: ReportQuery,
) {
  return repository.get(reportModules[module].endpoint, query, await token());
}

import "server-only";

import { redirect } from "next/navigation";

import type { DashboardFeatureModule } from "@/core/config/dashboard-module-flags";
import { serverEnv } from "@/core/env/server";

const enabledModules: Record<DashboardFeatureModule, boolean> = {
  articles: serverEnv.DASHBOARD_MODULE_ARTICLES_ENABLED,
  pages: serverEnv.DASHBOARD_MODULE_PAGES_ENABLED,
  sections: serverEnv.DASHBOARD_MODULE_SECTIONS_ENABLED,
  governance: serverEnv.DASHBOARD_MODULE_GOVERNANCE_ENABLED,
  programs: serverEnv.DASHBOARD_MODULE_PROGRAMS_ENABLED,
  applications: serverEnv.DASHBOARD_MODULE_APPLICATIONS_ENABLED,
  feedback: serverEnv.DASHBOARD_MODULE_FEEDBACK_ENABLED,
  galleryMedia: serverEnv.DASHBOARD_MODULE_GALLERY_MEDIA_ENABLED,
  legacyVisuals: serverEnv.DASHBOARD_MODULE_LEGACY_VISUALS_ENABLED,
  library: serverEnv.DASHBOARD_MODULE_LIBRARY_ENABLED,
  dissertations: serverEnv.DASHBOARD_MODULE_DISSERTATIONS_ENABLED,
  listening: serverEnv.DASHBOARD_MODULE_LISTENING_ENABLED,
  hadithCards: serverEnv.DASHBOARD_MODULE_HADITH_CARDS_ENABLED,
  scientificFatwas: serverEnv.DASHBOARD_MODULE_SCIENTIFIC_FATWAS_ENABLED,
  scientificVideos: serverEnv.DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_ENABLED,
  libraryIndexes: serverEnv.DASHBOARD_MODULE_LIBRARY_INDEXES_ENABLED,
  comments: serverEnv.DASHBOARD_MODULE_COMMENTS_ENABLED,
  tourGuides: serverEnv.DASHBOARD_MODULE_TOUR_GUIDES_ENABLED,
};

export function requireDashboardModuleEnabled(
  module: DashboardFeatureModule,
): void {
  if (!isDashboardModuleEnabled(module)) redirect("/dashboard/no-access");
}

export function isDashboardModuleEnabled(
  module: DashboardFeatureModule,
): boolean {
  return enabledModules[module];
}

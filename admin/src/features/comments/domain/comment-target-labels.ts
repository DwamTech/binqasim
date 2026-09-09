import { dashboardCopy } from "@/core/config/dashboard-copy";

const commentTargetModuleKeyByType = {
  site_article: "articles",
  scientific_library_item: "library",
  dissertation: "dissertations",
  listening_series: "listening",
  listening_session: "listening",
  scientific_fatwa: "scientificFatwas",
  scientific_video: "scientificVideos",
} as const;

type CommentTargetModuleKey =
  (typeof commentTargetModuleKeyByType)[keyof typeof commentTargetModuleKeyByType];

export type CommentTargetModuleLabels = Record<CommentTargetModuleKey, string>;

const deploymentTargetModuleLabels: CommentTargetModuleLabels = {
  articles: dashboardCopy.modules.articles.navigation,
  library: dashboardCopy.modules.library.navigation,
  dissertations: dashboardCopy.modules.dissertations.navigation,
  listening: dashboardCopy.modules.listening.navigation,
  scientificFatwas: dashboardCopy.modules.scientificFatwas.navigation,
  scientificVideos: dashboardCopy.modules.scientificVideos.navigation,
};

/**
 * Keeps the API target registry stable while allowing every dashboard
 * deployment to rename its public modules through environment labels.
 */
export function resolveCommentTargetLabel(
  targetType: string,
  backendFallback: string,
  labels: CommentTargetModuleLabels = deploymentTargetModuleLabels,
): string {
  const moduleKey =
    commentTargetModuleKeyByType[
      targetType as keyof typeof commentTargetModuleKeyByType
    ];

  return moduleKey ? labels[moduleKey] || backendFallback : backendFallback;
}

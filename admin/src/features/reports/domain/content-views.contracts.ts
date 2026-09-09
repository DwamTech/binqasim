export const contentViewModuleKeys = [
  "articles",
  "scientific_library",
  "dissertations",
  "listening",
  "scientific_fatwas",
  "scientific_videos",
  "hadith_cards",
] as const;

export type ContentViewModuleKey = (typeof contentViewModuleKeys)[number];

export type ContentViewModuleSummary = {
  key: ContentViewModuleKey;
  label: string;
  items_count: number;
  views_count: number;
};

export type ContentViewsSummary = {
  total: number;
  modules: ContentViewModuleSummary[];
};

export function filterContentViewsSummary(
  summary: ContentViewsSummary,
  enabledModules: readonly ContentViewModuleKey[],
): ContentViewsSummary {
  const enabled = new Set(enabledModules);
  const modules = summary.modules.filter((module) => enabled.has(module.key));

  return {
    total: modules.reduce((total, module) => total + module.views_count, 0),
    modules,
  };
}

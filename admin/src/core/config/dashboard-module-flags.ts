export type DashboardFeatureModule =
  | "articles"
  | "pages"
  | "sections"
  | "governance"
  | "programs"
  | "applications"
  | "feedback"
  | "galleryMedia"
  | "legacyVisuals"
  | "library"
  | "dissertations"
  | "listening"
  | "hadithCards"
  | "scientificFatwas"
  | "scientificVideos"
  | "libraryIndexes"
  | "comments"
  | "tourGuides";

type OptionalDashboardFeatureModule = "pages";

export type DashboardModuleFlags = Readonly<
  Record<
    Exclude<DashboardFeatureModule, OptionalDashboardFeatureModule>,
    boolean
  > &
    Partial<Record<OptionalDashboardFeatureModule, boolean>>
>;

export const disabledDashboardModuleFlags: DashboardModuleFlags = {
  // Shared modules stay enabled when no deployment flags are supplied. This
  // preserves existing installations while allowing this site to hide legacy
  // navigation without deleting or rewriting the shared pages.
  articles: true,
  pages: false,
  sections: true,
  governance: true,
  programs: true,
  applications: true,
  feedback: true,
  galleryMedia: true,
  legacyVisuals: true,
  library: false,
  dissertations: false,
  listening: false,
  hadithCards: false,
  scientificFatwas: false,
  scientificVideos: false,
  libraryIndexes: false,
  comments: false,
  tourGuides: false,
};

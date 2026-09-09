export const libraryAreaSlugs = ["governance", "programs"] as const;
export type LibraryAreaSlug = (typeof libraryAreaSlugs)[number];

export const libraryAreas: Record<
  LibraryAreaSlug,
  { title: string; navigation: string; basePath: string; description: string }
> = {
  governance: {
    title: "الحوكمة",
    navigation: "إدارة الحوكمة",
    basePath: "/dashboard/governance",
    description: "إدارة كتب ووثائق الحوكمة وتصنيفاتها.",
  },
  programs: {
    title: "البرامج والأنشطة",
    navigation: "إدارة البرامج والأنشطة",
    basePath: "/dashboard/programs",
    description: "إدارة كتب ومواد البرامج والأنشطة وتصنيفاتها.",
  },
};

export function isLibraryAreaSlug(
  value: string | null,
): value is LibraryAreaSlug {
  return value === "governance" || value === "programs";
}

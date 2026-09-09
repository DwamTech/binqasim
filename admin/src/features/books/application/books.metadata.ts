import "server-only";

import { cookies } from "next/headers";
import {
  hasDashboardPermission,
  isDashboardAdmin,
} from "@/core/authorization/dashboard-access";
import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import { BooksRepository } from "../infrastructure/books.repository";
import type { BookSeries } from "../domain/books.contracts";
import type { Section } from "@/features/sections/sections.contracts";
import type { LibraryAreaSlug } from "../domain/library-areas";

export type BookSectionOption = {
  id: string;
  name: string;
  is_active?: boolean;
  slug?: string;
  parent_id?: string | null | undefined;
};
export type BookCreateMetadata = {
  authors: string[];
  series: BookSeries[];
  sections: BookSectionOption[];
  sectionsSource: "admin" | "public" | "unavailable";
  sectionsWarning: string | null;
};

const repository = new BooksRepository();
const warning =
  "اختيار القسم غير متاح مؤقتًا؛ سيبقى اختياريًا عند إنشاء الكتاب.";

export async function getBookCreateMetadata(
  actor: AdminSummary,
  area?: LibraryAreaSlug,
): Promise<
  BookCreateMetadata | { success: false; failure: "authors" | "series" }
> {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return { success: false, failure: "authors" };
  const [authors, series] = await Promise.all([
    repository.authors(token),
    repository.series(token),
  ]);
  if (!authors.success) return { success: false, failure: "authors" };
  if (!series.success) return { success: false, failure: "series" };
  if (area) {
    const categories = await repository.categories(area, token);
    if (!categories.success)
      return {
        authors: authors.data,
        series: series.data,
        sections: [],
        sectionsSource: "unavailable",
        sectionsWarning: warning,
      };

    return {
      authors: authors.data,
      series: series.data,
      sections: categories.data.data.map((section) => ({
        id: String(section.id),
        name: section.name,
        is_active: section.is_active,
        slug: section.slug,
        parent_id: String(section.parent_id),
      })),
      sectionsSource: "admin",
      sectionsWarning: null,
    };
  }
  const adminCatalog =
    isDashboardAdmin(actor) || hasDashboardPermission(actor, "sections.manage");
  let data: Section[];
  if (adminCatalog) {
    const sections = await repository.adminSections(token);
    if (!sections.success)
      return {
        authors: authors.data,
        series: series.data,
        sections: [],
        sectionsSource: "unavailable",
        sectionsWarning: warning,
      };
    data = sections.data.data;
  } else {
    const sections = await repository.publicSections();
    if (!sections.success)
      return {
        authors: authors.data,
        series: series.data,
        sections: [],
        sectionsSource: "unavailable",
        sectionsWarning: warning,
      };
    data = sections.data;
  }
  const scopedSections = data.filter(
    (section) => section.module === "books" && section.parent_id,
  );

  return {
    authors: authors.data,
    series: series.data,
    sections: scopedSections.map((section) => ({
      id: section.id,
      name: section.name,
      is_active: section.is_active,
      slug: section.slug,
      parent_id: section.parent_id,
    })),
    sectionsSource: adminCatalog ? "admin" : "public",
    sectionsWarning: null,
  };
}

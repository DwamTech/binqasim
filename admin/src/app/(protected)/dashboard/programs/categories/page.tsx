import type { Metadata } from "next";
import { LibraryAreaCategoriesPage } from "@/features/books/presentation/library-area-pages";

export const metadata: Metadata = { title: "أقسام البرامج والأنشطة" };
export default function Page() {
  return <LibraryAreaCategoriesPage area="programs" />;
}

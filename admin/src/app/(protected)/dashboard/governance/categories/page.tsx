import type { Metadata } from "next";
import { LibraryAreaCategoriesPage } from "@/features/books/presentation/library-area-pages";

export const metadata: Metadata = { title: "أقسام الحوكمة" };
export default function Page() {
  return <LibraryAreaCategoriesPage area="governance" />;
}

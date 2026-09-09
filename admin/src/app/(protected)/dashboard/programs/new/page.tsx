import type { Metadata } from "next";
import { LibraryAreaCreatePage } from "@/features/books/presentation/library-area-pages";

export const metadata: Metadata = { title: "إضافة كتاب برنامج أو نشاط" };
export default function Page() {
  return <LibraryAreaCreatePage area="programs" />;
}

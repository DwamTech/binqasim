import type { Metadata } from "next";
import { LibraryAreaListPage } from "@/features/books/presentation/library-area-pages";

export const metadata: Metadata = { title: "إدارة الحوكمة" };

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <LibraryAreaListPage area="governance" searchParams={searchParams} />;
}

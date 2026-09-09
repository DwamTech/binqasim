import type { Metadata } from "next";
import { LibraryAreaListPage } from "@/features/books/presentation/library-area-pages";

export const metadata: Metadata = { title: "إدارة البرامج والأنشطة" };

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <LibraryAreaListPage area="programs" searchParams={searchParams} />;
}

import { LibraryAreaDetailPage } from "@/features/books/presentation/library-area-pages";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <LibraryAreaDetailPage
      area="programs"
      params={params}
      searchParams={searchParams}
    />
  );
}

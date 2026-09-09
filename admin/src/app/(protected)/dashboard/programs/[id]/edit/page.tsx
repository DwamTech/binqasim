import { LibraryAreaEditPage } from "@/features/books/presentation/library-area-pages";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <LibraryAreaEditPage area="programs" params={params} />;
}

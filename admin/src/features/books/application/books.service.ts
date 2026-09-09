import "server-only";
import { cookies } from "next/headers";
import { apiFailure } from "@/core/api/api-response";
import { serverEnv } from "@/core/env/server";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import { mapAdminBookDetailMedia } from "../infrastructure/books.media-mapper";
import type { AdminBooksQuery } from "../domain/books.contracts";
import { BooksRepository } from "../infrastructure/books.repository";

function missingSession() {
  return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
}

export function createBooksReadService(
  repository: BooksRepository,
  getToken: () => Promise<string | undefined>,
) {
  async function withToken<T>(request: (token: string) => Promise<T>) {
    const sessionToken = await getToken();
    return sessionToken === undefined
      ? missingSession()
      : request(sessionToken);
  }

  return {
    getAdminBooks: (query: AdminBooksQuery) =>
      withToken((sessionToken) => repository.list(query, sessionToken)),
    getAdminBook: (id: string, area?: AdminBooksQuery["area"]) =>
      withToken((sessionToken) =>
        area
          ? repository.detail(id, sessionToken, area)
          : repository.detail(id, sessionToken),
      ),
    getAdminBookSeries: () =>
      withToken((sessionToken) => repository.series(sessionToken)),
    getAdminBookSeriesItem: (id: string) =>
      withToken((sessionToken) => repository.seriesItem(id, sessionToken)),
    getAdminBookAuthors: () =>
      withToken((sessionToken) => repository.authors(sessionToken)),
    getLibraryCategories: (area: NonNullable<AdminBooksQuery["area"]>) =>
      withToken((sessionToken) => repository.categories(area, sessionToken)),
  };
}

const service = createBooksReadService(
  new BooksRepository(),
  async () => (await cookies()).get(sessionCookieName)?.value,
);

export const getAdminBooks = service.getAdminBooks;
export const getAdminBook = service.getAdminBook;
export const getAdminBookSeries = service.getAdminBookSeries;
export const getAdminBookSeriesItem = service.getAdminBookSeriesItem;
export const getAdminBookAuthors = service.getAdminBookAuthors;
export const getLibraryCategories = service.getLibraryCategories;

export async function getAdminBookForPresentation(
  id: string,
  area?: AdminBooksQuery["area"],
) {
  const result = await getAdminBook(id, area);
  if (!result.success) return result;

  const model = {
    ...result,
    data: {
      detail: result.data,
      ...mapAdminBookDetailMedia(result.data, serverEnv.BACKEND_API_URL),
    },
  };
  return model;
}

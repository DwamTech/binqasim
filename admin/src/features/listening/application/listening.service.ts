import "server-only";

import { cookies } from "next/headers";

import { apiFailure } from "@/core/api/api-response";
import { serverEnv } from "@/core/env/server";
import { resolveMediaUrl } from "@/core/media/resolve-media-url";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import type {
  ListeningSeriesQuery,
  ListeningSessionQuery,
} from "../domain/listening.contracts";
import { ListeningRepository } from "../infrastructure/listening.repository";

const repository = new ListeningRepository();

async function token(): Promise<string | undefined> {
  return (await cookies()).get(sessionCookieName)?.value;
}

export async function getAdminListeningSeries(query: ListeningSeriesQuery) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.listSeries(query, sessionToken);
}

export async function getAdminListeningSeriesDetail(id: string) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.seriesDetail(id, sessionToken);
}

export async function getAdminListeningSeriesForPresentation(id: string) {
  const result = await getAdminListeningSeriesDetail(id);
  if (!result.success) return result;
  const sourceUrl = serverEnv.BACKEND_API_URL
    ? resolveMediaUrl(
        result.data.book_file_url ?? result.data.book_file_path,
        serverEnv.BACKEND_API_URL,
      )
    : undefined;
  return {
    ...result,
    data: {
      series: result.data,
      sourceUrl:
        result.data.book_source_type === "file"
          ? (result.data.book_url ?? sourceUrl)
          : (result.data.book_source_link ?? undefined),
    },
  };
}

export async function getAdminListeningSeriesCatalog() {
  const result = await getAdminListeningSeries({ page: 1, per_page: 100 });
  if (!result.success) return result;
  return {
    ...result,
    data: result.data.data.map(({ id, slug, title, short_title }) => ({
      id,
      slug,
      title,
      short_title,
    })),
  };
}

export async function getAdminListeningSessions(query: ListeningSessionQuery) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.listSessions(query, sessionToken);
}

export async function getAdminListeningSessionDetail(id: string) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.sessionDetail(id, sessionToken);
}

export async function getAdminListeningSessionForPresentation(id: string) {
  const result = await getAdminListeningSessionDetail(id);
  if (!result.success) return result;
  const sourceUrl = serverEnv.BACKEND_API_URL
    ? resolveMediaUrl(
        result.data.audio_file_url ?? result.data.audio_file_path,
        serverEnv.BACKEND_API_URL,
      )
    : undefined;
  return {
    ...result,
    data: {
      session: result.data,
      sourceUrl:
        result.data.audio_source_type === "file"
          ? (result.data.audio_url ?? sourceUrl)
          : (result.data.audio_source_link ?? undefined),
    },
  };
}

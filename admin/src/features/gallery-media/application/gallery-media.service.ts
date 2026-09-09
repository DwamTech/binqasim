import "server-only";
import { cookies } from "next/headers";
import { serverEnv } from "@/core/env/server";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import type { GalleryMediaListQuery } from "../domain/gallery-media.contracts";
import { mapGalleryMediaPaginator } from "../infrastructure/gallery-media.mapper";
import { GalleryMediaRepository } from "../infrastructure/gallery-media.repository";
const repository = new GalleryMediaRepository();
export async function getGalleryMedia(query: GalleryMediaListQuery) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  const result = await repository.list(query, token);
  return result.success
    ? {
        ...result,
        data: mapGalleryMediaPaginator(result.data, serverEnv.BACKEND_API_URL),
      }
    : result;
}

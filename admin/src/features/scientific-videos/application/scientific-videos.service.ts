import "server-only";

import { cookies } from "next/headers";
import { apiFailure, apiSuccess } from "@/core/api/api-response";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import {
  resolveScientificVideoOptions,
  type ScientificVideoQuery,
} from "../domain/scientific-videos";
import { ScientificVideosRepository } from "../infrastructure/scientific-videos.repository";
import { presentScientificVideo } from "./scientific-videos.presenter";

const repository = new ScientificVideosRepository();
async function token() {
  return (await cookies()).get(sessionCookieName)?.value;
}

export async function getScientificVideoItems(query: ScientificVideoQuery) {
  const auth = await token();
  if (!auth) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  const result = await repository.list(query, auth);
  return result.success
    ? apiSuccess(
        { ...result.data, data: result.data.data.map(presentScientificVideo) },
        result.meta?.requestId,
      )
    : result;
}

export async function getScientificVideoItem(id: string) {
  const auth = await token();
  if (!auth) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  const result = await repository.detail(id, auth);
  return result.success
    ? apiSuccess(presentScientificVideo(result.data), result.meta?.requestId)
    : result;
}

export async function getScientificVideoOptions() {
  const auth = await token();
  if (!auth) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  const result = await repository.options(auth);
  return result.success
    ? apiSuccess(
        resolveScientificVideoOptions(result.data),
        result.meta?.requestId,
      )
    : result;
}

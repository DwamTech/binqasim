import "server-only";

import { cookies } from "next/headers";

import { apiFailure } from "@/core/api/api-response";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import type { HadithCardProjectQuery } from "../domain/hadith-cards";
import { HadithCardsRepository } from "../infrastructure/hadith-cards.repository";

const repository = new HadithCardsRepository();

async function token(): Promise<string | undefined> {
  return (await cookies()).get(sessionCookieName)?.value;
}

export async function getAdminHadithCardProjects(
  query: HadithCardProjectQuery,
) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.listProjects(query, sessionToken);
}

export async function getAdminHadithCardProjectDetail(id: string) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.projectDetail(id, sessionToken);
}

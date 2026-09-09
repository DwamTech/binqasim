import "server-only";

import { cookies } from "next/headers";

import { apiFailure } from "@/core/api/api-response";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import type { ScientificFatwaQuery } from "../domain/scientific-fatwas.contracts";
import { ScientificFatwasRepository } from "../infrastructure/scientific-fatwas.repository";

const repository = new ScientificFatwasRepository();

async function token(): Promise<string | undefined> {
  return (await cookies()).get(sessionCookieName)?.value;
}

export async function getAdminScientificFatwas(query: ScientificFatwaQuery) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.list(query, sessionToken);
}

export async function getAdminScientificFatwa(id: string) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.get(id, sessionToken);
}

export async function getScientificFatwaCategories() {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.categories(sessionToken);
}

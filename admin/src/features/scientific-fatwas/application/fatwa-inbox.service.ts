import "server-only";

import { cookies } from "next/headers";

import { apiFailure } from "@/core/api/api-response";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import type { FatwaInboxQuery } from "../domain/fatwa-inbox.contracts";
import { FatwaInboxRepository } from "../infrastructure/fatwa-inbox.repository";

const repository = new FatwaInboxRepository();

async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get(sessionCookieName)?.value;
}

export async function getFatwaInbox(query: FatwaInboxQuery) {
  const token = await sessionToken();
  if (!token) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.list(query, token);
}

export async function getFatwaInboxSummary() {
  const token = await sessionToken();
  if (!token) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.summary(token);
}

export async function getFatwaInboxDetail(id: string) {
  const token = await sessionToken();
  if (!token) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.get(id, token);
}

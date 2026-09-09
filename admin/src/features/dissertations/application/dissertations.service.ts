import "server-only";

import { cookies } from "next/headers";

import { apiFailure } from "@/core/api/api-response";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import type { DissertationQuery } from "../domain/dissertations.contracts";
import { DissertationsRepository } from "../infrastructure/dissertations.repository";

const repository = new DissertationsRepository();

async function token(): Promise<string | undefined> {
  return (await cookies()).get(sessionCookieName)?.value;
}

export async function getAdminDissertations(query: DissertationQuery) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.list(query, sessionToken);
}

export async function getAdminDissertation(id: string) {
  const sessionToken = await token();
  if (!sessionToken) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  return repository.detail(id, sessionToken);
}

export async function getAdminDissertationForPresentation(id: string) {
  const result = await getAdminDissertation(id);
  if (!result.success) return result;
  const privateFileUrl =
    result.data.source_type === "file" &&
    result.data.has_file &&
    /^[1-9]\d*$/.test(result.data.id)
      ? `/api/dissertations/${result.data.id}/file`
      : undefined;
  return {
    ...result,
    data: {
      dissertation: result.data,
      sourceUrl:
        result.data.source_type === "file"
          ? privateFileUrl
          : (result.data.source_link ?? undefined),
    },
  };
}

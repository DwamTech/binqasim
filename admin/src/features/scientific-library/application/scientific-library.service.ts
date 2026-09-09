import "server-only";

import { cookies } from "next/headers";

import { apiFailure, apiSuccess } from "@/core/api/api-response";
import { serverEnv } from "@/core/env/server";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import {
  resolveScientificLibraryOptions,
  type ScientificLibraryQuery,
} from "../domain/scientific-library.contracts";
import { ScientificLibraryRepository } from "../infrastructure/scientific-library.repository";
import { presentScientificLibraryItem } from "./scientific-library-item.presenter";

const repository = new ScientificLibraryRepository();

async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get(sessionCookieName)?.value;
}

export async function getScientificLibraryItems(query: ScientificLibraryQuery) {
  const token = await sessionToken();
  if (!token) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  const result = await repository.list(query, token);
  return result.success
    ? apiSuccess(
        {
          ...result.data,
          data: result.data.data.map((item) =>
            presentScientificLibraryItem(item, serverEnv.BACKEND_API_URL),
          ),
        },
        result.meta?.requestId,
      )
    : result;
}

export async function getScientificLibraryItem(id: string) {
  const token = await sessionToken();
  if (!token) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  const result = await repository.detail(id, token);
  return result.success
    ? apiSuccess(
        presentScientificLibraryItem(result.data, serverEnv.BACKEND_API_URL),
        result.meta?.requestId,
      )
    : result;
}

export async function getScientificLibraryOptions() {
  const token = await sessionToken();
  if (!token) return apiFailure("AUTH_SESSION_EXPIRED", { status: 401 });
  const result = await repository.options(token);
  return result.success
    ? apiSuccess(
        resolveScientificLibraryOptions(result.data),
        result.meta?.requestId,
      )
    : result;
}

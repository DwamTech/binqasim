import "server-only";

import { serverApiClient } from "@/core/api/server-api-client";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import type { HadithCardProjectQuery } from "../domain/hadith-cards";
import {
  hadithCardProjectDetailSchema,
  hadithCardProjectPageSchema,
} from "../domain/hadith-cards";

/**
 * Server-side gateway for the isolated Hadith Cards API.  Keeping this class
 * separate makes the dashboard module portable without changing a shared
 * repository used by other installations.
 */
export class HadithCardsRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  private auth(token: string) {
    return { authorization: `Bearer ${token}` };
  }

  listProjects(query: HadithCardProjectQuery, token: string) {
    return this.client.request("/admin/hadith-cards/projects", {
      query,
      responseSchema: hadithCardProjectPageSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }

  projectDetail(id: string, token: string) {
    return this.client.request(
      `/admin/hadith-cards/projects/${encodeURIComponent(id)}`,
      {
        responseSchema: hadithCardProjectDetailSchema,
        cache: "no-store",
        ...this.auth(token),
      },
    );
  }
}

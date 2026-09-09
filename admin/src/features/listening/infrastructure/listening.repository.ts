import "server-only";

import { serverApiClient } from "@/core/api/server-api-client";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import type {
  ListeningSeriesQuery,
  ListeningSessionQuery,
} from "../domain/listening.contracts";
import {
  listeningSeriesDetailSchema,
  listeningSeriesPageSchema,
  listeningSessionDetailSchema,
  listeningSessionPageSchema,
} from "../domain/listening.schemas";

export class ListeningRepository {
  constructor(private readonly client: ServerApiClient = serverApiClient) {}

  private auth(token: string) {
    return { authorization: `Bearer ${token}` };
  }

  listSeries(query: ListeningSeriesQuery, token: string) {
    return this.client.request("/admin/listening/series", {
      query,
      responseSchema: listeningSeriesPageSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }

  seriesDetail(id: string, token: string) {
    return this.client.request(
      `/admin/listening/series/${encodeURIComponent(id)}`,
      {
        responseSchema: listeningSeriesDetailSchema,
        cache: "no-store",
        ...this.auth(token),
      },
    );
  }

  listSessions(query: ListeningSessionQuery, token: string) {
    return this.client.request("/admin/listening/sessions", {
      query,
      responseSchema: listeningSessionPageSchema,
      cache: "no-store",
      ...this.auth(token),
    });
  }

  sessionDetail(id: string, token: string) {
    return this.client.request(
      `/admin/listening/sessions/${encodeURIComponent(id)}`,
      {
        responseSchema: listeningSessionDetailSchema,
        cache: "no-store",
        ...this.auth(token),
      },
    );
  }
}

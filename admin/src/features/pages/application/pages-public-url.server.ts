import "server-only";

import { serverEnv } from "@/core/env/server";

const pagePathSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const previewToken = /^[a-f0-9]{64}$/;

function publicFrontendOrigin(): string {
  const origin = serverEnv.PUBLIC_FRONTEND_ORIGIN;

  if (origin === undefined) {
    throw new Error(
      "PUBLIC_FRONTEND_ORIGIN is required for Pages public navigation.",
    );
  }

  return origin;
}

export function buildPublicPageUrl(path: string): string {
  const segments = path.split("/");

  if (
    segments.length === 0 ||
    segments.some((segment) => !pagePathSegment.test(segment))
  ) {
    throw new Error("Invalid canonical Page path.");
  }

  const encodedPath = segments.map(encodeURIComponent).join("/");

  return new URL(`/pages/${encodedPath}`, publicFrontendOrigin()).toString();
}

export function buildPreviewUrl(token: string): string {
  if (!previewToken.test(token)) {
    throw new Error("Invalid Page Preview token.");
  }

  return new URL(
    `/pages-preview/${encodeURIComponent(token)}`,
    publicFrontendOrigin(),
  ).toString();
}

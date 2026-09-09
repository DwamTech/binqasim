import {
  apiFailure,
  type ApiErrorCode,
  type ApiResponse,
} from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";

import {
  tourGuideDeleteSchema,
  tourGuideResourceSchema,
  tourGuideScalarSchema,
  tourGuidesPageSchema,
  tourGuidesQuerySchema,
  tourGuidesSummarySchema,
  tourRequestResourceSchema,
  tourRequestsPageSchema,
  tourRequestsQuerySchema,
  tourRequestsSummarySchema,
  tourRequestStatusUpdateSchema,
} from "../domain/tour-guides.schemas";
import {
  tourGuidesQueryToBackend,
  tourRequestsQueryToBackend,
} from "../infrastructure/tour-guides.query";

export type TourGuidesBffResponse = { status: number; body: object };

const GUIDE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const allowedGuidePhotoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): TourGuidesBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(
  status: number,
  fieldErrors?: Record<string, string[]>,
): TourGuidesBffResponse {
  const code: ApiErrorCode =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : status === 400
          ? "REQUEST_BODY_INVALID"
          : "VALIDATION_FAILED";
  return {
    status,
    body: apiFailure(code, {
      status,
      ...(fieldErrors ? { fieldErrors } : {}),
    }),
  };
}

function auth(token: string) {
  return { authorization: `Bearer ${token}` };
}

function validId(value: string): string | null {
  return /^[1-9]\d*$/.test(value) ? value : null;
}

function queryInput(request: Request, fields: readonly string[]) {
  const params = new URL(request.url).searchParams;
  return Object.fromEntries(
    fields.flatMap((field) => {
      const value = params.get(field);
      return value ? [[field, value]] : [];
    }),
  );
}

async function json(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.reduce<Record<string, string[]>>((errors, issue) => {
    const key = issue.path.length ? issue.path.join(".") : "form";
    errors[key] = [...(errors[key] ?? []), issue.message];
    return errors;
  }, {});
}

async function validatedGuideForm(
  request: Request,
  requirePhoto: boolean,
): Promise<
  | { success: true; data: FormData }
  | { success: false; errors: Record<string, string[]> }
> {
  let source: FormData;
  try {
    source = await request.formData();
  } catch {
    return { success: false, errors: { form: ["تعذر قراءة بيانات النموذج."] } };
  }

  const values = {
    name: String(source.get("name") ?? ""),
    slug: String(source.get("slug") ?? ""),
    title: String(source.get("title") ?? ""),
    bio: String(source.get("bio") ?? ""),
    experience_years: String(source.get("experience_years") ?? ""),
    languages: source
      .getAll("languages[]")
      .map(String)
      .filter((value) => value.trim() !== ""),
    tour_routes: source
      .getAll("tour_routes[]")
      .map(String)
      .filter((value) => value.trim() !== ""),
    is_active: String(source.get("is_active") ?? "0"),
    display_order: String(source.get("display_order") ?? "0"),
    license_number: String(source.get("license_number") ?? ""),
    phone: String(source.get("phone") ?? ""),
    email: String(source.get("email") ?? ""),
  };
  const parsed = tourGuideScalarSchema.safeParse(values);
  const errors: Record<string, string[]> = parsed.success
    ? {}
    : zodFieldErrors(parsed.error.issues);
  const photoCandidate = source.get("photo");
  const photo =
    photoCandidate instanceof File && photoCandidate.size > 0
      ? photoCandidate
      : undefined;

  if (requirePhoto && photo === undefined)
    errors.photo = ["الصورة الشخصية بنسبة ٤×٦ مطلوبة."];
  if (photo && photo.size > GUIDE_PHOTO_MAX_BYTES)
    errors.photo = ["حجم الصورة يجب ألا يتجاوز ٥MB."];
  if (photo && !allowedGuidePhotoTypes.has(photo.type.toLowerCase()))
    errors.photo = ["صيغة الصورة يجب أن تكون JPG أو PNG أو WebP."];
  if (!parsed.success || Object.keys(errors).length > 0)
    return { success: false, errors };

  const body = new FormData();
  body.set("name", parsed.data.name);
  body.set("slug", parsed.data.slug);
  body.set("title", parsed.data.title);
  body.set("bio", parsed.data.bio);
  body.set("experience_years", String(parsed.data.experience_years));
  parsed.data.languages.forEach((value) => body.append("languages[]", value));
  parsed.data.tour_routes.forEach((value) =>
    body.append("tour_routes[]", value),
  );
  body.set("is_active", parsed.data.is_active);
  body.set("display_order", String(parsed.data.display_order));
  body.set("license_number", parsed.data.license_number);
  body.set("phone", parsed.data.phone);
  body.set("email", parsed.data.email);
  if (photo) body.set("photo", photo);
  return { success: true, data: body };
}

export async function listTourGuidesBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  const parsed = tourGuidesQuerySchema.safeParse(
    queryInput(request, ["search", "is_active", "page", "per_page"]),
  );
  if (!parsed.success) return failure(422, zodFieldErrors(parsed.error.issues));
  return response(
    await client.request("/admin/tour-guides", {
      ...auth(token),
      query: tourGuidesQueryToBackend(parsed.data),
      responseSchema: tourGuidesPageSchema,
      cache: "no-store",
    }),
  );
}

export async function getTourGuidesSummaryBff(
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request("/admin/tour-guides/summary", {
      ...auth(token),
      responseSchema: tourGuidesSummarySchema,
      cache: "no-store",
    }),
  );
}

export async function createTourGuideBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  const form = await validatedGuideForm(request, true);
  if (!form.success) return failure(422, form.errors);
  return response(
    await client.request("/admin/tour-guides", {
      method: "POST",
      ...auth(token),
      body: form.data,
      responseSchema: tourGuideResourceSchema,
      cache: "no-store",
    }),
    201,
  );
}

export async function getTourGuideBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  const guideId = validId(id);
  if (!guideId) return failure(404);
  return response(
    await client.request(`/admin/tour-guides/${guideId}`, {
      ...auth(token),
      responseSchema: tourGuideResourceSchema,
      cache: "no-store",
    }),
  );
}

export async function updateTourGuideBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  const guideId = validId(id);
  if (!guideId) return failure(404);
  const form = await validatedGuideForm(request, false);
  if (!form.success) return failure(422, form.errors);
  return response(
    await client.request(`/admin/tour-guides/${guideId}`, {
      method: "PATCH",
      multipartMethodOverride: "PATCH",
      ...auth(token),
      body: form.data,
      responseSchema: tourGuideResourceSchema,
      cache: "no-store",
    }),
  );
}

export async function deleteTourGuideBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  const guideId = validId(id);
  if (!guideId) return failure(404);
  return response(
    await client.request(`/admin/tour-guides/${guideId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: tourGuideDeleteSchema,
      cache: "no-store",
    }),
  );
}

export async function listTourRequestsBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  const parsed = tourRequestsQuerySchema.safeParse(
    queryInput(request, [
      "search",
      "status",
      "guide_id",
      "date_from",
      "date_to",
      "page",
      "per_page",
    ]),
  );
  if (!parsed.success) return failure(422, zodFieldErrors(parsed.error.issues));
  return response(
    await client.request("/admin/tour-requests", {
      ...auth(token),
      query: tourRequestsQueryToBackend(parsed.data),
      responseSchema: tourRequestsPageSchema,
      cache: "no-store",
    }),
  );
}

export async function getTourRequestsSummaryBff(
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request("/admin/tour-requests/summary", {
      ...auth(token),
      responseSchema: tourRequestsSummarySchema,
      cache: "no-store",
    }),
  );
}

export async function getTourRequestBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  const requestId = validId(id);
  if (!requestId) return failure(404);
  return response(
    await client.request(`/admin/tour-requests/${requestId}`, {
      ...auth(token),
      responseSchema: tourRequestResourceSchema,
      cache: "no-store",
    }),
  );
}

export async function updateTourRequestStatusBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<TourGuidesBffResponse> {
  if (!token) return failure(401);
  const requestId = validId(id);
  if (!requestId) return failure(404);
  const parsed = tourRequestStatusUpdateSchema.safeParse(await json(request));
  if (!parsed.success) return failure(422, zodFieldErrors(parsed.error.issues));
  return response(
    await client.request(`/admin/tour-requests/${requestId}/status`, {
      method: "PATCH",
      ...auth(token),
      body: parsed.data,
      responseSchema: tourRequestResourceSchema,
      cache: "no-store",
    }),
  );
}

export function toTourGuidesHttpResponse(
  result: TourGuidesBffResponse,
): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}

"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { sessionCookieName } from "@/server/cookies/session-cookie";
import type { GalleryMediaMutationResult } from "../domain/gallery-media.contracts";
import { validateGalleryMediaFiles } from "../domain/gallery-media.validation";
import { GalleryMediaRepository } from "../infrastructure/gallery-media.repository";
const repository = new GalleryMediaRepository();
async function token() {
  await requireDashboardPermission("gallery.manage");
  return (await cookies()).get(sessionCookieName)?.value;
}
function failure(
  message: string,
  fieldErrors?: Record<string, string[]>,
): GalleryMediaMutationResult {
  return fieldErrors === undefined
    ? { success: false, message }
    : { success: false, message, fieldErrors };
}
export async function uploadGalleryMediaAction(
  formData: FormData,
): Promise<GalleryMediaMutationResult> {
  const candidate = formData.get("files[]");
  const file = candidate instanceof File ? candidate : undefined;
  if (file === undefined)
    return failure("يرجى اختيار ملف واحد على الأقل.", {
      files: ["يرجى اختيار ملف واحد على الأقل."],
    });
  const fieldErrors = validateGalleryMediaFiles([file]);
  if (Object.keys(fieldErrors).length > 0)
    return failure("يرجى التحقق من الملفات المختارة.", fieldErrors);
  const sessionToken = await token();
  if (sessionToken === undefined)
    return failure("انتهت الجلسة. سجّل الدخول مرة أخرى.");
  const result = await repository.upload(file, sessionToken);
  if (!result.success)
    return failure(
      "تعذّر رفع الملف. حاول مرة أخرى.",
      result.error.fieldErrors,
    );
  revalidatePath("/dashboard/gallery-media");
  return { success: true, message: "تم رفع الملف بنجاح." };
}
export async function deleteGalleryMediaAction(
  id: number,
): Promise<GalleryMediaMutationResult> {
  const sessionToken = await token();
  if (sessionToken === undefined)
    return failure("انتهت الجلسة. سجّل الدخول مرة أخرى.");
  const result = await repository.remove(id, sessionToken);
  if (!result.success)
    return failure(
      result.error.status === 404
        ? "هذا الملف لم يعد موجودًا."
        : "تعذّر حذف الملف. حاول مرة أخرى.",
    );
  revalidatePath("/dashboard/gallery-media");
  return { success: true, message: "تم حذف الملف بنجاح." };
}

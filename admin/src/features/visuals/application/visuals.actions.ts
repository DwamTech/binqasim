"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { sessionCookieName } from "@/server/cookies/session-cookie";

import type { VisualMutationResult } from "../domain/visuals.contracts";
import {
  parseVisualFormData,
  validateVisualInput,
} from "../domain/visuals.validation";
import { VisualsRepository } from "../infrastructure/visuals.repository";

const repository = new VisualsRepository();

function failedMutation(
  message: string,
  fieldErrors?: Record<string, string[]>,
): VisualMutationResult {
  return fieldErrors === undefined
    ? { success: false, message }
    : { success: false, message, fieldErrors };
}

async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get(sessionCookieName)?.value;
}

async function requireVisualsMutationAccess(): Promise<string | undefined> {
  await requireDashboardPermission("visuals.manage");
  return sessionToken();
}

function fromApiFailure(error: {
  message: string;
  fieldErrors?: Record<string, string[]>;
}): VisualMutationResult {
  return failedMutation(
    "تعذّر حفظ المرئية. تحقق من البيانات وحاول مرة أخرى.",
    error.fieldErrors,
  );
}

export async function createVisualAction(
  formData: FormData,
): Promise<VisualMutationResult> {
  const token = await requireVisualsMutationAccess();
  if (token === undefined)
    return failedMutation("انتهت الجلسة. سجّل الدخول مرة أخرى.");
  const parsed = parseVisualFormData(formData);
  if (parsed.input === undefined)
    return failedMutation(
      "يرجى التحقق من الحقول المطلوبة.",
      parsed.fieldErrors,
    );

  const result = await repository.create(parsed.input, token);
  if (!result.success) return fromApiFailure(result.error);
  revalidatePath("/dashboard/visuals");
  return {
    success: true,
    message: "تمت إضافة المرئية بنجاح.",
    ...(result.data.visual === undefined ? {} : { id: result.data.visual.id }),
  };
}

export async function updateVisualAction(
  id: string,
  formData: FormData,
): Promise<VisualMutationResult> {
  const token = await requireVisualsMutationAccess();
  if (token === undefined)
    return failedMutation("انتهت الجلسة. سجّل الدخول مرة أخرى.");
  const parsed = parseVisualFormData(formData, "update");
  if (parsed.input === undefined)
    return failedMutation(
      "يرجى التحقق من الحقول المطلوبة.",
      parsed.fieldErrors,
    );

  const validation = validateVisualInput(parsed.input, "update");
  if (!validation.valid)
    return failedMutation(
      "يرجى التحقق من الحقول المطلوبة.",
      validation.fieldErrors,
    );
  const result = await repository.update(id, parsed.input, token);
  if (!result.success) return fromApiFailure(result.error);
  revalidatePath("/dashboard/visuals");
  revalidatePath(`/dashboard/visuals/${encodeURIComponent(id)}`);
  return { success: true, message: "تم تحديث المرئية بنجاح.", id };
}

export async function deleteVisualAction(
  id: string,
): Promise<VisualMutationResult> {
  const token = await requireVisualsMutationAccess();
  if (token === undefined)
    return failedMutation("انتهت الجلسة. سجّل الدخول مرة أخرى.");
  const result = await repository.remove(id, token);
  if (!result.success) return fromApiFailure(result.error);
  revalidatePath("/dashboard/visuals");
  return {
    success: true,
    message: `تم حذف ${dashboardCopy.modules.visuals.singular} بنجاح.`,
  };
}

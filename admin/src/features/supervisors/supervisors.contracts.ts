import { z } from "zod";
import { ARABIC_DISPLAY_LOCALE } from "@/shared/lib/arabic-format";

import {
  dashboardPermissions,
  type DashboardPermission,
} from "../auth/domain/auth.contracts";
import {
  dashboardModuleByPermission,
  dashboardModules,
  dashboardPermissionLabels,
  type DashboardPermissionGroup,
} from "../../core/authorization/dashboard-modules";

export const supervisorRoles = [
  "admin",
  "editor",
  "author",
  "reviewer",
] as const;
export type SupervisorRole = (typeof supervisorRoles)[number];

export const roleLabels: Record<SupervisorRole, string> = {
  admin: "مدير النظام",
  editor: "محرر",
  author: "كاتب",
  reviewer: "مراجع",
};

export const permissionLabels = dashboardPermissionLabels;

export const reservedPermissions: readonly DashboardPermission[] =
  dashboardModules
    .filter((module) => module.delegation === "admin-only")
    .map((module) => module.permission);

export const integratedPermissions: readonly DashboardPermission[] =
  dashboardModules
    .filter((module) => module.integration === "available")
    .map((module) => module.permission);

const permissionGroupLabels: Record<DashboardPermissionGroup, string> = {
  base: "الوصول الأساسي",
  content: "إدارة المحتوى",
  operations: "التشغيل والتقارير والإعدادات",
  reserved: "صلاحيات محجوزة",
};

export const permissionGroups: ReadonlyArray<{
  id: DashboardPermissionGroup;
  label: string;
  permissions: readonly DashboardPermission[];
}> = (["base", "content", "operations", "reserved"] as const).map((id) => ({
  id,
  label: permissionGroupLabels[id],
  permissions: dashboardPermissions.filter(
    (permission) => dashboardModuleByPermission[permission].group === id,
  ),
}));

export const rolePermissionPresets: Record<
  SupervisorRole,
  readonly DashboardPermission[]
> = {
  admin: dashboardPermissions,
  editor: [
    "dashboard.view",
    "articles.manage",
    "books.manage",
    "visuals.manage",
    "gallery.manage",
    "sections.manage",
  ],
  author: ["dashboard.view", "articles.manage"],
  reviewer: ["dashboard.view", "reports.view"],
};

const permissionSchema = z.enum(dashboardPermissions);

export function normalizePermissions(
  permissions: readonly DashboardPermission[],
): DashboardPermission[] {
  return [...new Set(permissions)].filter((permission) =>
    dashboardPermissions.includes(permission),
  );
}

export const supervisorSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  name: z.string(),
  email: z.email(),
  role: z.enum(supervisorRoles),
  is_active: z.boolean(),
  dashboard_permissions: z.array(permissionSchema),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const supervisorPageSchema = z.object({
  current_page: z.number().int().positive(),
  data: z.array(supervisorSchema),
  last_page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  from: z.number().int().nullable().optional(),
  to: z.number().int().nullable().optional(),
});

export const supervisorMutationResponseSchema = z.object({
  user: supervisorSchema,
});
export const supervisorDeleteResponseSchema = z.object({ message: z.string() });
export const supervisorMessageResponseSchema = z.object({
  message: z.string(),
});

const sharedFormShape = {
  name: z.string().trim().min(2).max(255),
  email: z.email(),
  role: z.enum(supervisorRoles),
  is_active: z.boolean(),
  dashboard_permissions: z
    .array(permissionSchema)
    .refine(
      (items) => new Set(items).size === items.length,
      "لا يمكن تكرار الصلاحية.",
    ),
};

export const createSupervisorSchema = z
  .strictObject({
    ...sharedFormShape,
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "تأكيد كلمة المرور غير مطابق.",
  });

export const editSupervisorSchema = z.strictObject(sharedFormShape);

export const passwordChangeSchema = z
  .strictObject({
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "تأكيد كلمة المرور غير مطابق.",
  });

export const supervisorQuerySchema = z.strictObject({
  search: z.string().trim().max(255).optional(),
  role: z.enum(supervisorRoles).optional(),
  is_active: z.enum(["true", "false"]).optional(),
  permission: permissionSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
});

export function normalizeSupervisorQuery(
  input: Record<string, string | undefined>,
): SupervisorQuery {
  const candidate = Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
  const parsed = supervisorQuerySchema.safeParse(candidate);
  return parsed.success ? parsed.data : { page: 1 };
}

export const roleCatalogSchema = z.array(z.enum(supervisorRoles));
export const permissionCatalogSchema = z.array(
  z.object({ key: permissionSchema, label: z.string() }),
);

export type Supervisor = z.infer<typeof supervisorSchema>;
export type SupervisorPage = z.infer<typeof supervisorPageSchema>;
export type SupervisorQuery = z.infer<typeof supervisorQuerySchema>;
export type CreateSupervisorValues = z.infer<typeof createSupervisorSchema>;
export type EditSupervisorValues = z.infer<typeof editSupervisorSchema>;

export function formatSupervisorDate(value?: string | null): string {
  if (!value) return "غير متاح";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "غير متاح"
    : new Intl.DateTimeFormat(ARABIC_DISPLAY_LOCALE, {
        dateStyle: "medium",
        timeZone: "Africa/Cairo",
      }).format(date);
}

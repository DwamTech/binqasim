"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import type { DashboardPermission } from "@/features/auth/domain/auth.contracts";
import { ErrorState } from "@/shared/components/ui/feedback";
import { FormField, PasswordInput, Select } from "@/shared/components/ui/forms";
import { Dialog } from "@/shared/components/ui/overlays";
import { Button, Input, Skeleton } from "@/shared/components/ui/primitives";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  createSupervisorSchema,
  editSupervisorSchema,
  normalizePermissions,
  roleLabels,
  rolePermissionPresets,
  supervisorRoles,
  type SupervisorRole,
} from "../supervisors.contracts";
import {
  createSupervisor,
  getSupervisor,
  SupervisorsClientError,
  updateSupervisor,
} from "../supervisors.client";
import { PermissionChecklist } from "./permission-checklist";
import styles from "./supervisors.module.css";

type Values = {
  name: string;
  email: string;
  role: SupervisorRole;
  is_active: boolean;
  dashboard_permissions: DashboardPermission[];
  password: string;
  password_confirmation: string;
};

const initialValues: Values = {
  name: "",
  email: "",
  role: "editor",
  is_active: true,
  dashboard_permissions: [],
  password: "",
  password_confirmation: "",
};

export function SupervisorForm({
  mode,
  supervisorId,
}: {
  mode: "create" | "edit";
  supervisorId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initialValues);
  const [loading, setLoading] = useState(mode === "edit");
  const [reloadKey, setReloadKey] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !supervisorId) return;
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const supervisor = await getSupervisor(
          supervisorId ?? "",
          controller.signal,
        );
        if (!active) return;
        setValues({
          name: supervisor.name,
          email: supervisor.email,
          role: supervisor.role,
          is_active: supervisor.is_active,
          dashboard_permissions: supervisor.dashboard_permissions,
          password: "",
          password_confirmation: "",
        });
      } catch (reason) {
        if (active)
          setLoadError(
            reason instanceof Error ? reason.message : "تعذر تحميل المشرف.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [mode, reloadKey, supervisorId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      let result;
      if (mode === "create") {
        const parsed = createSupervisorSchema.safeParse(values);
        if (!parsed.success) {
          setFieldErrors(parsed.error.flatten().fieldErrors);
          setError("راجع الحقول الموضحة قبل الحفظ.");
          return;
        }
        result = await createSupervisor(parsed.data);
      } else {
        const parsed = editSupervisorSchema.safeParse({
          name: values.name,
          email: values.email,
          role: values.role,
          is_active: values.is_active,
          dashboard_permissions: normalizePermissions(
            values.dashboard_permissions,
          ),
        });
        if (!parsed.success) {
          setFieldErrors(parsed.error.flatten().fieldErrors);
          setError("راجع الحقول الموضحة قبل الحفظ.");
          return;
        }
        result = await updateSupervisor(supervisorId ?? "", parsed.data);
      }
      router.push(`/dashboard/supervisors/${result.user.id}?saved=1`);
      router.refresh();
    } catch (reason) {
      if (reason instanceof SupervisorsClientError)
        setFieldErrors(reason.fieldErrors ?? {});
      setError(reason instanceof Error ? reason.message : "تعذر الحفظ.");
    } finally {
      setSubmitting(false);
    }
  };

  const applyPreset = () => {
    setValues((current) => ({
      ...current,
      dashboard_permissions: [...rolePermissionPresets[current.role]],
    }));
    setPresetOpen(false);
  };

  if (loading)
    return (
      <Skeleton className={styles.formSkeleton ?? ""} aria-label="تحميل" />
    );
  if (loadError)
    return (
      <ErrorState
        title="تعذر تحميل بيانات المشرف"
        description={loadError}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    );

  return (
    <form className={styles.formLayout} onSubmit={submit} noValidate>
      {error && (
        <p className={styles.errorNotice} role="alert">
          {error}
        </p>
      )}
      <section className={styles.formCard}>
        <header>
          <span className={styles.cardIcon} aria-hidden="true">
            ◇
          </span>
          <div>
            <h2>بيانات الحساب والدور</h2>
            <p>الدور يحدد طبيعة المشرف، والصلاحيات تحدد الصفحات المتاحة.</p>
          </div>
        </header>
        <div className={styles.formGrid}>
          <FormField
            label="الاسم"
            error={Boolean(fieldErrors.name?.[0])}
            message={fieldErrors.name?.[0]}
          >
            <Input
              value={values.name}
              autoComplete="name"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </FormField>
          <FormField
            label="البريد الإلكتروني"
            error={Boolean(fieldErrors.email?.[0])}
            message={fieldErrors.email?.[0]}
          >
            <Input
              type="email"
              dir="ltr"
              value={values.email}
              autoComplete="email"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="الدور">
            <Select
              value={values.role}
              options={supervisorRoles.map((role) => ({
                value: role,
                label: roleLabels[role],
              }))}
              onValueChange={(value) =>
                setValues((current) => ({
                  ...current,
                  role: value as SupervisorRole,
                }))
              }
            />
          </FormField>
          <label className={styles.activeField}>
            <input
              type="checkbox"
              checked={values.is_active}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
            />
            <span>
              <strong>الحساب نشط</strong>
              <small>الحساب المعطل لا يستطيع دخول الداشبورد.</small>
            </span>
          </label>
          {mode === "create" && (
            <>
              <FormField
                label="كلمة المرور"
                error={Boolean(fieldErrors.password?.[0])}
                message={fieldErrors.password?.[0]}
              >
                <PasswordInput
                  value={values.password}
                  autoComplete="new-password"
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField
                label="تأكيد كلمة المرور"
                error={Boolean(fieldErrors.password_confirmation?.[0])}
                message={fieldErrors.password_confirmation?.[0]}
              >
                <PasswordInput
                  value={values.password_confirmation}
                  autoComplete="new-password"
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      password_confirmation: event.target.value,
                    }))
                  }
                />
              </FormField>
            </>
          )}
        </div>
        {values.role === "admin" && (
          <p className={styles.adminNotice}>
            مدير النظام يمتلك وصولًا كاملًا حاليًا، واختيار الصلاحيات لا يقيّد
            وصوله.
          </p>
        )}
      </section>

      <section className={styles.formCard}>
        <header className={styles.permissionHeader}>
          <div>
            <h2>صلاحيات الصفحات</h2>
            <p>تظل قواعد العمليات والملكية داخل كل موديول هي المرجع النهائي.</p>
          </div>
          <Button
            variant="secondary"
            type="button"
            onClick={() => setPresetOpen(true)}
          >
            تطبيق مقترح {roleLabels[values.role]}
          </Button>
        </header>
        <PermissionChecklist
          value={values.dashboard_permissions}
          onChange={(dashboard_permissions) =>
            setValues((current) => ({
              ...current,
              dashboard_permissions,
            }))
          }
        />
      </section>

      <aside className={styles.accessSummary}>
        <div>
          <span>ملخص ما قبل الحفظ</span>
          <h2>{roleLabels[values.role]}</h2>
          <p>
            {formatArabicNumber(values.dashboard_permissions.length)} صلاحية
            محددة. الوصول داخل الموديولات يخضع لعقودها الداخلية.
          </p>
        </div>
        <ul>
          {values.dashboard_permissions.slice(0, 5).map((permission) => (
            <li key={permission}>{permission}</li>
          ))}
          {values.dashboard_permissions.length > 5 && (
            <li>+{formatArabicNumber(values.dashboard_permissions.length - 5)} أخرى</li>
          )}
        </ul>
      </aside>

      <footer className={styles.formActions}>
        <Link href="/dashboard/supervisors">إلغاء</Link>
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "إنشاء المشرف" : "حفظ التغييرات"}
        </Button>
      </footer>

      <Dialog
        open={presetOpen}
        onOpenChange={setPresetOpen}
        title="تطبيق الصلاحيات المقترحة"
        footer={
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setPresetOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={applyPreset}>تطبيق المقترح</Button>
          </div>
        }
      >
        <p>
          هذا اقتراح لتسهيل الإعداد وليس قاعدة أمنية. سيستبدل الاختيارات الحالية
          فقط بعد ضغط زر التطبيق.
        </p>
      </Dialog>
    </form>
  );
}

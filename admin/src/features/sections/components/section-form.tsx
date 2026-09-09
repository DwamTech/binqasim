"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import {
  EmptyState,
  ErrorState,
  FormField,
  HeroSection,
  Input,
  PageSkeleton,
  Select,
} from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";

import {
  managedSectionModules,
  sectionFormSchema,
  sectionModuleLabels,
  type SectionFormValues,
} from "../sections.contracts";
import {
  createSection,
  getSection,
  SectionsClientError,
  updateSection,
} from "../sections.client";
import styles from "./sections.module.css";

type FieldErrors = Partial<Record<keyof SectionFormValues, string>>;

function validate(values: SectionFormValues): FieldErrors {
  const result = sectionFormSchema.safeParse(values);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof SectionFormValues;
    if (field === "name") errors.name = "اسم القسم مطلوب وبحد أقصى ٢٥٥ حرفًا.";
    if (field === "module") errors.module = "اختر موديولًا معتمدًا.";
  }
  return errors;
}

export function SectionForm({
  mode,
  sectionId,
}: {
  mode: "create" | "edit";
  sectionId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<SectionFormValues>({
    name: "",
    module: "articles",
    description: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (mode !== "edit" || !sectionId) return;
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const section = await getSection(sectionId ?? "", controller.signal);
        if (!active) return;
        if (
          section.module !== "articles" &&
          section.module !== "books" &&
          section.module !== "visuals"
        ) {
          setLoadError("هذا القسم تابع لموديول غير مُدار من هذه الواجهة.");
          return;
        }
        setValues({
          name: section.name,
          module: section.module,
          description: section.description ?? "",
          is_active: section.is_active,
        });
      } catch (reason) {
        if (active)
          setLoadError(
            reason instanceof Error ? reason.message : "تعذر تحميل القسم.",
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
  }, [mode, reloadKey, sectionId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const errors = validate(values);
    setFieldErrors(errors);
    setGeneralError(null);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const result =
        mode === "create"
          ? await createSection(values)
          : await updateSection(sectionId ?? "", values);
      router.replace(
        `/dashboard/sections/${result.section.id}?notice=${
          mode === "create" ? "created" : "updated"
        }`,
      );
      router.refresh();
    } catch (reason) {
      if (reason instanceof SectionsClientError) {
        const backendErrors: FieldErrors = {};
        if (reason.fieldErrors?.name?.[0])
          backendErrors.name = "يوجد قسم بالاسم نفسه داخل هذا الموديول.";
        if (reason.fieldErrors?.module?.[0])
          backendErrors.module = "قيمة الموديول غير معتمدة.";
        setFieldErrors(backendErrors);
        setGeneralError(reason.message);
      } else {
        setGeneralError("تعذر حفظ القسم.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  if (loadError)
    return (
      <PageContainer>
        {loadError.includes("غير مُدار") ? (
          <EmptyState title="القسم خارج نطاق الواجهة" description={loadError} />
        ) : (
          <ErrorState
            title="تعذر تحميل القسم"
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        )}
      </PageContainer>
    );

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.sections.navigation}
          title={
            mode === "create"
              ? dashboardCopy.modules.sections.pages.create
              : dashboardCopy.modules.sections.pages.edit
          }
          description="اربط القسم بالموديول الصحيح ليظهر فقط في حقول اختيار المحتوى التابعة له."
        />
      }
    >
      <form className={styles.formCard} onSubmit={submit} noValidate>
        {generalError && (
          <div className={styles.errorNotice} role="alert">
            {generalError}
          </div>
        )}
        <div className={styles.formGrid}>
          <FormField
            label="اسم القسم"
            message={fieldErrors.name}
            error={Boolean(fieldErrors.name)}
          >
            <Input
              name="name"
              value={values.name}
              maxLength={255}
              autoFocus
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </FormField>
          <FormField
            label="الموديول"
            description={
              mode === "edit"
                ? "يسمح Backend بتغيير الموديول؛ تأكد أن المحتوى الحالي مناسب قبل الحفظ."
                : "سيظهر القسم فقط داخل اختيارات هذا الموديول."
            }
            message={fieldErrors.module}
            error={Boolean(fieldErrors.module)}
          >
            <Select
              name="module"
              value={values.module}
              options={managedSectionModules.map((module) => ({
                value: module,
                label: sectionModuleLabels[module],
              }))}
              onValueChange={(value) =>
                setValues((current) => ({
                  ...current,
                  module: value as SectionFormValues["module"],
                }))
              }
            />
          </FormField>
          <FormField
            label="الوصف"
            description="اختياري؛ استخدم وصفًا مختصرًا يوضح وظيفة القسم."
          >
            <textarea
              className="ui-input"
              name="description"
              rows={5}
              value={values.description ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </FormField>
          <label className={styles.switchField}>
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
              <strong>القسم نشط</strong>
              <small>
                الأقسام غير النشطة لا تظهر في اختيارات المحتوى العامة.
              </small>
            </span>
          </label>
        </div>
        <div className={styles.formActions}>
          <Link
            className="ui-button ui-button--secondary"
            href={
              mode === "edit" && sectionId
                ? `/dashboard/sections/${sectionId}`
                : "/dashboard/sections"
            }
          >
            إلغاء
          </Link>
          <button
            className="ui-button ui-button--primary"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "جارٍ الحفظ…"
              : mode === "create"
                ? "إنشاء القسم"
                : "حفظ التعديلات"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}

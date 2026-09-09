"use client";

import { Alert, FormField, Input, Select } from "@/shared/components/ui";

import type { PageSeoData } from "../domain/pages.contracts";
import {
  pageSeoShape,
  type EditableSeoKey,
  type PageSeoEditorValues,
} from "../domain/page-seo";
import styles from "./pages.module.css";

export function PageSeoEditor({
  seo,
  values,
  disabled,
  canonicalError,
  onChange,
}: {
  seo: PageSeoData;
  values: PageSeoEditorValues;
  disabled: boolean;
  canonicalError?: string | undefined;
  onChange: (key: EditableSeoKey, value: string) => void;
}) {
  const shape = pageSeoShape(seo);
  if (shape === "legacy-list") {
    return (
      <section className={styles.seoCard}>
        <div className={styles.panelHeading}>
          <div>
            <h2>تحسين الظهور في محركات البحث</h2>
            <p>بيانات المراجعة الحالية محفوظة للقراءة فقط.</p>
          </div>
        </div>
        <Alert title="بيانات قديمة محفوظة">
          تحتوي هذه الصفحة على بيانات SEO بصيغة قديمة. ستظل محفوظة كما هي، ولن
          يعيد المحرر كتابتها بصورة غير آمنة.
        </Alert>
      </section>
    );
  }

  const legacy = Array.isArray(seo) ? null : seo;
  const invalidKnown = (
    key: "title" | "description" | "canonical" | "robots" | "index",
  ) =>
    legacy &&
    key in legacy &&
    (key === "index"
      ? typeof legacy[key] !== "boolean"
      : typeof legacy[key] !== "string");
  const preservedMessage = "القيمة القديمة محفوظة حتى تعدّل هذا الحقل صراحةً.";

  return (
    <section className={styles.seoCard}>
      <div className={styles.panelHeading}>
        <div>
          <h2>تحسين الظهور في محركات البحث</h2>
          <p>هذه البيانات تخص المسودة، ولا تصبح عامة إلا بعد الحفظ والنشر.</p>
        </div>
      </div>
      <fieldset className={styles.fields} disabled={disabled}>
        <legend className="sr-only">بيانات تحسين الظهور في محركات البحث</legend>
        <div className={styles.formGrid}>
          <FormField
            label="عنوان نتائج البحث"
            message={invalidKnown("title") ? preservedMessage : undefined}
          >
            <Input
              value={values.title}
              maxLength={255}
              onChange={(event) => onChange("title", event.target.value)}
            />
          </FormField>
          <FormField
            label="وصف نتائج البحث"
            message={invalidKnown("description") ? preservedMessage : undefined}
          >
            <textarea
              className="ui-input ui-focus"
              rows={4}
              maxLength={500}
              value={values.description}
              onChange={(event) => onChange("description", event.target.value)}
            />
          </FormField>
        </div>
        <details className={styles.seoAdvanced}>
          <summary>إعدادات SEO المتقدمة</summary>
          <div className={styles.advancedBody}>
            <FormField
              label="الرابط الأساسي (Canonical)"
              message={
                canonicalError ??
                (invalidKnown("canonical") ? preservedMessage : undefined)
              }
              error={Boolean(canonicalError)}
            >
              <Input
                dir="ltr"
                type="url"
                value={values.canonical}
                placeholder="https://example.com/pages/about"
                onChange={(event) => onChange("canonical", event.target.value)}
              />
            </FormField>
            <div className={styles.fieldGrid}>
              <FormField
                label="السماح بالفهرسة"
                message={invalidKnown("index") ? preservedMessage : undefined}
              >
                <Select
                  value={values.index}
                  aria-label="السماح بالفهرسة"
                  options={[
                    {
                      value: "default",
                      label: "استخدام السلوك الافتراضي",
                    },
                    { value: "allow", label: "السماح بالفهرسة" },
                    { value: "block", label: "منع الفهرسة" },
                  ]}
                  onValueChange={(value) => onChange("index", value)}
                />
              </FormField>
              <FormField
                label="تعليمات Robots"
                message={invalidKnown("robots") ? preservedMessage : undefined}
              >
                <Input
                  dir="ltr"
                  value={values.robots}
                  placeholder="noindex, nofollow"
                  onChange={(event) => onChange("robots", event.target.value)}
                />
              </FormField>
            </div>
            {values.index !== "default" && values.robots.trim() && (
              <Alert>
                تم تحديد خيار الفهرسة وتعليمات Robots معًا. سيطبّق العرض العام
                قواعد الربط المعتمدة بين القيمتين.
              </Alert>
            )}
            <p className={styles.helper}>
              صورة المشاركة الاجتماعية غير متاحة في هذه المرحلة.
            </p>
          </div>
        </details>
      </fieldset>
    </section>
  );
}

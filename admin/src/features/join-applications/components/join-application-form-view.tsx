"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/shared/components/ui";
import {
  getJoinApplication,
  saveJoinApplication,
} from "../join-applications.client";
import { joinApplicationFields } from "../join-application-fields";
import type {
  JoinApplication,
  JoinApplicationType,
} from "../join-applications.contracts";
import styles from "./join-applications.module.css";

export function JoinApplicationFormView({
  type,
  id,
}: {
  type: JoinApplicationType;
  id?: string;
}) {
  const router = useRouter();
  const [item, setItem] = useState<JoinApplication>();
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    getJoinApplication(type, id)
      .then((result) => {
        setItem(result);
        setFieldValues(
          Object.fromEntries(
            joinApplicationFields[type].map((field) => [
              field.name,
              normalizeFieldValue(result[field.name], field.type),
            ]),
          ),
        );
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "تعذر تحميل الطلب.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id, type]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const body = new FormData(event.currentTarget);
    body.set("accepted_terms", "1");
    if (id) {
      for (const [key, value] of [...body.entries()]) {
        if (typeof value === "string" && value.trim() === "") {
          body.delete(key);
        }
      }
    }
    if (id && body.get("password") === "") {
      body.delete("password");
      body.delete("password_confirmation");
    }
    for (const [key, value] of [...body.entries()]) {
      if (value instanceof File && value.size === 0) body.delete(key);
    }
    try {
      const saved = await saveJoinApplication(type, body, id);
      router.push(`/dashboard/applications/${type}/${saved.id}`);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ الطلب.");
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className={`${styles.state} ui-state`}>جاري تحميل النموذج...</div>
    );

  return (
    <form
      className={`${styles.formCard} ui-card`}
      onSubmit={submit}
      onChange={(event) => {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLSelectElement ||
          target instanceof HTMLTextAreaElement
        ) {
          setFieldValues((current) => ({
            ...current,
            [target.name]: target.value,
          }));
        }
      }}
    >
      {error && (
        <div
          className={`${styles.error} ui-alert ui-alert--error`}
          role="alert"
        >
          {error}
        </div>
      )}
      <div className={styles.formGrid}>
        {joinApplicationFields[type]
          .filter(
            (field) =>
              !field.showWhen ||
              fieldValues[field.showWhen.field] === field.showWhen.value,
          )
          .map((field) => {
            const rawValue = item?.[field.name];
            const defaultValue =
              typeof rawValue === "string" || typeof rawValue === "number"
                ? String(rawValue).slice(
                    0,
                    field.type === "date" ? 10 : undefined,
                  )
                : typeof rawValue === "boolean"
                  ? rawValue
                    ? "1"
                    : "0"
                  : "";
            return (
              <label
                key={field.name}
                className={
                  field.type === "textarea" ? styles.wideField : undefined
                }
              >
                <span>
                  {field.label}
                  {field.required && !id ? " *" : ""}
                </span>
                {field.type === "select" ? (
                  <Select
                    name={field.name}
                    value={fieldValues[field.name] ?? defaultValue}
                    placeholder="اختر"
                    aria-label={field.label}
                    options={
                      field.options?.map((option) => ({ ...option })) ?? []
                    }
                    onValueChange={(value) =>
                      setFieldValues((current) => ({
                        ...current,
                        [field.name]: value,
                      }))
                    }
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    className="ui-input ui-focus"
                    name={field.name}
                    defaultValue={defaultValue}
                    required={field.required && !id}
                    rows={5}
                  />
                ) : (
                  <input
                    className="ui-input ui-focus"
                    name={field.name}
                    type={field.type ?? "text"}
                    defaultValue={
                      field.type === "file" ? undefined : defaultValue
                    }
                    required={field.required && !id}
                    accept={field.accept}
                    pattern={field.pattern}
                    min={field.min}
                    max={field.max}
                  />
                )}
                {field.help ? (
                  <small className={styles.fieldHint}>{field.help}</small>
                ) : null}
              </label>
            );
          })}
      </div>
      {id && item?.attachments.length ? (
        <p className={styles.hint}>
          اترك حقل الملف فارغًا للاحتفاظ بالمرفق الحالي، أو اختر ملفًا
          لاستبداله.
        </p>
      ) : null}
      <div className={styles.formActions}>
        <button
          className="ui-button ui-button--primary ui-focus"
          type="submit"
          disabled={saving}
        >
          {saving ? "جاري الحفظ..." : id ? "حفظ التعديلات" : "إنشاء الطلب"}
        </button>
        <button
          className="ui-button ui-button--secondary ui-focus"
          type="button"
          onClick={() => router.back()}
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

function normalizeFieldValue(value: unknown, type?: string): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "1" : "0";
  const normalized = String(value);
  return type === "date" ? normalized.slice(0, 10) : normalized;
}

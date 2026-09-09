"use client";

import { useEffect, useState } from "react";

import { Button, Skeleton } from "@/shared/components/ui/primitives";
import { ErrorState } from "@/shared/components/ui/feedback";
import { FormField, Select } from "@/shared/components/ui/forms";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  systemContentKeys,
  systemContentLabels,
  systemContentUpdateSchema,
  type SystemContentKey,
} from "../settings.contracts";
import {
  getSystemContent,
  SettingsClientError,
  updateSystemContent,
} from "../settings.client";
import styles from "./settings.module.css";

export function SystemContentSettings() {
  const [key, setKey] = useState<SystemContentKey>("about_waqf");
  const [content, setContent] = useState("");
  const [exists, setExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError("");
      setNotice("");
      try {
        const result = await getSystemContent(key, controller.signal);
        if (!active) return;
        setContent(result.content);
        setExists(result.exists !== false);
      } catch (reason) {
        if (active)
          setLoadError(
            reason instanceof Error ? reason.message : "تعذر التحميل.",
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
  }, [key, reloadKey]);

  const save = async () => {
    const parsed = systemContentUpdateSchema.safeParse({ content });
    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.content?.[0] ?? "المحتوى مطلوب.",
      );
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await updateSystemContent(key, parsed.data.content);
      setExists(true);
      setNotice("تم حفظ المحتوى المعتمد.");
    } catch (reason) {
      setError(
        reason instanceof SettingsClientError
          ? reason.message
          : "تعذر حفظ المحتوى.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.sectionStack}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.adminKicker}>مفاتيح مقيدة</span>
          <h2>محتوى النظام العام</h2>
          <p>يتم تحرير النص الخام بأمان، دون عرضه كـHTML داخل لوحة التحكم.</p>
        </div>
        <div className={styles.keySelector}>
          <span>المحتوى</span>
          <Select
            value={key}
            disabled={saving}
            aria-label="اختيار محتوى النظام"
            options={systemContentKeys.map((item) => ({
              value: item,
              label: systemContentLabels[item],
            }))}
            onValueChange={(value) => setKey(value as SystemContentKey)}
          />
        </div>
      </div>
      {notice && <p className={styles.successNotice}>{notice}</p>}
      {error && (
        <p className={styles.errorNotice} role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <Skeleton
          className={styles.editorSkeleton ?? ""}
          aria-label="جار التحميل"
        />
      ) : loadError ? (
        <ErrorState
          title="تعذر تحميل المحتوى"
          description={loadError}
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      ) : (
        <article className={styles.editorCard}>
          {!exists && (
            <p className={styles.emptyNotice}>
              لا يوجد محتوى محفوظ لهذا المفتاح بعد. سيؤدي الحفظ إلى إنشائه.
            </p>
          )}
          <FormField
            label={systemContentLabels[key]}
            description="يمكن إدخال نص أو HTML موثوق؛ لن يتم تفسيره أو تشغيله داخل لوحة التحكم."
          >
            <textarea
              className="ui-input ui-focus"
              value={content}
              dir="rtl"
              onChange={(event) => setContent(event.target.value)}
            />
          </FormField>
          <footer>
            <span>{formatArabicNumber(content.length)} حرف</span>
            <Button loading={saving} onClick={() => void save()}>
              حفظ المحتوى
            </Button>
          </footer>
        </article>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Select } from "@/shared/components/ui";
import {
  getJoinApplication,
  setJoinApplicationStatus,
} from "../join-applications.client";
import { joinApplicationFields } from "../join-application-fields";
import {
  formatJoinApplicationDate,
  joinApplicationStatuses,
  joinApplicationStatusLabels,
  type JoinApplication,
  type JoinApplicationStatus,
  type JoinApplicationType,
} from "../join-applications.contracts";
import styles from "./join-applications.module.css";

export function JoinApplicationDetailView({
  type,
  id,
}: {
  type: JoinApplicationType;
  id: string;
}) {
  const [item, setItem] = useState<JoinApplication>();
  const [status, setStatus] = useState<JoinApplicationStatus>("new");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getJoinApplication(type, id)
      .then((result) => {
        setItem(result);
        setStatus(result.status);
        setNote(result.admin_note ?? "");
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "تعذر تحميل الطلب.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id, type]);

  async function saveStatus() {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await setJoinApplicationStatus(
        type,
        item.id,
        status,
        note,
      );
      setItem(updated);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تحديث الحالة.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className={`${styles.state} ui-state`}>جاري تحميل التفاصيل...</div>
    );
  if (!item)
    return (
      <div className={`${styles.error} ui-alert ui-alert--error`}>
        {error || "الطلب غير موجود."}
      </div>
    );

  const personalPhoto = item.attachments.find(
    (attachment) => attachment.type === "personal_photo" && attachment.url,
  );
  const supportingAttachments = item.attachments.filter(
    (attachment) => attachment.type !== "personal_photo",
  );

  return (
    <div className={styles.detailGrid}>
      <section className={`${styles.detailCard} ui-card`}>
        <div className={styles.detailHeading}>
          <div>
            <span className={styles.eyebrow}>رقم الطلب</span>
            <h2 dir="ltr">{item.request_number}</h2>
          </div>
          <Link
            className="ui-button ui-button--secondary ui-focus"
            href={`/dashboard/applications/${type}/${id}/edit`}
          >
            تعديل البيانات
          </Link>
        </div>
        {personalPhoto?.url && (
          <figure className={styles.personalPhoto}>
            <a
              href={personalPhoto.url}
              target="_blank"
              rel="noreferrer"
              aria-label="فتح الصورة الشخصية بالحجم الكامل"
            >
              {/* The backend file origin is deployment-specific. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={personalPhoto.url}
                alt={`الصورة الشخصية للمتقدم ${item.full_name}`}
                width={160}
                height={160}
              />
            </a>
            <figcaption>الصورة الشخصية</figcaption>
          </figure>
        )}
        <dl className={styles.dataGrid}>
          {joinApplicationFields[type]
            .filter((field) => field.type !== "file" && !field.sensitive)
            .map((field) => (
              <div key={field.name}>
                <dt>{field.label}</dt>
                <dd>
                  {displayValue(item[field.name], field.options, field.type)}
                </dd>
              </div>
            ))}
          <div>
            <dt>تاريخ التقديم</dt>
            <dd>{formatJoinApplicationDate(item.created_at)}</dd>
          </div>
          <div>
            <dt>آخر تحديث</dt>
            <dd>{formatJoinApplicationDate(item.updated_at)}</dd>
          </div>
        </dl>
        {supportingAttachments.length > 0 && (
          <div className={styles.attachments}>
            <h3>المرفقات</h3>
            {supportingAttachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
              >
                {attachment.original_name || attachment.type}
              </a>
            ))}
          </div>
        )}
      </section>

      <aside className={`${styles.statusCard} ui-card`}>
        <span className={styles.eyebrow}>إجراء إداري</span>
        <h2>حالة الطلب</h2>
        <label>
          <span>الحالة</span>
          <Select
            value={status}
            aria-label="الحالة"
            options={joinApplicationStatuses.map((value) => ({
              value,
              label: joinApplicationStatusLabels[value],
            }))}
            onValueChange={(value) => setStatus(value as JoinApplicationStatus)}
          />
        </label>
        <label>
          <span>ملاحظة إدارية</span>
          <textarea
            className="ui-input ui-focus"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={6}
          />
        </label>
        <button
          className="ui-button ui-button--primary ui-focus"
          type="button"
          onClick={() => void saveStatus()}
          disabled={saving}
        >
          {saving ? "جاري الحفظ..." : "حفظ الحالة"}
        </button>
        {item.reviewer && (
          <small>
            آخر مراجعة: {item.reviewer.name} —{" "}
            {formatJoinApplicationDate(item.reviewed_at)}
          </small>
        )}
      </aside>
    </div>
  );
}

function displayValue(
  value: unknown,
  options?: readonly { value: string; label: string }[],
  type?: string,
): string {
  if (value === null || value === undefined || value === "") return "—";
  const normalized =
    typeof value === "boolean" ? (value ? "1" : "0") : String(value);
  if (type === "date") return normalized.slice(0, 10);
  return (
    options?.find((option) => option.value === normalized)?.label ?? normalized
  );
}

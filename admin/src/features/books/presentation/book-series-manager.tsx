"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import {
  Alert,
  Button,
  Card,
  Dialog,
  EmptyState,
} from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import {
  createBookSeries,
  deleteBookSeries,
  updateBookSeries,
} from "../application/books.client";
import type { BookSeries } from "../domain/books.contracts";
import styles from "./books.module.css";

export function BookSeriesManager({ initial }: { initial: BookSeries[] }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<BookSeries | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookSeries | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function beginEdit(item: BookSeries) {
    setEditing(item);
    setName(item.name);
    setDescription(item.description ?? "");
    setError(null);
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setDescription("");
    setError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !name.trim()) return;
    setPending(true);
    setError(null);
    try {
      const result = editing
        ? await updateBookSeries(String(editing.id), {
            name: name.trim(),
            description: description.trim(),
          })
        : await createBookSeries({
            name: name.trim(),
            description: description.trim(),
          });
      setItems((current) =>
        editing
          ? current.map((item) => (item.id === editing.id ? result.data : item))
          : [result.data, ...current],
      );
      resetForm();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ السلسلة.");
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || pending) return;
    setPending(true);
    setError(null);
    try {
      await deleteBookSeries(String(deleteTarget.id));
      setItems((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف السلسلة.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.seriesLayout} dir="rtl">
      <Card className={styles.seriesForm ?? ""}>
        <div className={styles.cardTitle}>
          <span>{editing ? "٠٢" : "٠١"}</span>
          <div>
            <h2>{editing ? "تعديل السلسلة" : "إضافة سلسلة"}</h2>
            <p>أنشئ مجموعات مترابطة للكتب متعددة الأجزاء.</p>
          </div>
        </div>
        {error && (
          <Alert variant="error" title="تعذر تنفيذ العملية">
            {error}
          </Alert>
        )}
        <form onSubmit={(event) => void submit(event)}>
          <label>
            <span>اسم السلسلة *</span>
            <input
              className="ui-input"
              value={name}
              maxLength={255}
              onChange={(event) => setName(event.target.value)}
            />
            <small>الحد الآمن ٢٥٥ حرفًا.</small>
          </label>
          <label>
            <span>الوصف</span>
            <textarea
              className="ui-textarea"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <div className={styles.actions}>
            <Button
              type="submit"
              loading={pending}
              disabled={pending || !name.trim()}
            >
              {editing ? "حفظ التعديل" : "إضافة السلسلة"}
            </Button>
            {editing && (
              <Button
                variant="secondary"
                disabled={pending}
                onClick={resetForm}
              >
                إلغاء التعديل
              </Button>
            )}
          </div>
        </form>
      </Card>

      <section className={styles.seriesList}>
        <div className={styles.tableHeading}>
          <div>
            <h2>السلاسل الحالية</h2>
            <p>يمكن تعديل البيانات أو فتح تفاصيل كل سلسلة.</p>
          </div>
          <span>{formatArabicNumber(items.length)} سلسلة</span>
        </div>
        {items.length === 0 ? (
          <EmptyState
            title="لا توجد سلاسل بعد"
            description="أضف أول سلسلة من النموذج المجاور."
          />
        ) : (
          <div className={styles.seriesCards}>
            {items.map((item) => (
              <article key={item.id}>
                <span className={styles.seriesMark}>
                  {item.name.slice(0, 1)}
                </span>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.description || "لا يوجد وصف لهذه السلسلة."}</p>
                </div>
                <div className={styles.actions}>
                  <Link
                    href={`/dashboard/books?series_id=${item.id}`}
                    className="ui-button ui-button--secondary ui-focus"
                  >
                    عرض الكتب
                  </Link>
                  <Button variant="secondary" onClick={() => beginEdit(item)}>
                    تعديل
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setError(null);
                      setDeleteTarget(item);
                    }}
                  >
                    حذف
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !pending && setDeleteTarget(null)}
        title="حذف السلسلة والكتب المرتبطة"
        dismissible={!pending}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => setDeleteTarget(null)}
            >
              تراجع
            </Button>
            <Button
              variant="danger"
              loading={pending}
              disabled={pending}
              onClick={() => void confirmDelete()}
            >
              حذف السلسلة
            </Button>
          </div>
        }
      >
        <div className={styles.dangerMessage}>
          <strong>{deleteTarget?.name}</strong>
          <p>
            تحذير: Backend الحالي يحذف الكتب المرتبطة بهذه السلسلة حذفًا
            متسلسلًا. لا تكمل إلا إذا كنت متأكدًا تمامًا.
          </p>
          {error && <p role="alert">{error}</p>}
        </div>
      </Dialog>
    </div>
  );
}

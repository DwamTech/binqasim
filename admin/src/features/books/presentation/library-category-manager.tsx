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
  BooksClientError,
  createLibraryCategory,
  deleteLibraryCategory,
  updateLibraryCategory,
} from "../application/books.client";
import type { LibraryCategory } from "../domain/books.contracts";
import { libraryAreas, type LibraryAreaSlug } from "../domain/library-areas";
import styles from "./books.module.css";

export function LibraryCategoryManager({
  area,
  initial,
}: {
  area: LibraryAreaSlug;
  initial: LibraryCategory[];
}) {
  const config = libraryAreas[area];
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<LibraryCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LibraryCategory | null>(
    null,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function beginEdit(item: LibraryCategory) {
    setEditing(item);
    setName(item.name);
    setDescription(item.description ?? "");
    setSortOrder(String(item.sort_order));
    setActive(item.is_active);
    setError(null);
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setDescription("");
    setSortOrder("0");
    setActive(true);
    setError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !name.trim()) return;
    setPending(true);
    setError(null);
    try {
      const values = {
        name: name.trim(),
        // The API generates the slug for new categories. Existing records keep
        // their public URL stable while the editor changes the visible name.
        ...(editing ? { slug: editing.slug } : {}),
        description: description.trim(),
        is_active: active,
        sort_order: Number(sortOrder) || 0,
      };
      const result = editing
        ? await updateLibraryCategory(area, editing.id, values)
        : await createLibraryCategory(area, values);
      setItems((current) =>
        editing
          ? current.map((item) => (item.id === editing.id ? result.data : item))
          : [...current, result.data],
      );
      resetForm();
    } catch (reason) {
      setError(
        reason instanceof BooksClientError && reason.fieldErrors?.name?.[0]
          ? reason.fieldErrors.name[0]
          : reason instanceof Error
            ? reason.message
            : "تعذر حفظ القسم.",
      );
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || pending) return;
    setPending(true);
    setError(null);
    try {
      await deleteLibraryCategory(area, deleteTarget.id);
      setItems((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setError(
        deleteTarget.books_count > 0
          ? "لا يمكن حذف قسم يحتوي على كتب. انقل الكتب أو عطّل القسم أولًا."
          : reason instanceof Error
            ? reason.message
            : "تعذر حذف القسم.",
      );
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
            <h2>{editing ? "تعديل القسم" : "إضافة قسم"}</h2>
            <p>القسم سيظهر تلقائيًا داخل قائمة {config.title} في الموقع.</p>
          </div>
        </div>
        {error && (
          <Alert variant="error" title="تعذر تنفيذ العملية">
            {error}
          </Alert>
        )}
        <form onSubmit={(event) => void submit(event)}>
          <label>
            <span>اسم القسم *</span>
            <input
              className="ui-input"
              value={name}
              maxLength={255}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            <span>الوصف</span>
            <textarea
              className="ui-textarea"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label>
            <span>ترتيب الظهور</span>
            <input
              className="ui-input"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </label>
          <label className={styles.checkField}>
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
            <span>القسم نشط وظاهر في الموقع العام</span>
          </label>
          <div className={styles.actions}>
            <Button
              type="submit"
              loading={pending}
              disabled={pending || !name.trim()}
            >
              {editing ? "حفظ التعديل" : "إضافة القسم"}
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
            <h2>أقسام {config.title}</h2>
            <p>الترتيب والحالة وعدد الكتب المرتبطة بكل قسم.</p>
          </div>
          <span>{formatArabicNumber(items.length)} قسم</span>
        </div>
        {items.length === 0 ? (
          <EmptyState
            title="لا توجد أقسام بعد"
            description="أضف أول قسم من النموذج المجاور."
          />
        ) : (
          <div className={styles.seriesCards}>
            {[...items]
              .sort(
                (left, right) =>
                  left.sort_order - right.sort_order ||
                  left.name.localeCompare(right.name, "ar"),
              )
              .map((item) => (
                <article key={item.id}>
                  <span className={styles.seriesMark}>
                    {formatArabicNumber(item.sort_order)}
                  </span>
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      {item.is_active ? "نشط" : "مخفي"} ·{" "}
                      {formatArabicNumber(item.books_count)} كتاب · {item.slug}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <Link
                      href={`${config.basePath}?section_id=${item.id}`}
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
        title="حذف القسم"
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
              حذف القسم
            </Button>
          </div>
        }
      >
        <div className={styles.dangerMessage}>
          <strong>{deleteTarget?.name}</strong>
          <p>
            لن يسمح النظام بالحذف إذا كان القسم يحتوي على كتب، حفاظًا على
            البيانات.
          </p>
          {error && <p role="alert">{error}</p>}
        </div>
      </Dialog>
    </div>
  );
}

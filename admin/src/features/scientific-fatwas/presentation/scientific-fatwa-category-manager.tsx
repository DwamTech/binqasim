"use client";

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
  ScientificFatwaClientError,
  createScientificFatwaCategory,
  deleteScientificFatwaCategory,
  updateScientificFatwaCategory,
} from "../application/scientific-fatwas.client";
import type { ScientificFatwaCategory } from "../domain/scientific-fatwas.contracts";
import styles from "./scientific-fatwas.module.css";

export function ScientificFatwaCategoryManager({
  initial,
}: {
  initial: ScientificFatwaCategory[];
}) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<ScientificFatwaCategory | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ScientificFatwaCategory | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function beginEdit(item: ScientificFatwaCategory) {
    setEditing(item);
    setName(item.name);
    setSortOrder(String(item.sort_order));
    setActive(item.is_active);
    setError(null);
  }

  function resetForm() {
    setEditing(null);
    setName("");
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
        is_active: active,
        sort_order: Math.max(0, Number(sortOrder) || 0),
      };
      const result = editing
        ? await updateScientificFatwaCategory(editing.id, values)
        : await createScientificFatwaCategory(values);
      setItems((current) =>
        editing
          ? current.map((item) => (item.id === editing.id ? result.data : item))
          : [...current, result.data],
      );
      resetForm();
    } catch (reason) {
      setError(
        reason instanceof ScientificFatwaClientError &&
          reason.fieldErrors?.name?.[0]
          ? reason.fieldErrors.name[0]
          : reason instanceof Error
            ? reason.message
            : "تعذر حفظ التصنيف العلمي.",
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
      await deleteScientificFatwaCategory(deleteTarget.id);
      setItems((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setError(
        reason instanceof ScientificFatwaClientError && reason.status === 409
          ? "لا يمكن حذف تصنيف مستخدم. انقل مواده إلى تصنيف آخر أو عطّله بدلًا من حذفه."
          : reason instanceof Error
            ? reason.message
            : "تعذر حذف التصنيف العلمي.",
      );
    } finally {
      setPending(false);
    }
  }

  const ordered = [...items].sort(
    (left, right) =>
      left.sort_order - right.sort_order ||
      left.name.localeCompare(right.name, "ar"),
  );

  return (
    <div className={styles.categoryLayout} dir="rtl">
      <Card className={styles.categoryForm ?? ""}>
        <div className={styles.sectionTitle}>
          <span>{editing ? "٠٢" : "٠١"}</span>
          <div>
            <h2>{editing ? "تعديل التصنيف" : "إضافة تصنيف علمي"}</h2>
            <p>
              القائمة نفسها تُستخدم في نموذج استقبال السؤال ونموذج إضافة
              المسألة.
            </p>
          </div>
        </div>
        {error && (
          <Alert variant="error" title="تعذر تنفيذ العملية">
            {error}
          </Alert>
        )}
        <form
          className={styles.categoryEditor}
          onSubmit={(event) => void submit(event)}
        >
          <label>
            <span>اسم التصنيف العلمي *</span>
            <input
              className="ui-input"
              value={name}
              maxLength={180}
              onChange={(event) => setName(event.target.value)}
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
            <span>نشط ويظهر في القوائم العامة</span>
          </label>
          <div className={styles.actions}>
            <Button
              type="submit"
              loading={pending}
              disabled={pending || !name.trim()}
            >
              {editing ? "حفظ التعديل" : "إضافة التصنيف"}
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

      <section className={styles.categoryList}>
        <div className={styles.tableHeading}>
          <div>
            <h2>قائمة التصنيفات العلمية</h2>
            <p>تعديل الاسم والترتيب والحالة من مكان واحد.</p>
          </div>
          <span className={styles.badge}>
            {formatArabicNumber(items.length)} تصنيف
          </span>
        </div>
        {ordered.length === 0 ? (
          <EmptyState
            title="لا توجد تصنيفات بعد"
            description="أضف أول تصنيف من النموذج المجاور."
          />
        ) : (
          <div className={styles.categoryCards}>
            {ordered.map((item) => (
              <article key={item.id}>
                <span className={styles.categoryOrder}>
                  {formatArabicNumber(item.sort_order)}
                </span>
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.is_active ? "نشط" : "غير نشط"}
                    {item.items_count === undefined
                      ? ""
                      : ` · ${formatArabicNumber(item.items_count)} مادة`}
                    {item.inbox_questions_count === undefined
                      ? ""
                      : ` · ${formatArabicNumber(item.inbox_questions_count)} سؤال وارد`}
                  </p>
                </div>
                <div className={styles.actions}>
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
        title="حذف التصنيف العلمي"
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
              onClick={() => void confirmDelete()}
            >
              حذف التصنيف
            </Button>
          </div>
        }
      >
        <div className={styles.dangerMessage}>
          <strong>{deleteTarget?.name}</strong>
          <p>لن يسمح النظام بحذف تصنيف مرتبط بفتاوى أو أسئلة محفوظة.</p>
          {error && <p role="alert">{error}</p>}
        </div>
      </Dialog>
    </div>
  );
}

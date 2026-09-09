"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  Alert,
  Button,
  FormField,
  Input,
  LoadingState,
  Select,
} from "@/shared/components/ui";

import { listPages } from "../application/pages.client";
import type { PageList } from "../domain/pages.contracts";
import { PagesIcon } from "./pages-icons";
import styles from "./pages.module.css";

export function ParentPageSelector({
  value,
  disabled = false,
  excludeId,
  initialSelection,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  excludeId?: number;
  initialSelection?: { id: number; title: string; path: string } | null;
  onChange: (value: string) => void;
}) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<PageList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    id: number;
    title: string;
    path: string;
  } | null>(initialSelection ?? null);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({
      per_page: "20",
      page: String(pageNumber),
    });
    if (search) query.set("search", search);
    void listPages(query)
      .then((next) => {
        if (!active) return;
        setResult(next);
        const match = next.data.find((item) => String(item.id) === value);
        if (match) setSelected(match);
      })
      .catch(() => {
        if (active) {
          setError("تعذر تحميل الصفحات الأم. لم يتم تغيير اختيارك الحالي.");
          setResult(null);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [pageNumber, reloadKey, search, value]);

  const pages = useMemo(() => {
    const available = (result?.data ?? []).filter(
      (item) => item.id !== excludeId,
    );
    if (selected && !available.some((item) => item.id === selected.id)) {
      return [selected, ...available];
    }
    return available;
  }, [excludeId, result, selected]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPageNumber(1);
    setSearch(input.trim());
    setReloadKey((value) => value + 1);
  }

  return (
    <section className={styles.parentSearch} aria-label="اختيار الصفحة الأم">
      <strong>الصفحة الأم</strong>
      <form className={styles.parentSearchForm} onSubmit={submit}>
        <Input
          type="search"
          value={input}
          disabled={disabled}
          placeholder="ابحث بالعنوان أو المسار"
          aria-label="البحث عن صفحة أم"
          onChange={(event) => setInput(event.target.value)}
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={disabled || loading}
        >
          <PagesIcon name="search" />
          بحث
        </Button>
      </form>
      {error && <Alert variant="error">{error}</Alert>}
      {loading ? (
        <LoadingState label="جارٍ تحميل الصفحات المتاحة…" />
      ) : (
        <FormField
          label="الموضع المختار"
          description={
            result?.data.length === 0
              ? "لا توجد نتائج مطابقة. يمكنك تعديل البحث أو اختيار صفحة بلا أم."
              : "يظهر المسار الكامل لتأكيد مكان الصفحة."
          }
        >
          <Select
            value={value}
            disabled={disabled}
            placeholder="صفحة رئيسية بلا أم"
            options={[
              {
                value: "",
                label: "صفحة رئيسية بلا أم",
                description: "تظهر مباشرة تحت /pages",
              },
              ...pages.map((page) => ({
                value: String(page.id),
                label: page.title,
                description: `/pages/${page.path}`,
              })),
            ]}
            onValueChange={(next) => {
              onChange(next);
              setSelected(
                pages.find((page) => String(page.id) === next) ?? null,
              );
            }}
          />
        </FormField>
      )}
      {selected && value && (
        <div className={styles.selectedParent} role="status">
          <PagesIcon name="hero" />
          <div>
            <strong>{selected.title}</strong>
            <span className={styles.path}>/pages/{selected.path}</span>
          </div>
        </div>
      )}
      {result && result.meta.last_page > 1 && (
        <nav className={styles.pagination} aria-label="نتائج بحث الصفحات الأم">
          <Button
            variant="secondary"
            disabled={pageNumber <= 1 || loading}
            onClick={() => {
              setLoading(true);
              setError(null);
              setPageNumber((current) => Math.max(1, current - 1));
            }}
          >
            السابق
          </Button>
          <span>
            صفحة {result.meta.current_page} من {result.meta.last_page}
          </span>
          <Button
            variant="secondary"
            disabled={pageNumber >= result.meta.last_page || loading}
            onClick={() => {
              setLoading(true);
              setError(null);
              setPageNumber((current) => current + 1);
            }}
          >
            التالي
          </Button>
        </nav>
      )}
    </section>
  );
}

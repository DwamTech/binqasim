"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Alert,
  Button,
  FormField,
  HeroSection,
  Input,
} from "@/shared/components/ui";

import { createPage, PagesClientError } from "../application/pages.client";
import { canManagePages } from "../application/pages.permissions";
import { PagesIcon } from "./pages-icons";
import { ParentPageSelector } from "./parent-page-selector";
import styles from "./pages.module.css";

export function PageCreateForm({ actor }: { actor: AdminSummary }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canManagePages(actor, "pages.create") || saving) return;
    setSaving(true);
    setError(null);
    try {
      const page = await createPage({
        title,
        slug,
        ...(parentId ? { parent_id: Number(parentId) } : {}),
      });
      router.replace(`/dashboard/pages/${page.id}`);
    } catch (reason) {
      setError(
        reason instanceof PagesClientError
          ? reason.message
          : "تعذر إنشاء الصفحة.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة الصفحات"
          title="إنشاء صفحة جديدة"
          description="حدّد اسم الصفحة وموقعها أولًا، ثم أضف المحتوى والوسائط من المحرر."
          actions={
            <Link
              className="ui-button ui-button--secondary ui-focus"
              href="/dashboard/pages"
            >
              العودة إلى الصفحات
            </Link>
          }
        />
      }
    >
      <form className={styles.formCard} dir="rtl" onSubmit={submit} noValidate>
        {error && (
          <Alert variant="error" title="تعذر إنشاء الصفحة">
            {error}
          </Alert>
        )}
        <div className={styles.panelHeading}>
          <div>
            <h2>بيانات الصفحة</h2>
            <p>ستُنشأ الصفحة بمسودة فارغة ويمكنك إضافة أقسامها بعد الإنشاء.</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <FormField
            label="عنوان الصفحة"
            description="اسم واضح يساعد المحررين على تمييز الصفحة."
          >
            <Input
              required
              autoFocus
              maxLength={255}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </FormField>
          <FormField
            label="رابط الصفحة"
            description="يُستخدم داخل عنوان الصفحة. حروف إنجليزية صغيرة وأرقام وشرطات فقط."
          >
            <Input
              required
              dir="ltr"
              maxLength={255}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              value={slug}
              placeholder="about-us"
              onChange={(event) => setSlug(event.target.value)}
            />
          </FormField>
          <div className={styles.fullWidth}>
            <ParentPageSelector
              value={parentId}
              disabled={saving}
              onChange={setParentId}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <Link
            className="ui-button ui-button--secondary ui-focus"
            href="/dashboard/pages"
          >
            إلغاء
          </Link>
          <Button
            type="submit"
            loading={saving}
            disabled={!title.trim() || !slug.trim()}
          >
            <PagesIcon name="add" />
            إنشاء الصفحة
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Alert,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuItem,
  FormField,
  Input,
  PageSkeleton,
  Tooltip,
} from "@/shared/components/ui";

import {
  createPagePreview,
  getPage,
  pageLifecycle,
  PagesClientError,
  savePageDraft,
  uploadPageMedia,
} from "../application/pages.client";
import { canManagePages } from "../application/pages.permissions";
import { usePagesUnsavedNavigationGuard } from "../application/use-pages-unsaved-navigation-guard";
import {
  arePageEditorStatesEqual,
  pageEditorDraftState,
  type PageEditorDraftState,
} from "../domain/page-editor-state";
import {
  createPageContentId,
  isPageContentId,
} from "../domain/page-content-id";
import {
  mergePageSeo,
  pageSeoEditorValues,
  type EditableSeoKey,
  type PageSeoEditorValues,
  validateCanonical,
} from "../domain/page-seo";
import {
  pageStatusLabels,
  type PageDetail,
  type PageMedia,
  type PageSection,
  type PageSeoData,
} from "../domain/pages.contracts";
import { AddSectionPicker } from "./add-section-picker";
import { PagesConfirmDialog } from "./pages-confirm-dialog";
import { PagesIcon } from "./pages-icons";
import { PageSectionEditor } from "./page-section-editor";
import { PageSeoEditor } from "./page-seo-editor";
import { ParentPageSelector } from "./parent-page-selector";
import { notifyPreviewUpdate, openPagePreview } from "./page-preview-popup";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";
import styles from "./pages.module.css";

type EditorOperation = "save" | "publish" | "archive" | "restore" | "preview";
type LifecycleAction = "publish" | "archive" | "restore-from-archive";
type EditorFieldErrors = Partial<Record<"title" | "slug", string>>;
type EditorValidation = {
  message: string;
  fields: EditorFieldErrors;
  canonical?: string;
  sectionId?: string;
};

function safeEditorError(reason: unknown, fallback: string): string {
  if (!(reason instanceof PagesClientError)) return fallback;
  if (reason.status === 403)
    return "لا تملك الصلاحية المطلوبة لتنفيذ هذا الإجراء.";
  if (reason.status === 404)
    return "لم تعد الصفحة متاحة. حدّث القائمة وحاول مرة أخرى.";
  if (reason.status === 422)
    return "راجع الحقول المعلّمة وتأكد من اكتمال محتوى الأقسام ثم حاول مرة أخرى.";
  if (reason.status >= 500)
    return "تعذّر الاتصال بخدمة الصفحات الآن. بقيت تعديلاتك محفوظة داخل المحرر.";
  return fallback;
}

function serverFieldErrors(reason: unknown): EditorFieldErrors {
  if (!(reason instanceof PagesClientError) || !reason.fieldErrors) return {};
  const fields: EditorFieldErrors = {};
  if (reason.fieldErrors.title?.length)
    fields.title = "أدخل عنوانًا واضحًا للصفحة.";
  if (reason.fieldErrors.slug?.length)
    fields.slug = "استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطات فقط.";
  return fields;
}

function serverSectionError(
  reason: unknown,
  sections: PageSection[],
): { sectionId: string; message: string } | undefined {
  if (!(reason instanceof PagesClientError) || !reason.fieldErrors) return;
  const field = Object.keys(reason.fieldErrors).find((candidate) =>
    /^content\.sections\.\d+(?:\.|$)/.test(candidate),
  );
  const index = field?.match(/^content\.sections\.(\d+)/)?.[1];
  const section = index === undefined ? undefined : sections[Number(index)];
  if (!section) return;

  return {
    sectionId: section.id,
    message:
      section.type === "gallery"
        ? "تعذّر حفظ المعرض لأن بيانات إحدى صوره غير صالحة. احذف الصورة وأضفها مجددًا."
        : "توجد بيانات غير صالحة في هذا القسم. راجع الحقول ثم حاول الحفظ.",
  };
}

function normalizedSections(sections: PageSection[]): PageSection[] {
  return sections.map((section) =>
    section.type === "hero"
      ? {
          ...section,
          data: {
            ...section.data,
            primary_action:
              section.data.primary_action?.label.trim() ||
              section.data.primary_action?.url.trim()
                ? section.data.primary_action
                : null,
            secondary_action:
              section.data.secondary_action?.label.trim() ||
              section.data.secondary_action?.url.trim()
                ? section.data.secondary_action
                : null,
          },
        }
      : section,
  );
}

function repairPageContentIds(sections: PageSection[]): PageSection[] {
  return sections.map((section) => {
    const id = isPageContentId(section.id) ? section.id : createPageContentId();
    if (section.type !== "gallery")
      return id === section.id ? section : { ...section, id };

    const items = section.data.items.map((item) =>
      isPageContentId(item.id) ? item : { ...item, id: createPageContentId() },
    );
    return id === section.id &&
      items.every((item, index) => item === section.data.items[index])
      ? section
      : { ...section, id, data: { ...section.data, items } };
  });
}

const lifecycleCopy: Record<
  LifecycleAction,
  { title: string; body: string; confirm: string; destructive?: boolean }
> = {
  publish: {
    title: "نشر المسودة المحفوظة؟",
    body: "سيصبح محتوى آخر مسودة محفوظة متاحًا للعامة. تأكد من المعاينة قبل المتابعة.",
    confirm: "نشر الصفحة",
  },
  archive: {
    title: "أرشفة الصفحة؟",
    body: "ستتوقف الصفحة عن الظهور للعامة وفق دورة حياة الصفحات الحالية. تظل المراجعات محفوظة.",
    confirm: "أرشفة الصفحة",
    destructive: true,
  },
  "restore-from-archive": {
    title: "استعادة الصفحة من الأرشيف؟",
    body: "ستعود الصفحة إلى حالتها السابقة دون نشر مسودة جديدة تلقائيًا.",
    confirm: "استعادة الصفحة",
  },
};

export function PageEditor({ id, actor }: { id: string; actor: AdminSummary }) {
  const router = useRouter();
  const [page, setPage] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [media, setMedia] = useState<Record<string, PageMedia>>({});
  const [seoOriginal, setSeoOriginal] = useState<PageSeoData>([]);
  const [seoValues, setSeoValues] = useState<PageSeoEditorValues>(
    pageSeoEditorValues([]),
  );
  const [seoTouched, setSeoTouched] = useState<Set<EditableSeoKey>>(new Set());
  const [baseline, setBaseline] = useState<PageEditorDraftState | null>(null);
  const [operation, setOperation] = useState<EditorOperation | null>(null);
  const [pendingLifecycle, setPendingLifecycle] =
    useState<LifecycleAction | null>(null);
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );
  const [fieldErrors, setFieldErrors] = useState<EditorFieldErrors>({});
  const [canonicalError, setCanonicalError] = useState<string | undefined>();
  const [sectionError, setSectionError] = useState<
    { sectionId: string; message: string } | undefined
  >();
  const [saveFailed, setSaveFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const uploadingRef = useRef(new Set<string>());
  const operationRef = useRef<EditorOperation | null>(null);
  const collapseInitializedRef = useRef(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const pageSettingsRef = useRef<HTMLDetailsElement>(null);
  const seoSettingsRef = useRef<HTMLDetailsElement>(null);

  const canUpdate = canManagePages(actor, "pages.update");
  const canPreview = canManagePages(actor, "pages.preview");
  const canPublish = canManagePages(actor, "pages.publish");
  const canArchive = canManagePages(actor, "pages.archive");
  const canRestore = canManagePages(actor, "pages.restore");
  const published = page?.published !== null;
  const hasActiveUpload = uploadingKeys.size > 0;
  const isMutationActive = operation !== null;
  const currentState = useMemo(
    () =>
      page
        ? pageEditorDraftState(
            title,
            slug,
            parentId ? Number(parentId) : null,
            { schema_version: 1, sections: normalizedSections(sections) },
            mergePageSeo(seoOriginal, seoValues, seoTouched),
          )
        : null,
    [page, title, slug, parentId, sections, seoOriginal, seoValues, seoTouched],
  );
  const isDirty =
    baseline !== null &&
    currentState !== null &&
    !arePageEditorStatesEqual(baseline, currentState);
  const {
    discard: discardNavigation,
    hasPendingNavigation,
    requestNavigation: requestGuardedNavigation,
    stay: stayOnEditor,
  } = usePagesUnsavedNavigationGuard({
    dirty: isDirty,
    navigate: (target) => router.push(target),
  });

  function hydrate(detail: PageDetail): void {
    const nextBaseline = pageEditorDraftState(
      detail.draft.title,
      detail.slug,
      detail.parent_id,
      {
        schema_version: 1,
        sections: normalizedSections(detail.draft.content.sections),
      },
      detail.draft.seo,
    );
    setPage(detail);
    setTitle(detail.draft.title);
    setSlug(detail.slug);
    setParentId(detail.parent_id ? String(detail.parent_id) : "");
    setSections(detail.draft.content.sections);
    setMedia(detail.media);
    setSeoOriginal(detail.draft.seo);
    setSeoValues(pageSeoEditorValues(detail.draft.seo));
    setSeoTouched(new Set());
    setBaseline(nextBaseline);
    setFieldErrors({});
    setCanonicalError(undefined);
    setSectionError(undefined);
    setSaveFailed(false);
    if (!collapseInitializedRef.current) {
      setCollapsedSections(
        new Set(
          detail.draft.content.sections.slice(1).map((section) => section.id),
        ),
      );
      collapseInitializedRef.current = true;
    }
  }

  useEffect(() => {
    let active = true;
    void getPage(id)
      .then((detail) => active && hydrate(detail))
      .catch((reason: unknown) => {
        if (!active) return;
        if (reason instanceof PagesClientError && reason.status === 404) {
          setNotFound(true);
          return;
        }
        setLoadError(
          "تعذر تحميل محرر الصفحة. تحقق من الاتصال ثم حاول مرة أخرى.",
        );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  function updateSection(
    index: number,
    transform: (section: PageSection) => PageSection,
  ): void {
    const target = sections[index];
    if (target && sectionError?.sectionId === target.id)
      setSectionError(undefined);
    setSections((current) =>
      current.map((section, itemIndex) =>
        itemIndex === index ? transform(section) : section,
      ),
    );
  }

  function moveSection(index: number, direction: -1 | 1): void {
    setSections((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  function updateSeo(key: EditableSeoKey, value: string): void {
    if (key === "canonical") setCanonicalError(undefined);
    setSeoValues((current) => ({
      ...current,
      [key]:
        key === "index" && (value === "allow" || value === "block")
          ? value
          : key === "index"
            ? "default"
            : value,
    }));
    setSeoTouched((current) => new Set(current).add(key));
  }

  function requestNavigation(target: string): void {
    if (operationRef.current !== null || uploadingRef.current.size > 0) {
      setNotice("انتظر حتى تكتمل العملية الحالية قبل مغادرة المحرر.");
      return;
    }
    requestGuardedNavigation(target);
  }

  function beginOperation(next: EditorOperation): boolean {
    if (operationRef.current !== null) return false;
    operationRef.current = next;
    setOperation(next);
    return true;
  }

  function finishOperation(): void {
    operationRef.current = null;
    setOperation(null);
  }

  async function uploadMediaAsset(
    index: number,
    file: File | undefined,
    type: PageMedia["type"],
    slot = "primary",
  ): Promise<void> {
    const key = `${index}:${slot}`;
    if (
      !file ||
      !page ||
      operationRef.current !== null ||
      uploadingRef.current.has(key)
    )
      return;
    uploadingRef.current.add(key);
    setUploadingKeys((current) => new Set(current).add(key));
    setUploadErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setError(null);
    try {
      const asset = await uploadPageMedia(id, file, type);
      setMedia((current) => ({ ...current, [String(asset.id)]: asset }));
      updateSection(index, (section) => {
        if (section.type === "hero")
          return {
            ...section,
            data: {
              ...section.data,
              image: { media_id: asset.id, alt: section.data.image?.alt ?? "" },
            },
          };
        if (section.type === "image")
          return {
            ...section,
            data: {
              ...section.data,
              image: { media_id: asset.id, alt: section.data.image.alt },
            },
          };
        if (section.type === "image_text")
          return {
            ...section,
            data: {
              ...section.data,
              image: { media_id: asset.id, alt: section.data.image.alt },
            },
          };
        if (section.type === "video")
          return slot === "poster"
            ? {
                ...section,
                data: {
                  ...section.data,
                  poster: {
                    media_id: asset.id,
                    alt: section.data.poster?.alt ?? "",
                  },
                },
              }
            : {
                ...section,
                data: { ...section.data, video: { media_id: asset.id } },
              };
        if (section.type === "audio")
          return {
            ...section,
            data: { ...section.data, audio: { media_id: asset.id } },
          };
        if (section.type === "gallery" && slot.startsWith("gallery:")) {
          const itemIndex = Number(slot.slice(8));
          return {
            ...section,
            data: {
              ...section.data,
              items: section.data.items.map((item, currentIndex) =>
                currentIndex === itemIndex
                  ? { ...item, media_id: asset.id }
                  : item,
              ),
            },
          };
        }
        if (section.type === "cards" && slot.startsWith("cards:")) {
          const itemIndex = Number(slot.slice(6));
          return {
            ...section,
            data: {
              ...section.data,
              items: section.data.items.map((item, currentIndex) =>
                currentIndex === itemIndex
                  ? {
                      ...item,
                      image: { media_id: asset.id, alt: item.image?.alt ?? "" },
                    }
                  : item,
              ),
            },
          };
        }
        if (section.type === "downloads" && slot.startsWith("downloads:")) {
          const itemIndex = Number(slot.slice(10));
          return {
            ...section,
            data: {
              ...section.data,
              items: section.data.items.map((item, currentIndex) =>
                currentIndex === itemIndex
                  ? { ...item, media_id: asset.id }
                  : item,
              ),
            },
          };
        }
        return section;
      });
      setNotice("تم رفع الملف. احفظ المسودة لربطه بالمراجعة الحالية.");
    } catch (reason) {
      const uploadError = safeEditorError(
        reason,
        "تعذّر رفع الملف. تأكد من نوعه وحجمه ثم حاول مرة أخرى.",
      );
      setUploadErrors((current) => ({ ...current, [key]: uploadError }));
    } finally {
      uploadingRef.current.delete(key);
      setUploadingKeys((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  }

  function validate(): EditorValidation | null {
    const fields: EditorFieldErrors = {};
    if (!title.trim()) fields.title = "أدخل عنوانًا واضحًا للصفحة.";
    if (!published && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      fields.slug = "استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطات فقط.";
    if (Object.keys(fields).length > 0)
      return {
        message: "صحّح بيانات الصفحة المعلّمة ثم حاول الحفظ مرة أخرى.",
        fields,
      };
    if (seoTouched.has("canonical") && !validateCanonical(seoValues.canonical))
      return {
        message:
          "الرابط الأساسي في إعدادات محركات البحث يجب أن يكون رابط HTTP أو HTTPS كاملاً.",
        fields,
        canonical: "أدخل رابط HTTP أو HTTPS كاملًا، أو اترك الحقل فارغًا.",
      };
    for (const section of sections) {
      if (section.type === "hero" && !section.data.title.trim())
        return {
          message: "أدخل عنوانًا لقسم الواجهة الرئيسية.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "hero" &&
        section.data.variant !== "centered" &&
        !section.data.image?.media_id
      )
        return {
          message: "اختر صورة مناسبة لتخطيط الواجهة المحدد.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "rich_content" &&
        !section.data.html.replace(/<[^>]*>/g, "").trim()
      )
        return {
          message: "أدخل محتوى في قسم النص.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "image" &&
        (!section.data.image.media_id || !section.data.image.alt.trim())
      )
        return {
          message: "اختر صورة وأدخل نصًا بديلًا يصفها.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "image_text" &&
        (!section.data.image.media_id ||
          !section.data.image.alt.trim() ||
          !section.data.html.replace(/<[^>]*>/g, "").trim())
      )
        return {
          message: "أكمل الصورة والنص البديل والمحتوى في قسم الصورة والنص.",
          fields,
          sectionId: section.id,
        };
      if (section.type === "video" && !section.data.video.media_id)
        return {
          message: "اختر ملف فيديو لهذا القسم.",
          fields,
          sectionId: section.id,
        };
      if (section.type === "audio" && !section.data.audio.media_id)
        return {
          message: "اختر ملفًا صوتيًا لهذا القسم.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "gallery" &&
        (section.data.items.length < 1 ||
          section.data.items.some((item) => !item.media_id || !item.alt.trim()))
      )
        return {
          message: "أضف صورة واحدة على الأقل مع نص بديل إلى المعرض.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "cards" &&
        section.data.items.some((item) => !item.title.trim())
      )
        return {
          message: "أدخل عنوانًا لكل بطاقة.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "statistics" &&
        section.data.items.some(
          (item) => !item.value.trim() || !item.label.trim(),
        )
      )
        return {
          message: "أدخل قيمة واسمًا لكل إحصائية.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "downloads" &&
        section.data.items.some((item) => !item.media_id || !item.label.trim())
      )
        return {
          message: "اختر ملفًا وأدخل تسمية لكل عنصر تنزيل.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "faq" &&
        (section.data.items.length < 1 ||
          section.data.items.some(
            (item) =>
              !item.question.trim() ||
              !item.answer.replace(/<[^>]*>/g, "").trim(),
          ))
      )
        return {
          message: "أكمل السؤال والإجابة في قسم الأسئلة الشائعة.",
          fields,
          sectionId: section.id,
        };
      if (
        section.type === "cta" &&
        (!section.data.title.trim() ||
          !section.data.primary_action.label.trim() ||
          !section.data.primary_action.url.trim())
      )
        return {
          message: "أكمل عنوان الدعوة ونص ورابط الإجراء الأساسي.",
          fields,
          sectionId: section.id,
        };
    }
    return null;
  }

  async function save(): Promise<void> {
    if (
      !page ||
      !canUpdate ||
      operationRef.current !== null ||
      uploadingRef.current.size > 0
    )
      return;
    const validation = validate();
    if (validation) {
      setFieldErrors(validation.fields);
      setCanonicalError(validation.canonical);
      setSectionError(
        validation.sectionId
          ? { sectionId: validation.sectionId, message: validation.message }
          : undefined,
      );
      setError(validation.message);
      setSaveFailed(true);
      if (validation.fields.title || validation.fields.slug) {
        if (pageSettingsRef.current) pageSettingsRef.current.open = true;
      }
      if (validation.canonical && seoSettingsRef.current)
        seoSettingsRef.current.open = true;
      if (validation.sectionId)
        setCollapsedSections((current) => {
          const next = new Set(current);
          next.delete(validation.sectionId!);
          return next;
        });
      requestAnimationFrame(() => {
        if (validation.fields.title) titleInputRef.current?.focus();
        else if (validation.fields.slug) slugInputRef.current?.focus();
        else if (validation.canonical)
          seoSettingsRef.current
            ?.querySelector<HTMLElement>('[aria-invalid="true"]')
            ?.focus();
        else if (validation.sectionId) {
          const target = document.getElementById(
            `pages-section-${validation.sectionId}`,
          );
          target?.scrollIntoView({ behavior: "smooth", block: "center" });
          target?.focus({ preventScroll: true });
        }
      });
      return;
    }
    if (!beginOperation("save")) return;
    const sectionsForSave = repairPageContentIds(normalizedSections(sections));
    setSaveFailed(false);
    setFieldErrors({});
    setCanonicalError(undefined);
    setSectionError(undefined);
    setError(null);
    try {
      hydrate(
        await savePageDraft(id, {
          title,
          content: {
            schema_version: 1,
            sections: sectionsForSave,
          },
          seo_data: mergePageSeo(seoOriginal, seoValues, seoTouched),
          ...(!published
            ? { slug, parent_id: parentId ? Number(parentId) : null }
            : {}),
        }),
      );
      setNotice("تم حفظ المسودة.");
      notifyPreviewUpdate(id);
    } catch (reason) {
      setSaveFailed(true);
      const nextFieldErrors = serverFieldErrors(reason);
      const nextSectionError = serverSectionError(reason, sections);
      setFieldErrors(nextFieldErrors);
      setSectionError(nextSectionError);
      if (nextSectionError) {
        setCollapsedSections((current) => {
          const next = new Set(current);
          next.delete(nextSectionError.sectionId);
          return next;
        });
      }
      if (nextFieldErrors.title || nextFieldErrors.slug) {
        if (pageSettingsRef.current) pageSettingsRef.current.open = true;
      }
      setError(
        nextSectionError?.message ??
          safeEditorError(
            reason,
            "تعذّر حفظ المسودة. بقيت تعديلاتك داخل المحرر، حاول مرة أخرى.",
          ),
      );
      requestAnimationFrame(() => {
        if (nextFieldErrors.title) titleInputRef.current?.focus();
        else if (nextFieldErrors.slug) slugInputRef.current?.focus();
      });
    } finally {
      finishOperation();
    }
  }

  async function lifecycle(action: LifecycleAction): Promise<void> {
    if (
      !page ||
      operationRef.current !== null ||
      uploadingRef.current.size > 0 ||
      isDirty
    )
      return;
    if (
      !beginOperation(
        action === "publish"
          ? "publish"
          : action === "archive"
            ? "archive"
            : "restore",
      )
    )
      return;
    setError(null);
    try {
      hydrate(await pageLifecycle(id, action));
      setNotice(
        action === "publish"
          ? "تم نشر الصفحة."
          : action === "archive"
            ? "تمت أرشفة الصفحة."
            : "تمت استعادة الصفحة.",
      );
      setPendingLifecycle(null);
      notifyPreviewUpdate(id);
    } catch (reason) {
      setError(
        safeEditorError(reason, "تعذّر تحديث حالة الصفحة. حاول مرة أخرى."),
      );
    } finally {
      finishOperation();
    }
  }

  async function preview(): Promise<void> {
    if (
      !canPreview ||
      operationRef.current !== null ||
      uploadingRef.current.size > 0 ||
      isDirty ||
      !beginOperation("preview")
    )
      return;
    setError(null);
    try {
      await openPagePreview(
        () => createPagePreview(id),
        undefined,
        `cms_page_preview_${id}`,
      );
      setNotice("المعاينة تعرض آخر مسودة محفوظة فقط.");
      notifyPreviewUpdate(id);
    } catch (reason) {
      setError(safeEditorError(reason, "تعذّر فتح المعاينة. حاول مرة أخرى."));
    } finally {
      finishOperation();
    }
  }

  if (loading)
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  if (loadError || notFound || !page) {
    return (
      <PageContainer>
        <Alert
          variant="error"
          title={notFound ? "الصفحة غير موجودة" : "تعذر تحميل المحرر"}
        >
          <p>
            {notFound
              ? "قد تكون الصفحة حُذفت أو لم تعد متاحة لك."
              : (loadError ?? "تعذر فتح الصفحة.")}
          </p>
          <div className={styles.actions}>
            {!notFound && (
              <Button
                variant="secondary"
                onClick={() => {
                  setLoading(true);
                  setLoadError(null);
                  setNotFound(false);
                  setReloadKey((value) => value + 1);
                }}
              >
                إعادة المحاولة
              </Button>
            )}
            <Link
              className="ui-button ui-button--secondary ui-focus"
              href="/dashboard/pages"
            >
              العودة إلى الصفحات
            </Link>
          </div>
        </Alert>
      </PageContainer>
    );
  }

  const previewReason = isDirty
    ? "احفظ المسودة قبل معاينة أحدث تغييراتك."
    : hasActiveUpload
      ? "انتظر اكتمال رفع الملفات."
      : "";
  const publishReason = isDirty
    ? "احفظ المسودة قبل النشر."
    : hasActiveUpload
      ? "انتظر اكتمال رفع الملفات."
      : "";
  const lifecycleReason = isDirty
    ? "احفظ أو تجاهل التغييرات قبل تغيير حالة الصفحة."
    : hasActiveUpload
      ? "انتظر اكتمال رفع الملفات."
      : "";

  return (
    <PageContainer
      header={
        <header className={styles.editorHeader} dir="rtl">
          <nav className={styles.editorBreadcrumb} aria-label="مسار الصفحة">
            <Link
              href="/dashboard/pages"
              onClick={(event) => {
                event.preventDefault();
                requestNavigation("/dashboard/pages");
              }}
            >
              إدارة الصفحات
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">تحرير الصفحة</span>
          </nav>
          <div className={styles.editorHeaderMain}>
            <div className={styles.editorHeaderCopy}>
              <span className={styles.editorEyebrow}>تحرير المحتوى</span>
              <h1>{title || page.title}</h1>
              <span className={styles.path}>/pages/{page.path}</span>
            </div>
            <div className={styles.editorHeaderStatus} aria-live="polite">
              <Badge
                variant={
                  page.status === "published"
                    ? "success"
                    : page.status === "archived"
                      ? "danger"
                      : "warning"
                }
              >
                {pageStatusLabels[page.status]}
              </Badge>
              <Badge variant={saveFailed || isDirty ? "warning" : "success"}>
                {operation === "save"
                  ? "جارٍ الحفظ…"
                  : saveFailed
                    ? "تعذّر الحفظ"
                    : isDirty
                      ? "تغييرات غير محفوظة"
                      : "محفوظ"}
              </Badge>
              {page.has_unpublished_changes && (
                <Badge variant="warning">تغييرات لم تُنشر بعد</Badge>
              )}
            </div>
          </div>
          <div className={styles.editorVersionMeta}>
            <span>المسودة المحفوظة: النسخة {page.draft.version}</span>
            <span aria-hidden="true">•</span>
            <span>
              {page.published
                ? `النسخة المنشورة: ${page.published.version}`
                : "هذه الصفحة لم تُنشر بعد"}
            </span>
          </div>
        </header>
      }
    >
      <div className={styles.stack} dir="rtl">
        <div className={styles.noticeRow}>
          {error && (
            <Alert variant="error" title="تعذّر إكمال الإجراء">
              {error}
            </Alert>
          )}
          {notice && (
            <p className={styles.compactNotice} role="status">
              {notice}
            </p>
          )}
          {hasActiveUpload && (
            <p className={styles.compactNotice} role="status">
              جارٍ رفع الملف… يمكنك متابعة كتابة المحتوى أثناء الانتظار.
            </p>
          )}
        </div>

        <div className={styles.editorLayout}>
          <main className={styles.editorContent} aria-label="محتوى الصفحة">
            <section className={styles.builder}>
              <div className={styles.builderHeader}>
                <div>
                  <span className={styles.sectionKicker}>المحتوى</span>
                  <h2>محتوى الصفحة</h2>
                  <p className={styles.helper}>
                    أضف الأقسام ورتّب محتوى الصفحة كما سيظهر للزائر.
                  </p>
                </div>
                {canUpdate && (
                  <AddSectionPicker
                    disabled={isMutationActive}
                    onAdd={(section) => {
                      setSections((current) => [...current, section]);
                      setCollapsedSections((current) => {
                        const next = new Set(current);
                        next.delete(section.id);
                        return next;
                      });
                    }}
                  />
                )}
              </div>
              <div className={styles.sectionList}>
                {sections.length === 0 && (
                  <div className={styles.builderEmpty}>
                    <span className={styles.builderEmptyIcon}>
                      <PagesIcon name="add" />
                    </span>
                    <h3>ابدأ بإضافة أول قسم</h3>
                    <p className={styles.helper}>
                      اختر نوع المحتوى المناسب، ويمكنك ترتيبه أو إخفاؤه لاحقًا.
                    </p>
                  </div>
                )}
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    id={`pages-section-${section.id}`}
                    className={styles.sectionAnchor}
                    tabIndex={-1}
                  >
                    {sectionError?.sectionId === section.id && (
                      <p className={styles.sectionValidation} role="alert">
                        {sectionError.message}
                      </p>
                    )}
                    <PageSectionEditor
                      section={section}
                      index={index}
                      total={sections.length}
                      media={media}
                      disabled={!canUpdate || isMutationActive}
                      collapsed={collapsedSections.has(section.id)}
                      isUploading={(slot = "primary") =>
                        uploadingKeys.has(`${index}:${slot}`)
                      }
                      uploadError={(slot = "primary") =>
                        uploadErrors[`${index}:${slot}`]
                      }
                      onToggle={() =>
                        setCollapsedSections((current) => {
                          const next = new Set(current);
                          if (next.has(section.id)) next.delete(section.id);
                          else next.add(section.id);
                          return next;
                        })
                      }
                      onUpdate={(next) => updateSection(index, () => next)}
                      onUpload={(file, type, slot) =>
                        void uploadMediaAsset(index, file, type, slot)
                      }
                      onMove={moveSection}
                      onRemove={() =>
                        setSections((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className={styles.editorSettings} aria-label="إعدادات الصفحة">
            <details ref={pageSettingsRef} className={styles.settingsPanel} open>
              <summary>
                <span className={styles.settingsSummaryCopy}>
                  <strong>إعدادات الصفحة</strong>
                  <small>العنوان والرابط ومكان الصفحة داخل الموقع</small>
                </span>
              </summary>
              <div className={styles.settingsBody}>
                <fieldset
                  className={styles.settingsFields}
                  disabled={!canUpdate || isMutationActive}
                >
                  <legend className="sr-only">بيانات الصفحة الأساسية</legend>
                  <FormField
                    label="عنوان الصفحة"
                    message={fieldErrors.title}
                    error={Boolean(fieldErrors.title)}
                  >
                    <Input
                      ref={titleInputRef}
                      maxLength={255}
                      value={title}
                      onChange={(event) => {
                        setTitle(event.target.value);
                        setFieldErrors((current) => {
                          const next = { ...current };
                          delete next.title;
                          return next;
                        });
                      }}
                    />
                  </FormField>
                  <FormField
                    label="رابط الصفحة"
                    description={
                      published ? "الرابط مثبّت بعد النشر." : undefined
                    }
                    message={fieldErrors.slug}
                    error={Boolean(fieldErrors.slug)}
                  >
                    <Input
                      ref={slugInputRef}
                      dir="ltr"
                      readOnly={published}
                      maxLength={255}
                      value={slug}
                      onChange={(event) => {
                        setSlug(event.target.value);
                        setFieldErrors((current) => {
                          const next = { ...current };
                          delete next.slug;
                          return next;
                        });
                      }}
                    />
                  </FormField>
                  {!published && (
                    <ParentPageSelector
                      value={parentId}
                      disabled={!canUpdate || isMutationActive}
                      excludeId={page.id}
                      initialSelection={page.parent ?? null}
                      onChange={setParentId}
                    />
                  )}
                  {published && page.parent && (
                    <div className={styles.selectedParent}>
                      <PagesIcon name="hero" />
                      <div>
                        <strong>تحت الصفحة: {page.parent.title}</strong>
                        <span className={styles.path}>
                          /pages/{page.parent.path}
                        </span>
                      </div>
                    </div>
                  )}
                </fieldset>
              </div>
            </details>

            <details ref={seoSettingsRef} className={styles.settingsPanel}>
              <summary>
                <span className={styles.settingsSummaryCopy}>
                  <strong>SEO</strong>
                  <small>الظهور في محركات البحث</small>
                </span>
              </summary>
              <div className={styles.settingsBody}>
                <PageSeoEditor
                  seo={seoOriginal}
                  values={seoValues}
                  canonicalError={canonicalError}
                  disabled={!canUpdate || isMutationActive}
                  onChange={updateSeo}
                />
              </div>
            </details>
          </aside>
        </div>

        <div className={styles.actionBar} aria-label="إجراءات تحرير الصفحة">
          <div className={styles.actionStatus} role="status" aria-live="polite">
            <span
              className={styles.actionStatusDot}
              data-state={saveFailed ? "error" : isDirty ? "dirty" : "saved"}
              aria-hidden="true"
            />
            <span>
              <strong>
                {operation === "save"
                  ? "جارٍ حفظ المسودة…"
                  : saveFailed
                    ? "فشل الحفظ. بقيت تغييراتك المحلية كما هي."
                    : isDirty
                      ? "لديك تغييرات غير محفوظة"
                      : "كل التغييرات محفوظة"}
              </strong>
              {(previewReason || publishReason || lifecycleReason) && (
                <small id="pages-actions-disabled">
                  {previewReason || publishReason || lifecycleReason}
                </small>
              )}
            </span>
          </div>
          <div className={styles.primaryActions}>
            {canUpdate && (
              <Button
                loading={operation === "save"}
                disabled={isMutationActive || hasActiveUpload}
                onClick={() => void save()}
              >
                <PagesIcon name="save" />
                حفظ المسودة
              </Button>
            )}
            {canPreview && (
              <Tooltip content={previewReason || "معاينة آخر مسودة محفوظة"}>
                <span>
                  <Button
                    variant="secondary"
                    disabled={isDirty || isMutationActive || hasActiveUpload}
                    aria-describedby={
                      previewReason ? "pages-actions-disabled" : undefined
                    }
                    onClick={() => void preview()}
                  >
                    <PagesIcon name="preview" />
                    معاينة
                  </Button>
                </span>
              </Tooltip>
            )}
            {page.status !== "archived" &&
              page.has_unpublished_changes &&
              canPublish && (
                <Tooltip content={publishReason || "نشر آخر مسودة محفوظة"}>
                  <span>
                    <Button
                      variant="secondary"
                      disabled={isDirty || isMutationActive || hasActiveUpload}
                      aria-describedby={
                        publishReason ? "pages-actions-disabled" : undefined
                      }
                      onClick={() => setPendingLifecycle("publish")}
                    >
                      <PagesIcon name="publish" />
                      نشر
                    </Button>
                  </span>
                </Tooltip>
              )}
          </div>
          <DropdownMenu
            direction="up"
            trigger={
              <>
                <PagesIcon name="more" />
                المزيد
              </>
            }
          >
            <DropdownMenuItem
              onSelect={() =>
                requestNavigation(`/dashboard/pages/${id}/revisions`)
              }
            >
              <PagesIcon name="history" />
              سجل المراجعات
            </DropdownMenuItem>
            {page.status === "published" && (
              <a
                role="menuitem"
                className="ui-menu-item ui-focus"
                href={page.public_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PagesIcon name="external" />
                فتح الصفحة العامة
              </a>
            )}
            {page.status !== "archived" && canArchive && (
              <DropdownMenuItem
                className={styles.dangerText ?? ""}
                onSelect={() => {
                  if (lifecycleReason) setNotice(lifecycleReason);
                  else setPendingLifecycle("archive");
                }}
              >
                <PagesIcon name="archive" />
                أرشفة الصفحة
              </DropdownMenuItem>
            )}
            {page.status === "archived" && canRestore && (
              <DropdownMenuItem
                onSelect={() => {
                  if (lifecycleReason) setNotice(lifecycleReason);
                  else setPendingLifecycle("restore-from-archive");
                }}
              >
                <PagesIcon name="history" />
                استعادة الصفحة
              </DropdownMenuItem>
            )}
          </DropdownMenu>
        </div>

        {hasPendingNavigation && (
          <UnsavedChangesDialog
            onStay={stayOnEditor}
            onDiscard={discardNavigation}
          />
        )}
        {pendingLifecycle && (
          <PagesConfirmDialog
            open
            title={lifecycleCopy[pendingLifecycle].title}
            confirmLabel={lifecycleCopy[pendingLifecycle].confirm}
            destructive={lifecycleCopy[pendingLifecycle].destructive}
            loading={operation !== null}
            onCancel={() => setPendingLifecycle(null)}
            onConfirm={() => void lifecycle(pendingLifecycle)}
          >
            <p>{lifecycleCopy[pendingLifecycle].body}</p>
          </PagesConfirmDialog>
        )}
      </div>
    </PageContainer>
  );
}

// Source contract labels retained for regression discoverability: Rich Content, Image + Text, Video, Audio, Gallery, Cards, Statistics, Downloads, FAQ, CTA, Revision History.

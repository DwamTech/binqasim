"use client";

import { useState } from "react";

import { RichTextEditor } from "@/features/articles/components/rich-text-editor";
import {
  Badge,
  Button,
  Checkbox,
  FormField,
  IconButton,
  Input,
  Select,
} from "@/shared/components/ui";

import type {
  AudioSection,
  CardsSection,
  CtaSection,
  DownloadsSection,
  FaqSection,
  GallerySection,
  HeroSection,
  ImageSection,
  ImageTextSection,
  PageMedia,
  PageSection,
  RichContentSection,
  StatisticsSection,
  VideoSection,
} from "../domain/pages.contracts";
import { createPageContentId } from "../domain/page-content-id";
import {
  componentDefinition,
  ComponentTypeIcon,
} from "./page-component-catalog";
import { PagesConfirmDialog } from "./pages-confirm-dialog";
import { PagesChoiceField, PagesHeroLayoutPreview } from "./pages-choice-field";
import { PagesIcon } from "./pages-icons";
import { MediaUploadField } from "./media-upload-field";
import { RepeatableItemShell } from "./repeatable-item-shell";
import styles from "./pages.module.css";

const themes = ["default", "light", "primary", "secondary", "dark"] as const;
const spacing = ["none", "small", "medium", "large", "xl"] as const;
const themeLabels: Record<(typeof themes)[number], string> = {
  default: "ألوان الموقع",
  light: "فاتح",
  primary: "أساسي",
  secondary: "ثانوي",
  dark: "داكن",
};
const spacingLabels: Record<(typeof spacing)[number], string> = {
  none: "بدون مسافة",
  small: "صغيرة",
  medium: "متوسطة",
  large: "كبيرة",
  xl: "كبيرة جدًا",
};
const createId = createPageContentId;

function TextField({
  label,
  value,
  onChange,
  description,
  maxLength = 255,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  maxLength?: number;
  type?: "text" | "url";
}) {
  return (
    <FormField label={label} description={description}>
      <Input
        type={type}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}
function TextAreaField({
  label,
  value,
  onChange,
  description,
  maxLength = 2000,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  maxLength?: number;
}) {
  return (
    <FormField label={label} description={description}>
      <textarea
        className="ui-input ui-focus"
        rows={4}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}
function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <FormField label={label}>
      <Select
        value={value}
        options={options}
        aria-label={label}
        onValueChange={(next) => onChange(next as T)}
      />
    </FormField>
  );
}
function reorder<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}
// Compatibility name retained for the established Pages regression contract.
const moveItem = reorder;

function sectionSummary(
  section: PageSection,
  media: Record<string, PageMedia>,
): string {
  if (section.type === "hero")
    return section.data.title || "واجهة رئيسية بلا عنوان";
  if (section.type === "rich_content")
    return (
      section.data.html
        .replace(/<[^>]*>/g, " ")
        .trim()
        .slice(0, 70) || "محتوى نصي جديد"
    );
  if (section.type === "image")
    return (
      media[String(section.data.image.media_id)]?.name ?? "صورة لم تُرفع بعد"
    );
  if (section.type === "image_text")
    return (
      section.data.title ||
      media[String(section.data.image.media_id)]?.name ||
      "صورة مع نص"
    );
  if (section.type === "video")
    return (
      section.data.title ||
      media[String(section.data.video.media_id)]?.name ||
      "فيديو جديد"
    );
  if (section.type === "audio")
    return (
      section.data.title ||
      media[String(section.data.audio.media_id)]?.name ||
      "ملف صوتي جديد"
    );
  if (section.type === "gallery") return `${section.data.items.length} صورة`;
  if (section.type === "cards") return `${section.data.items.length} بطاقة`;
  if (section.type === "statistics")
    return `${section.data.items.length} إحصائية`;
  if (section.type === "downloads") return `${section.data.items.length} ملف`;
  if (section.type === "faq") return `${section.data.items.length} سؤال`;
  return section.data.title || "دعوة لاتخاذ إجراء";
}

export function PageSectionEditor({
  section,
  index,
  total,
  media,
  disabled,
  collapsed,
  isUploading,
  uploadError = () => null,
  onToggle,
  onUpdate,
  onUpload,
  onMove,
  onRemove,
}: {
  section: PageSection;
  index: number;
  total: number;
  media: Record<string, PageMedia>;
  disabled: boolean;
  collapsed: boolean;
  isUploading: (slot?: string) => boolean;
  uploadError?: (slot?: string) => string | null | undefined;
  onToggle: () => void;
  onUpdate: (section: PageSection) => void;
  onUpload: (
    file: File | undefined,
    type: PageMedia["type"],
    slot?: string,
  ) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const definition = componentDefinition(section.type);
  const [removeOpen, setRemoveOpen] = useState(false);
  const changeSettings = (next: Partial<PageSection["settings"]>) =>
    onUpdate({
      ...section,
      settings: { ...section.settings, ...next },
    } as PageSection);

  return (
    <article
      className={`${styles.sectionCard} ${collapsed ? styles.sectionCardCollapsed : ""}`}
    >
      <header className={styles.sectionHeader}>
        <div className={styles.sectionIdentity}>
          <span className={styles.sectionIcon}>
            <ComponentTypeIcon type={section.type} />
          </span>
          <div>
            <h3>
              {definition.label} · القسم {index + 1}
            </h3>
            <p className={styles.sectionSummary}>
              {sectionSummary(section, media)}
            </p>
          </div>
          <Badge variant={section.is_visible ? "success" : "warning"}>
            {section.is_visible ? "ظاهر" : "مخفي"}
          </Badge>
        </div>
        <div className={styles.sectionActions}>
          <IconButton
            type="button"
            label="نقل القسم للأعلى"
            variant="secondary"
            disabled={disabled || index === 0}
            onClick={() => onMove(index, -1)}
          >
            <PagesIcon name="up" />
          </IconButton>
          <IconButton
            type="button"
            label="نقل القسم للأسفل"
            variant="secondary"
            disabled={disabled || index === total - 1}
            onClick={() => onMove(index, 1)}
          >
            <PagesIcon name="down" />
          </IconButton>
          <IconButton
            type="button"
            label="إزالة القسم"
            variant="danger"
            disabled={disabled}
            onClick={() => setRemoveOpen(true)}
          >
            <PagesIcon name="trash" />
          </IconButton>
          <IconButton
            type="button"
            label={collapsed ? "توسيع القسم" : "طي القسم"}
            variant="secondary"
            aria-expanded={!collapsed}
            onClick={onToggle}
          >
            <PagesIcon name={collapsed ? "down" : "up"} />
          </IconButton>
        </div>
      </header>
      {!collapsed && (
        <fieldset className={styles.sectionBody} disabled={disabled}>
          <legend className="sr-only">تحرير قسم {definition.label}</legend>
          <div className={styles.fields}>
            {section.type === "hero" && (
              <HeroFields
                section={section}
                media={media}
                disabled={disabled}
                uploading={isUploading()}
                uploadError={uploadError}
                onUpdate={onUpdate}
                onUpload={onUpload}
              />
            )}
            {section.type === "rich_content" && (
              <RichFields section={section} onUpdate={onUpdate} />
            )}
            {section.type === "image" && (
              <ImageFields
                section={section}
                media={media}
                disabled={disabled}
                uploading={isUploading()}
                uploadError={uploadError}
                onUpdate={onUpdate}
                onUpload={onUpload}
              />
            )}
            {section.type === "image_text" && (
              <ImageTextFields
                section={section}
                media={media}
                disabled={disabled}
                uploading={isUploading()}
                uploadError={uploadError}
                onUpdate={onUpdate}
                onUpload={onUpload}
              />
            )}
            {section.type === "video" && (
              <VideoFields
                section={section}
                media={media}
                disabled={disabled}
                uploading={isUploading}
                uploadError={uploadError}
                onUpdate={onUpdate}
                onUpload={onUpload}
              />
            )}
            {section.type === "audio" && (
              <AudioFields
                section={section}
                media={media}
                disabled={disabled}
                uploading={isUploading()}
                uploadError={uploadError}
                onUpdate={onUpdate}
                onUpload={onUpload}
              />
            )}
            {section.type === "gallery" && (
              <GalleryFields
                section={section}
                media={media}
                disabled={disabled}
                uploading={isUploading}
                uploadError={uploadError}
                onUpdate={onUpdate}
                onUpload={onUpload}
              />
            )}
            {section.type === "cards" && (
              <CardsFields
                section={section}
                media={media}
                disabled={disabled}
                uploading={isUploading}
                uploadError={uploadError}
                onUpdate={onUpdate}
                onUpload={onUpload}
              />
            )}
            {section.type === "statistics" && (
              <StatisticsFields
                section={section}
                disabled={disabled}
                onUpdate={onUpdate}
              />
            )}
            {section.type === "downloads" && (
              <DownloadsFields
                section={section}
                media={media}
                disabled={disabled}
                uploading={isUploading}
                uploadError={uploadError}
                onUpdate={onUpdate}
                onUpload={onUpload}
              />
            )}
            {section.type === "faq" && (
              <FaqFields
                section={section}
                disabled={disabled}
                onUpdate={onUpdate}
              />
            )}
            {section.type === "cta" && (
              <CtaFields section={section} onUpdate={onUpdate} />
            )}
          </div>
          <details className={styles.settingsDisclosure}>
            <summary>المظهر والإعدادات</summary>
            <div className={styles.advancedBody}>
              <div className={styles.fieldGrid}>
                <SelectField
                  label="ألوان القسم"
                  value={section.settings.theme}
                  options={themes.map((value) => ({
                    value,
                    label: themeLabels[value],
                  }))}
                  onChange={(theme) => changeSettings({ theme })}
                />
                <SelectField
                  label="المسافة حول القسم"
                  value={section.settings.spacing}
                  options={spacing.map((value) => ({
                    value,
                    label: spacingLabels[value],
                  }))}
                  onChange={(value) => changeSettings({ spacing: value })}
                />
              </div>
              <label className={styles.visibilityControl}>
                <Checkbox
                  checked={section.is_visible}
                  onChange={(event) =>
                    onUpdate({
                      ...section,
                      is_visible: event.target.checked,
                    } as PageSection)
                  }
                />
                <span>
                  <strong>ظاهر في الصفحة العامة</strong>
                  <small>يمكن إخفاء القسم مع بقائه محفوظًا داخل المسودة.</small>
                </span>
              </label>
            </div>
          </details>
        </fieldset>
      )}
      <PagesConfirmDialog
        open={removeOpen}
        title="إزالة القسم من المسودة؟"
        confirmLabel="إزالة القسم"
        destructive
        onCancel={() => setRemoveOpen(false)}
        onConfirm={() => {
          setRemoveOpen(false);
          onRemove();
        }}
      >
        <p>
          سيُزال قسم «{definition.label}» من المسودة الحالية. لن يطبّق التغيير
          على الصفحة العامة قبل الحفظ والنشر.
        </p>
      </PagesConfirmDialog>
    </article>
  );
}

function ImageReferenceFields({
  value,
  onChange,
}: {
  value: { media_id: number; alt?: string | null | undefined };
  onChange: (next: { media_id: number; alt: string }) => void;
}) {
  return (
    <TextField
      label="النص البديل"
      value={value.alt ?? ""}
      maxLength={500}
      onChange={(alt) => onChange({ media_id: value.media_id, alt })}
    />
  );
}
function HeroFields({
  section,
  media,
  disabled,
  uploading,
  uploadError,
  onUpdate,
  onUpload,
}: {
  section: HeroSection;
  media: Record<string, PageMedia>;
  disabled: boolean;
  uploading: boolean;
  uploadError: (slot?: string) => string | null | undefined;
  onUpdate: (section: HeroSection) => void;
  onUpload: (
    file: File | undefined,
    type: PageMedia["type"],
    slot?: string,
  ) => void;
}) {
  const image = section.data.image
    ? media[String(section.data.image.media_id)]
    : undefined;
  const imageValue = section.data.image ?? { media_id: 0, alt: "" };
  return (
    <>
      <PagesChoiceField
        label="تخطيط الواجهة"
        value={section.data.variant}
        options={[
          {
            value: "centered",
            label: "في المنتصف",
            preview: <PagesHeroLayoutPreview layout="centered" />,
          },
          {
            value: "image_left",
            label: "صورة يسار",
            preview: <PagesHeroLayoutPreview layout="image_left" />,
          },
          {
            value: "image_right",
            label: "صورة يمين",
            preview: <PagesHeroLayoutPreview layout="image_right" />,
          },
          {
            value: "background_image",
            label: "صورة خلفية",
            preview: <PagesHeroLayoutPreview layout="background_image" />,
          },
        ]}
        onValueChange={(variant) =>
          onUpdate({ ...section, data: { ...section.data, variant } })
        }
      />
      <div className={styles.fieldGrid}>
        <TextField
          label="العنوان"
          value={section.data.title}
          onChange={(title) =>
            onUpdate({ ...section, data: { ...section.data, title } })
          }
        />
      </div>
      <TextAreaField
        label="الوصف"
        value={section.data.description ?? ""}
        onChange={(description) =>
          onUpdate({
            ...section,
            data: { ...section.data, description: description || null },
          })
        }
      />
      <MediaUploadField
        label="صورة الواجهة"
        kind="image"
        accept="image/jpeg,image/png,image/webp"
        guidance=""
        media={image}
        uploading={uploading}
        error={uploadError() ?? null}
        disabled={disabled}
        optional
        onFile={(file) => onUpload(file, "image")}
      />
      <ImageReferenceFields
        value={imageValue}
        onChange={(next) =>
          onUpdate({ ...section, data: { ...section.data, image: next } })
        }
      />
    </>
  );
}
function RichFields({
  section,
  onUpdate,
}: {
  section: RichContentSection;
  onUpdate: (section: RichContentSection) => void;
}) {
  return (
    <div>
      <p className={styles.helper}>اكتب المحتوى ونسّقه كما سيظهر للزائر.</p>
      <RichTextEditor
        value={section.data.html}
        onChange={(html) => onUpdate({ ...section, data: { html } })}
      />
    </div>
  );
}
function ImageFields({
  section,
  media,
  disabled,
  uploading,
  uploadError,
  onUpdate,
  onUpload,
}: {
  section: ImageSection;
  media: Record<string, PageMedia>;
  disabled: boolean;
  uploading: boolean;
  uploadError: (slot?: string) => string | null | undefined;
  onUpdate: (section: ImageSection) => void;
  onUpload: (
    file: File | undefined,
    type: PageMedia["type"],
    slot?: string,
  ) => void;
}) {
  return (
    <>
      <SelectField
        label="حجم الصورة"
        value={section.data.variant}
        options={[
          { value: "contained", label: "داخل المحتوى" },
          { value: "wide", label: "عريضة" },
          { value: "full_width", label: "بعرض كامل" },
        ]}
        onChange={(variant) =>
          onUpdate({ ...section, data: { ...section.data, variant } })
        }
      />
      <MediaUploadField
        label="الصورة"
        kind="image"
        accept="image/jpeg,image/png,image/webp"
        guidance=""
        media={media[String(section.data.image.media_id)]}
        uploading={uploading}
        error={uploadError() ?? null}
        disabled={disabled}
        onFile={(file) => onUpload(file, "image")}
      />
      <ImageReferenceFields
        value={section.data.image}
        onChange={(image) =>
          onUpdate({ ...section, data: { ...section.data, image } })
        }
      />
      <TextField
        label="تعليق الصورة"
        value={section.data.caption ?? ""}
        maxLength={1000}
        onChange={(caption) =>
          onUpdate({
            ...section,
            data: { ...section.data, caption: caption || null },
          })
        }
      />
    </>
  );
}
function ImageTextFields({
  section,
  media,
  disabled,
  uploading,
  uploadError,
  onUpdate,
  onUpload,
}: {
  section: ImageTextSection;
  media: Record<string, PageMedia>;
  disabled: boolean;
  uploading: boolean;
  uploadError: (slot?: string) => string | null | undefined;
  onUpdate: (section: ImageTextSection) => void;
  onUpload: (
    file: File | undefined,
    type: PageMedia["type"],
    slot?: string,
  ) => void;
}) {
  return (
    <>
      <SelectField
        label="موضع الصورة"
        value={section.data.variant}
        options={[
          { value: "image_left", label: "الصورة يسارًا" },
          { value: "image_right", label: "الصورة يمينًا" },
        ]}
        onChange={(variant) =>
          onUpdate({ ...section, data: { ...section.data, variant } })
        }
      />
      <TextField
        label="العنوان الاختياري"
        value={section.data.title ?? ""}
        onChange={(title) =>
          onUpdate({
            ...section,
            data: { ...section.data, title: title || null },
          })
        }
      />
      <RichTextEditor
        value={section.data.html}
        onChange={(html) =>
          onUpdate({ ...section, data: { ...section.data, html } })
        }
      />
      <MediaUploadField
        label="الصورة"
        kind="image"
        accept="image/jpeg,image/png,image/webp"
        guidance=""
        media={media[String(section.data.image.media_id)]}
        uploading={uploading}
        error={uploadError() ?? null}
        disabled={disabled}
        onFile={(file) => onUpload(file, "image")}
      />
      <ImageReferenceFields
        value={section.data.image}
        onChange={(image) =>
          onUpdate({ ...section, data: { ...section.data, image } })
        }
      />
    </>
  );
}
function VideoFields({
  section,
  media,
  disabled,
  uploading,
  uploadError,
  onUpdate,
  onUpload,
}: {
  section: VideoSection;
  media: Record<string, PageMedia>;
  disabled: boolean;
  uploading: (slot?: string) => boolean;
  uploadError: (slot?: string) => string | null | undefined;
  onUpdate: (section: VideoSection) => void;
  onUpload: (
    file: File | undefined,
    type: PageMedia["type"],
    slot?: string,
  ) => void;
}) {
  const poster = section.data.poster ?? { media_id: 0, alt: "" };
  return (
    <>
      <SelectField
        label="حجم الفيديو"
        value={section.data.variant}
        options={[
          { value: "contained", label: "داخل المحتوى" },
          { value: "wide", label: "عريض" },
          { value: "full_width", label: "بعرض كامل" },
        ]}
        onChange={(variant) =>
          onUpdate({ ...section, data: { ...section.data, variant } })
        }
      />
      <MediaUploadField
        label="ملف الفيديو"
        kind="video"
        accept="video/mp4,video/webm"
        guidance=""
        media={media[String(section.data.video.media_id)]}
        uploading={uploading()}
        error={uploadError() ?? null}
        disabled={disabled}
        onFile={(file) => onUpload(file, "video")}
      />
      <div className={styles.fieldGrid}>
        <TextField
          label="العنوان الاختياري"
          value={section.data.title ?? ""}
          onChange={(title) =>
            onUpdate({
              ...section,
              data: { ...section.data, title: title || null },
            })
          }
        />
        <TextField
          label="التعليق"
          value={section.data.caption ?? ""}
          maxLength={1000}
          onChange={(caption) =>
            onUpdate({
              ...section,
              data: { ...section.data, caption: caption || null },
            })
          }
        />
      </div>
      <MediaUploadField
        label="صورة الغلاف"
        kind="image"
        accept="image/jpeg,image/png,image/webp"
        guidance=""
        media={
          section.data.poster
            ? media[String(section.data.poster.media_id)]
            : undefined
        }
        uploading={uploading("poster")}
        error={uploadError("poster") ?? null}
        disabled={disabled}
        optional
        onFile={(file) => onUpload(file, "image", "poster")}
      />
      <ImageReferenceFields
        value={poster}
        onChange={(next) =>
          onUpdate({ ...section, data: { ...section.data, poster: next } })
        }
      />
    </>
  );
}
function AudioFields({
  section,
  media,
  disabled,
  uploading,
  uploadError,
  onUpdate,
  onUpload,
}: {
  section: AudioSection;
  media: Record<string, PageMedia>;
  disabled: boolean;
  uploading: boolean;
  uploadError: (slot?: string) => string | null | undefined;
  onUpdate: (section: AudioSection) => void;
  onUpload: (
    file: File | undefined,
    type: PageMedia["type"],
    slot?: string,
  ) => void;
}) {
  return (
    <>
      <MediaUploadField
        label="ملف الصوت"
        kind="audio"
        accept="audio/mpeg,audio/wav"
        guidance=""
        media={media[String(section.data.audio.media_id)]}
        uploading={uploading}
        error={uploadError() ?? null}
        disabled={disabled}
        onFile={(file) => onUpload(file, "audio")}
      />
      <TextField
        label="العنوان الاختياري"
        value={section.data.title ?? ""}
        onChange={(title) =>
          onUpdate({
            ...section,
            data: { ...section.data, title: title || null },
          })
        }
      />
      <TextAreaField
        label="الوصف"
        value={section.data.description ?? ""}
        onChange={(description) =>
          onUpdate({
            ...section,
            data: { ...section.data, description: description || null },
          })
        }
      />
    </>
  );
}

function GalleryFields({
  section,
  media,
  disabled,
  uploading,
  uploadError,
  onUpdate,
  onUpload,
}: {
  section: GallerySection;
  media: Record<string, PageMedia>;
  disabled: boolean;
  uploading: (slot?: string) => boolean;
  uploadError: (slot?: string) => string | null | undefined;
  onUpdate: (section: GallerySection) => void;
  onUpload: (
    file: File | undefined,
    type: PageMedia["type"],
    slot?: string,
  ) => void;
}) {
  const items = section.data.items;
  const update = (
    index: number,
    item: GallerySection["data"]["items"][number],
  ) =>
    onUpdate({
      ...section,
      data: {
        ...section.data,
        items: items.map((current, itemIndex) =>
          itemIndex === index ? item : current,
        ),
      },
    });
  return (
    <>
      <SelectField
        label="تخطيط المعرض"
        value={section.data.variant}
        options={[
          { value: "grid", label: "شبكة" },
          { value: "masonry", label: "شبكة متفاوتة" },
          { value: "carousel", label: "عارض متتابع" },
        ]}
        onChange={(variant) =>
          onUpdate({ ...section, data: { ...section.data, variant } })
        }
      />
      <div className={styles.repeatableList}>
        {items.map((item, index) => (
          <RepeatableItemShell
            key={item.id}
            label="صورة"
            index={index}
            summary={
              media[String(item.media_id)]?.name ?? item.caption ?? "صورة جديدة"
            }
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            disabled={disabled}
            defaultExpanded={!item.media_id}
            removeLabel="إزالة"
            onMoveUp={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: moveItem(items, index, -1) },
              })
            }
            onMoveDown={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: moveItem(items, index, 1) },
              })
            }
            onRemove={() =>
              onUpdate({
                ...section,
                data: {
                  ...section.data,
                  items: items.filter((_, itemIndex) => itemIndex !== index),
                },
              })
            }
          >
            <MediaUploadField
              label="صورة المعرض"
              kind="image"
              accept="image/jpeg,image/png,image/webp"
              guidance=""
              media={media[String(item.media_id)]}
              uploading={uploading(`gallery:${index}`)}
              error={uploadError(`gallery:${index}`) ?? null}
              disabled={disabled}
              onFile={(file) => onUpload(file, "image", `gallery:${index}`)}
            />
            <ImageReferenceFields
              value={item}
              onChange={(image) => update(index, { ...item, ...image })}
            />
            <TextField
              label="التعليق"
              value={item.caption ?? ""}
              maxLength={1000}
              onChange={(caption) =>
                update(index, { ...item, caption: caption || null })
              }
            />
          </RepeatableItemShell>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || items.length >= 50}
        onClick={() =>
          onUpdate({
            ...section,
            data: {
              ...section.data,
              items: [
                ...items,
                { id: createId(), media_id: 0, alt: "", caption: null },
              ],
            },
          })
        }
      >
        <PagesIcon name="add" />
        إضافة صورة
      </Button>
    </>
  );
}

function CardsFields({
  section,
  media,
  disabled,
  uploading,
  uploadError,
  onUpdate,
  onUpload,
}: {
  section: CardsSection;
  media: Record<string, PageMedia>;
  disabled: boolean;
  uploading: (slot?: string) => boolean;
  uploadError: (slot?: string) => string | null | undefined;
  onUpdate: (section: CardsSection) => void;
  onUpload: (
    file: File | undefined,
    type: PageMedia["type"],
    slot?: string,
  ) => void;
}) {
  const items = section.data.items;
  const update = (index: number, item: CardsSection["data"]["items"][number]) =>
    onUpdate({
      ...section,
      data: {
        ...section.data,
        items: items.map((current, itemIndex) =>
          itemIndex === index ? item : current,
        ),
      },
    });
  return (
    <>
      <div className={styles.fieldGrid}>
        <SelectField
          label="تخطيط البطاقات"
          value={section.data.variant}
          options={[
            { value: "grid_2", label: "عمودان" },
            { value: "grid_3", label: "ثلاثة أعمدة" },
            { value: "grid_4", label: "أربعة أعمدة" },
          ]}
          onChange={(variant) =>
            onUpdate({ ...section, data: { ...section.data, variant } })
          }
        />
        <TextField
          label="عنوان القسم"
          value={section.data.title ?? ""}
          onChange={(title) =>
            onUpdate({
              ...section,
              data: { ...section.data, title: title || null },
            })
          }
        />
      </div>
      <TextAreaField
        label="وصف القسم"
        value={section.data.description ?? ""}
        onChange={(description) =>
          onUpdate({
            ...section,
            data: { ...section.data, description: description || null },
          })
        }
      />
      <div className={styles.repeatableList}>
        {items.map((item, index) => (
          <RepeatableItemShell
            key={item.id}
            label="بطاقة"
            index={index}
            summary={item.title}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            disabled={disabled}
            defaultExpanded={!item.title}
            removeLabel="إزالة"
            onMoveUp={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: reorder(items, index, -1) },
              })
            }
            onMoveDown={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: reorder(items, index, 1) },
              })
            }
            onRemove={() =>
              onUpdate({
                ...section,
                data: {
                  ...section.data,
                  items: items.filter((_, itemIndex) => itemIndex !== index),
                },
              })
            }
          >
            <TextField
              label="عنوان البطاقة"
              value={item.title}
              onChange={(title) => update(index, { ...item, title })}
            />
            <TextAreaField
              label="الوصف"
              value={item.description ?? ""}
              onChange={(description) =>
                update(index, { ...item, description: description || null })
              }
            />
            <MediaUploadField
              label="صورة البطاقة"
              kind="image"
              accept="image/jpeg,image/png,image/webp"
              guidance=""
              media={
                item.image ? media[String(item.image.media_id)] : undefined
              }
              uploading={uploading(`cards:${index}`)}
              error={uploadError(`cards:${index}`) ?? null}
              disabled={disabled}
              optional
              onFile={(file) => onUpload(file, "image", `cards:${index}`)}
            />
            {item.image && (
              <ImageReferenceFields
                value={item.image}
                onChange={(image) => update(index, { ...item, image })}
              />
            )}
            <div className={styles.fieldGrid}>
              <TextField
                label="نص الإجراء"
                value={item.action?.label ?? ""}
                onChange={(label) =>
                  update(index, {
                    ...item,
                    action:
                      label || item.action?.url
                        ? { label, url: item.action?.url ?? "" }
                        : null,
                  })
                }
              />
              <TextField
                label="رابط الإجراء"
                value={item.action?.url ?? ""}
                onChange={(url) =>
                  update(index, {
                    ...item,
                    action:
                      url || item.action?.label
                        ? { label: item.action?.label ?? "", url }
                        : null,
                  })
                }
              />
            </div>
          </RepeatableItemShell>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || items.length >= 24}
        onClick={() =>
          onUpdate({
            ...section,
            data: {
              ...section.data,
              items: [
                ...items,
                {
                  id: createId(),
                  title: "",
                  description: null,
                  image: null,
                  action: null,
                },
              ],
            },
          })
        }
      >
        <PagesIcon name="add" />
        إضافة بطاقة
      </Button>
    </>
  );
}

function StatisticsFields({
  section,
  disabled,
  onUpdate,
}: {
  section: StatisticsSection;
  disabled: boolean;
  onUpdate: (section: StatisticsSection) => void;
}) {
  const items = section.data.items;
  const update = (
    index: number,
    item: StatisticsSection["data"]["items"][number],
  ) =>
    onUpdate({
      ...section,
      data: {
        ...section.data,
        items: items.map((current, itemIndex) =>
          itemIndex === index ? item : current,
        ),
      },
    });
  return (
    <>
      <div className={styles.fieldGrid}>
        <SelectField
          label="التخطيط"
          value={section.data.variant}
          options={[
            { value: "grid", label: "شبكة" },
            { value: "highlights", label: "أرقام بارزة" },
          ]}
          onChange={(variant) =>
            onUpdate({ ...section, data: { ...section.data, variant } })
          }
        />
        <TextField
          label="عنوان القسم"
          value={section.data.title ?? ""}
          onChange={(title) =>
            onUpdate({
              ...section,
              data: { ...section.data, title: title || null },
            })
          }
        />
      </div>
      <div className={styles.repeatableList}>
        {items.map((item, index) => (
          <RepeatableItemShell
            key={item.id}
            label="إحصائية"
            index={index}
            summary={
              item.value && item.label
                ? `${item.value} — ${item.label}`
                : "إحصائية جديدة"
            }
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            disabled={disabled}
            defaultExpanded={!item.value}
            removeLabel="إزالة"
            onMoveUp={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: reorder(items, index, -1) },
              })
            }
            onMoveDown={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: reorder(items, index, 1) },
              })
            }
            onRemove={() =>
              onUpdate({
                ...section,
                data: {
                  ...section.data,
                  items: items.filter((_, itemIndex) => itemIndex !== index),
                },
              })
            }
          >
            <div className={styles.fieldGrid}>
              <TextField
                label="القيمة"
                value={item.value}
                maxLength={120}
                onChange={(value) => update(index, { ...item, value })}
              />
              <TextField
                label="التسمية"
                value={item.label}
                onChange={(label) => update(index, { ...item, label })}
              />
            </div>
            <TextAreaField
              label="الوصف"
              value={item.description ?? ""}
              maxLength={1000}
              onChange={(description) =>
                update(index, { ...item, description: description || null })
              }
            />
          </RepeatableItemShell>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || items.length >= 24}
        onClick={() =>
          onUpdate({
            ...section,
            data: {
              ...section.data,
              items: [
                ...items,
                { id: createId(), value: "", label: "", description: null },
              ],
            },
          })
        }
      >
        <PagesIcon name="add" />
        إضافة إحصائية
      </Button>
    </>
  );
}

function DownloadsFields({
  section,
  media,
  disabled,
  uploading,
  uploadError,
  onUpdate,
  onUpload,
}: {
  section: DownloadsSection;
  media: Record<string, PageMedia>;
  disabled: boolean;
  uploading: (slot?: string) => boolean;
  uploadError: (slot?: string) => string | null | undefined;
  onUpdate: (section: DownloadsSection) => void;
  onUpload: (
    file: File | undefined,
    type: PageMedia["type"],
    slot?: string,
  ) => void;
}) {
  const items = section.data.items;
  const update = (
    index: number,
    item: DownloadsSection["data"]["items"][number],
  ) =>
    onUpdate({
      ...section,
      data: {
        ...section.data,
        items: items.map((current, itemIndex) =>
          itemIndex === index ? item : current,
        ),
      },
    });
  return (
    <>
      <div className={styles.fieldGrid}>
        <SelectField
          label="التخطيط"
          value={section.data.variant}
          options={[
            { value: "list", label: "قائمة" },
            { value: "cards", label: "بطاقات" },
          ]}
          onChange={(variant) =>
            onUpdate({ ...section, data: { ...section.data, variant } })
          }
        />
        <TextField
          label="عنوان القسم"
          value={section.data.title ?? ""}
          onChange={(title) =>
            onUpdate({
              ...section,
              data: { ...section.data, title: title || null },
            })
          }
        />
      </div>
      <TextAreaField
        label="وصف القسم"
        value={section.data.description ?? ""}
        onChange={(description) =>
          onUpdate({
            ...section,
            data: { ...section.data, description: description || null },
          })
        }
      />
      <div className={styles.repeatableList}>
        {items.map((item, index) => (
          <RepeatableItemShell
            key={item.id}
            label="ملف"
            index={index}
            summary={
              item.label || media[String(item.media_id)]?.name || "ملف جديد"
            }
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            disabled={disabled}
            defaultExpanded={!item.media_id}
            removeLabel="إزالة"
            onMoveUp={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: reorder(items, index, -1) },
              })
            }
            onMoveDown={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: reorder(items, index, 1) },
              })
            }
            onRemove={() =>
              onUpdate({
                ...section,
                data: {
                  ...section.data,
                  items: items.filter((_, itemIndex) => itemIndex !== index),
                },
              })
            }
          >
            <MediaUploadField
              label="المستند"
              kind="document"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              guidance=""
              media={media[String(item.media_id)]}
              uploading={uploading(`downloads:${index}`)}
              error={uploadError(`downloads:${index}`) ?? null}
              disabled={disabled}
              onFile={(file) =>
                onUpload(file, "document", `downloads:${index}`)
              }
            />
            <TextField
              label="اسم الملف للزائر"
              value={item.label}
              onChange={(label) => update(index, { ...item, label })}
            />
            <TextAreaField
              label="الوصف"
              value={item.description ?? ""}
              maxLength={1000}
              onChange={(description) =>
                update(index, { ...item, description: description || null })
              }
            />
          </RepeatableItemShell>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || items.length >= 50}
        onClick={() =>
          onUpdate({
            ...section,
            data: {
              ...section.data,
              items: [
                ...items,
                { id: createId(), media_id: 0, label: "", description: null },
              ],
            },
          })
        }
      >
        <PagesIcon name="add" />
        إضافة ملف
      </Button>
    </>
  );
}

function FaqFields({
  section,
  disabled,
  onUpdate,
}: {
  section: FaqSection;
  disabled: boolean;
  onUpdate: (section: FaqSection) => void;
}) {
  const items = section.data.items;
  const update = (index: number, item: FaqSection["data"]["items"][number]) =>
    onUpdate({
      ...section,
      data: {
        ...section.data,
        items: items.map((current, itemIndex) =>
          itemIndex === index ? item : current,
        ),
      },
    });
  return (
    <>
      <div className={styles.fieldGrid}>
        <SelectField
          label="طريقة العرض"
          value={section.data.variant}
          options={[
            { value: "accordion", label: "قائمة قابلة للفتح" },
            { value: "stacked", label: "إجابات ظاهرة" },
          ]}
          onChange={(variant) =>
            onUpdate({ ...section, data: { ...section.data, variant } })
          }
        />
        <TextField
          label="عنوان القسم"
          value={section.data.title ?? ""}
          onChange={(title) =>
            onUpdate({
              ...section,
              data: { ...section.data, title: title || null },
            })
          }
        />
      </div>
      <TextAreaField
        label="وصف القسم"
        value={section.data.description ?? ""}
        onChange={(description) =>
          onUpdate({
            ...section,
            data: { ...section.data, description: description || null },
          })
        }
      />
      <div className={styles.repeatableList}>
        {items.map((item, index) => (
          <RepeatableItemShell
            key={item.id}
            label="سؤال"
            index={index}
            summary={item.question}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            disabled={disabled}
            defaultExpanded={!item.question}
            removeLabel="إزالة"
            onMoveUp={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: reorder(items, index, -1) },
              })
            }
            onMoveDown={() =>
              onUpdate({
                ...section,
                data: { ...section.data, items: reorder(items, index, 1) },
              })
            }
            onRemove={() =>
              onUpdate({
                ...section,
                data: {
                  ...section.data,
                  items: items.filter((_, itemIndex) => itemIndex !== index),
                },
              })
            }
          >
            <TextField
              label="السؤال"
              value={item.question}
              maxLength={500}
              onChange={(question) => update(index, { ...item, question })}
            />
            <div>
              <p className={styles.helper}>الإجابة</p>
              <RichTextEditor
                value={item.answer}
                onChange={(answer) => update(index, { ...item, answer })}
              />
            </div>
          </RepeatableItemShell>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || items.length >= 50}
        onClick={() =>
          onUpdate({
            ...section,
            data: {
              ...section.data,
              items: [
                ...items,
                { id: createId(), question: "", answer: "<p></p>" },
              ],
            },
          })
        }
      >
        <PagesIcon name="add" />
        إضافة سؤال
      </Button>
    </>
  );
}

function CtaFields({
  section,
  onUpdate,
}: {
  section: CtaSection;
  onUpdate: (section: CtaSection) => void;
}) {
  const updateAction = (
    key: "primary_action" | "secondary_action",
    field: "label" | "url",
    value: string,
  ) => {
    const current = section.data[key] ?? { label: "", url: "" };
    const next = { ...current, [field]: value };
    onUpdate({
      ...section,
      data: {
        ...section.data,
        [key]:
          key === "secondary_action" && !next.label && !next.url ? null : next,
      },
    });
  };
  return (
    <>
      <SelectField
        label="التخطيط"
        value={section.data.variant}
        options={[
          { value: "banner", label: "شريط" },
          { value: "centered", label: "محتوى في المنتصف" },
          { value: "split", label: "محتوى منقسم" },
        ]}
        onChange={(variant) =>
          onUpdate({ ...section, data: { ...section.data, variant } })
        }
      />
      <TextField
        label="العنوان"
        value={section.data.title}
        onChange={(title) =>
          onUpdate({ ...section, data: { ...section.data, title } })
        }
      />
      <TextAreaField
        label="الوصف"
        value={section.data.description ?? ""}
        onChange={(description) =>
          onUpdate({
            ...section,
            data: { ...section.data, description: description || null },
          })
        }
      />
      <section className={styles.itemCard}>
        <div className={styles.itemBody}>
          <h4>الإجراء الأساسي</h4>
          <div className={styles.fieldGrid}>
            <TextField
              label="نص الزر"
              value={section.data.primary_action.label}
              onChange={(value) =>
                updateAction("primary_action", "label", value)
              }
            />
            <TextField
              label="الرابط"
              value={section.data.primary_action.url}
              onChange={(value) => updateAction("primary_action", "url", value)}
            />
          </div>
        </div>
      </section>
      <section className={styles.itemCard}>
        <div className={styles.itemBody}>
          <h4>الإجراء الثانوي</h4>
          <div className={styles.fieldGrid}>
            <TextField
              label="نص الزر"
              value={section.data.secondary_action?.label ?? ""}
              onChange={(value) =>
                updateAction("secondary_action", "label", value)
              }
            />
            <TextField
              label="الرابط"
              value={section.data.secondary_action?.url ?? ""}
              onChange={(value) =>
                updateAction("secondary_action", "url", value)
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element -- Gallery URLs are runtime backend media and may use unconfigured hosts. */
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  GalleryMediaListQuery,
  GalleryMediaPaginator,
  GalleryMediaItem,
} from "../../domain/gallery-media.contracts";
import { deleteGalleryMediaAction } from "../../application/gallery-media.actions";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  FilterPanel,
  InlineError,
  Select,
} from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import {
  GalleryMediaPreview,
  formatFileSize,
  formatMediaFileName,
} from "./gallery-media-preview";
import styles from "../gallery-media.module.css";

function queryHref(query: GalleryMediaListQuery, page: number) {
  const params = new URLSearchParams();
  if (query.type) params.set("type", query.type);
  params.set("page", String(page));
  return `/dashboard/gallery-media?${params}`;
}

export function GalleryMediaFilters({
  type,
}: {
  type?: GalleryMediaListQuery["type"];
}) {
  const [value, setValue] = useState(type ?? "");

  return (
    <FilterPanel
      title="تصفية معرض الوسائط"
      description="اعرض الصور أو الفيديوهات للوصول للمحتوى أسرع."
    >
      <form action="/dashboard/gallery-media" className={styles.filters}>
        <label className={styles.filterField}>
          <span>نوع الوسائط</span>
          <Select
            name="type"
            value={value}
            autoSubmit
            aria-label="نوع الوسائط"
            options={[
              { value: "", label: "كل الوسائط" },
              { value: "image", label: "الصور فقط" },
              { value: "video", label: "الفيديوهات فقط" },
            ]}
            onValueChange={setValue}
          />
        </label>
        {value && (
          <div className={styles.filterActions}>
            <Link
              href="/dashboard/gallery-media"
              className="ui-button ui-button--secondary ui-focus"
            >
              إعادة الضبط
            </Link>
          </div>
        )}
      </form>
    </FilterPanel>
  );
}

function MediaThumbnail({ item }: { item: GalleryMediaItem }) {
  const [broken, setBroken] = useState(false);
  const available = Boolean(item.url) && !broken;

  return (
    <div className={styles.thumbnailFrame}>
      {available && item.type === "image" ? (
        <img
          className={styles.preview}
          src={item.url ?? undefined}
          alt={`صورة ${item.original_name}`}
          onError={() => setBroken(true)}
        />
      ) : available && item.type === "video" ? (
        <video
          className={styles.preview}
          src={item.url ?? undefined}
          muted
          playsInline
          preload="metadata"
          aria-label={`صورة مصغرة للفيديو ${item.original_name}`}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            if (Number.isFinite(video.duration) && video.duration > 0) {
              video.currentTime = Math.min(0.15, video.duration / 2);
            }
          }}
          onError={() => setBroken(true)}
        />
      ) : (
        <div className={styles.placeholder}>
          {item.type === "video" ? "تعذّر تحميل الفيديو" : "صورة غير متاحة"}
        </div>
      )}
      <span className={styles.mediaKind} aria-hidden="true">
        {item.type === "video" ? "▶" : "▧"}
      </span>
    </div>
  );
}

function MediaFileName({ item }: { item: GalleryMediaItem }) {
  const fileName = formatMediaFileName(item.original_name);
  return (
    <div className={styles.fileNameBlock} title={item.original_name}>
      <strong className={styles.name}>{fileName.baseName}</strong>
      {fileName.extension && (
        <span className={styles.extension} dir="ltr">
          {fileName.extension}
        </span>
      )}
    </div>
  );
}

export function GalleryMediaGrid({
  paginator,
  query,
}: {
  paginator: GalleryMediaPaginator;
  query: GalleryMediaListQuery;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<GalleryMediaItem>();
  const [preview, setPreview] = useState<GalleryMediaItem>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const pages = Math.max(1, Math.ceil(paginator.total / paginator.per_page));
  const remove = () => {
    if (!selected || pending) return;
    startTransition(async () => {
      const result = await deleteGalleryMediaAction(selected.id);
      if (!result.success) {
        setError(result.message);
        if (result.message.includes("لم يعد")) {
          setSelected(undefined);
          router.refresh();
        }
        return;
      }
      setSelected(undefined);
      router.refresh();
    });
  };
  return (
    <div className={styles.stack}>
      {error && <InlineError>{error}</InlineError>}
      {paginator.data.length === 0 ? (
        <Card>
          <EmptyState
            title="لا توجد وسائط بعد"
            description="ارفع صورة أو فيديو لإضافته إلى معرض الوسائط."
          />
        </Card>
      ) : (
        <>
          <div className={styles.grid}>
            {paginator.data.map((item) => (
              <Card key={item.id} className={styles.card ?? ""}>
                <MediaThumbnail item={item} />
                <div className={styles.meta}>
                  <div className={styles.cardHeading}>
                    <MediaFileName item={item} />
                    <Badge
                      variant={item.type === "image" ? "success" : "warning"}
                    >
                      {item.type === "image" ? "صورة" : "فيديو"}
                    </Badge>
                  </div>
                  <small className={styles.fileMeta}>
                    <span>{formatFileSize(item.size)}</span>
                    <span dir="ltr">{item.mime_type}</span>
                  </small>
                </div>
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => setPreview(item)}>
                    معاينة
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setError(undefined);
                      setSelected(item);
                    }}
                  >
                    حذف
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <nav
            className={styles.pagination}
            aria-label="ترقيم صفحات معرض الوسائط"
          >
            <a
              className="ui-button ui-button--secondary ui-focus"
              aria-disabled={paginator.current_page <= 1}
              href={queryHref(query, Math.max(1, paginator.current_page - 1))}
            >
              السابق
            </a>
            <span>
              صفحة {formatArabicNumber(paginator.current_page)} من{" "}
              {formatArabicNumber(pages)}
            </span>
            <a
              className="ui-button ui-button--secondary ui-focus"
              aria-disabled={paginator.current_page >= pages}
              href={queryHref(
                query,
                Math.min(pages, paginator.current_page + 1),
              )}
            >
              التالي
            </a>
          </nav>
        </>
      )}
      {preview && (
        <GalleryMediaPreview
          item={preview}
          open
          onOpenChange={(open) => {
            if (!open) setPreview(undefined);
          }}
        />
      )}
      <ConfirmDialog
        open={selected !== undefined}
        onOpenChange={(open) => {
          if (!open && !pending) setSelected(undefined);
        }}
        title="حذف ملف من المعرض"
        confirmLabel="حذف الملف"
        destructive
        onConfirm={remove}
        confirmLoading={pending}
      >
        {selected && (
          <p>
            سيتم حذف «{selected.original_name}» نهائيًا. لا يمكن التراجع عن ذلك.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}

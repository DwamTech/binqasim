import type { ApiFailure } from "@/core/api/server-api-client";

export const galleryMediaTypes = ["image", "video"] as const;
export type GalleryMediaType = (typeof galleryMediaTypes)[number];

export type GalleryMediaItem = {
  id: number;
  type: GalleryMediaType;
  /** Resolved server-side before this value reaches presentation components. */
  url?: string | null | undefined;
  path?: string | null | undefined;
  original_name: string;
  mime_type: string;
  size: number;
  uploaded_by?: number | null | undefined;
};

export type GalleryMediaPaginator = {
  current_page: number;
  data: GalleryMediaItem[];
  per_page: number;
  total: number;
};

export type GalleryMediaListQuery = {
  type?: GalleryMediaType;
  page?: number;
  per_page?: number;
};

export type GalleryMediaUploadInput = { files: File[] };
export type GalleryMediaApiError = ApiFailure["error"];
export type GalleryMediaFileValidationError = Record<string, string[]>;

export type GalleryMediaUploadState =
  "pending" | "uploading" | "success" | "failed";

export type GalleryMediaMutationResult =
  | { success: true; message: string; fieldErrors?: undefined }
  | {
      success: false;
      message: string;
      fieldErrors?: GalleryMediaFileValidationError;
    };

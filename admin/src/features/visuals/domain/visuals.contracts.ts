import type { ApiFailure } from "@/core/api/server-api-client";

export const visualTypes = ["upload", "link"] as const;
export type VisualType = (typeof visualTypes)[number];
export type VisualIdentifier = string | number;

export type VisualSection = {
  id: VisualIdentifier;
  name: string;
  slug?: string | undefined;
  module?: string | null | undefined;
  description?: string | null | undefined;
  is_active?: boolean | undefined;
  user_id?: VisualIdentifier | undefined;
};

export type Visual = {
  id: VisualIdentifier;
  title: string;
  type: VisualType;
  description?: string | null | undefined;
  file_path?: string | null | undefined;
  file?: string | null | undefined;
  url?: string | null | undefined;
  thumbnail?: string | null | undefined;
  section?: VisualSection | null | undefined;
  keywords?: string | null | undefined;
  rating?: number | null | undefined;
  views_count?: number | undefined;
  created_at?: string | null | undefined;
  updated_at?: string | null | undefined;
};

export type VisualListItem = Visual;
export type VisualDetail = Visual;

export type VisualPaginator = {
  current_page: number;
  data: VisualListItem[];
  per_page: number;
  total: number;
};

export type VisualListQuery = {
  section_id?: number | undefined;
  author?: number | undefined;
  type?: VisualType | undefined;
  page?: number | undefined;
};

export type VisualFile = File;

export type CreateVisualInput = {
  title: string;
  description?: string;
  type: VisualType;
  file?: VisualFile | undefined;
  url?: string | undefined;
  thumbnail?: VisualFile | undefined;
  section_id?: number | undefined;
  keywords?: string | undefined;
  rating?: number | undefined;
};

export type UpdateVisualInput = CreateVisualInput;
export type VisualApiError = ApiFailure["error"];

export type VisualMutationResult =
  | { success: true; id?: VisualIdentifier | undefined; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]> | undefined;
    };

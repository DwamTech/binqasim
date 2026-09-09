export type LaravelValidationErrors = Record<string, string[]>;

export type LaravelPaginator<T> = {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  [key: string]: unknown;
};

export type ApiSuccessMessage = { message: string };

export type AdminSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AdminLoginResponse = ApiSuccessMessage & {
  admin: AdminSummary;
  token: string;
  token_type: "Bearer";
};

export type PermissionCatalogItem = {
  key: string;
  label?: string;
  [key: string]: unknown;
};

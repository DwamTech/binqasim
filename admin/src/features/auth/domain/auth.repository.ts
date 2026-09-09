import type {
  AdminSessionResult,
  AdminSummary,
  LoginCredentials,
} from "./auth.contracts";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AdminSessionResult>;
  logout(token: string): Promise<void>;
  getCurrentAdmin(token: string): Promise<AdminSummary>;
}

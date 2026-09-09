import { describe, expect, it, vi } from "vitest";

import { getCurrentAdmin } from "./get-current-admin";
import { loginAdmin } from "./login-admin";
import { logoutAdmin } from "./logout-admin";

const admin = {
  id: "1",
  name: "Admin",
  email: "admin@example.com",
  role: "admin" as const,
};
describe("auth use cases", () => {
  it("keeps the Sanctum token within the server repository boundary", async () => {
    const repository = {
      login: vi.fn().mockResolvedValue({ admin, token: "token" }),
      logout: vi.fn(),
      getCurrentAdmin: vi.fn().mockResolvedValue(admin),
    };
    await expect(
      loginAdmin(repository, { identity: "admin", password: "secret" }),
    ).resolves.toMatchObject({ ok: true });
    await getCurrentAdmin(repository, "token");
    await logoutAdmin(repository, "token");
    expect(repository.logout).toHaveBeenCalledWith("token");
  });
});

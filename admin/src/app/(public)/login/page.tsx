import { requireGuest } from "@/server/dal/app-auth-guards";

import { LoginPageView } from "./_components/login-page-view";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await requireGuest();

  return <LoginPageView />;
}

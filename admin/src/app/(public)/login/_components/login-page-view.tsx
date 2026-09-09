"use client";

import { LoginPageView as PresentationLoginPageView } from "@/features/auth/presentation/components/login-page-view";
import { createBffLoginSubmitHandler } from "./login-bff.client";
import { navigateToDashboard } from "./login-navigation.client";

export function LoginPageView() {
  const submitLogin = createBffLoginSubmitHandler(navigateToDashboard);

  return <PresentationLoginPageView onSubmit={submitLogin} />;
}

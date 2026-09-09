import type { Metadata } from "next";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import { AccountManagementView } from "./_components/account-management-view";

export const metadata: Metadata = {
  title: dashboardCopy.common.account,
  description: "تحديث بيانات حساب لوحة التحكم وكلمة المرور.",
};

export default function AccountPage() {
  return <AccountManagementView />;
}

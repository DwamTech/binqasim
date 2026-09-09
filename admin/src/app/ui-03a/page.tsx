import { notFound } from "next/navigation";

import { serverEnv } from "@/core/env/server";

import { Ui03aQaHarness } from "./_components/ui-03a-qa-harness";
import { isUi03aQaRouteAvailable } from "./qa-route-availability";

export default function Ui03aQaPage() {
  if (!isUi03aQaRouteAvailable(serverEnv.NODE_ENV)) notFound();

  return <Ui03aQaHarness />;
}

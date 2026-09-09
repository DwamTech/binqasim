"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  PagesUnsavedNavigationGuardController,
  type PagesPendingNavigation,
} from "./pages-unsaved-navigation-guard.core";

export function usePagesUnsavedNavigationGuard({
  dirty,
  navigate,
}: {
  dirty: boolean;
  navigate: (href: string) => void;
}) {
  const navigateRef = useRef(navigate);
  const controllerRef = useRef<PagesUnsavedNavigationGuardController | null>(
    null,
  );
  const [pending, setPending] = useState<PagesPendingNavigation | null>(null);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    const controller = new PagesUnsavedNavigationGuardController({
      document,
      navigate: (href) => navigateRef.current(href),
      onPendingChange: setPending,
      window,
    });
    controllerRef.current = controller;

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.setDirty(dirty);
  }, [dirty]);

  const requestNavigation = useCallback(
    (href: string) => {
      const controller = controllerRef.current;
      if (controller !== null) controller.requestNavigation(href);
      else if (!dirty) navigateRef.current(href);
    },
    [dirty],
  );

  const stay = useCallback(() => controllerRef.current?.stay(), []);
  const discard = useCallback(() => controllerRef.current?.discard(), []);

  return {
    discard,
    hasPendingNavigation: pending !== null,
    requestNavigation,
    stay,
  };
}

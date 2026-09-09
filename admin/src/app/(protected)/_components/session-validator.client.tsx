"use client";

import { useEffect } from "react";

import {
  authChannelName,
  createSessionValidationCoordinator,
  validationIntervalMs,
} from "./session-validator.core";

/** Client coordinator only observes the BFF; the Sanctum token is HttpOnly. */
export function SessionValidator({ onInvalid }: { onInvalid: () => void }) {
  useEffect(() => {
    const channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(authChannelName);
    const coordinator = createSessionValidationCoordinator({
      now: Date.now,
      validate: async () => {
        const response = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
        });
        return response.status;
      },
      onInvalid,
      broadcastInvalidation: () => channel?.postMessage("logout"),
    });
    channel?.addEventListener("message", (event: MessageEvent<unknown>) => {
      if (event.data === "logout") {
        coordinator.stop();
        onInvalid();
      }
    });
    const interval = window.setInterval(
      coordinator.validate,
      validationIntervalMs,
    );
    window.addEventListener("focus", coordinator.checkIfStale);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") coordinator.checkIfStale();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      coordinator.stop();
      window.clearInterval(interval);
      window.removeEventListener("focus", coordinator.checkIfStale);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      channel?.close();
    };
  }, [onInvalid]);
  return null;
}

export function broadcastLogout(): void {
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(authChannelName);
    channel.postMessage("logout");
    channel.close();
  }
}

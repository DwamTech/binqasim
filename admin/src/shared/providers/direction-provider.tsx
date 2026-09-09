"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Direction } from "@/design-system/theme/theme.types";

const DirectionContext = createContext<Direction>("rtl");

export function DirectionProvider({
  children,
  direction = "rtl",
}: {
  children: ReactNode;
  direction?: Direction;
}) {
  return (
    <DirectionContext.Provider value={direction}>
      <div dir={direction}>{children}</div>
    </DirectionContext.Provider>
  );
}

export const useDirection = () => useContext(DirectionContext);

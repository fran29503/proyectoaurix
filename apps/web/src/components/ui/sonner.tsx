"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/providers/theme-provider";

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme as "light" | "dark"}
      position="bottom-right"
      toastOptions={{
        style: {
          borderRadius: "12px",
          fontSize: "13px",
        },
        classNames: {
          success: "!bg-emerald-50 !text-emerald-900 !border-emerald-200 dark:!bg-emerald-500/15 dark:!text-emerald-300 dark:!border-emerald-500/30",
          error: "!bg-red-50 !text-red-900 !border-red-200 dark:!bg-red-500/15 dark:!text-red-300 dark:!border-red-500/30",
          info: "!bg-blue-50 !text-blue-900 !border-blue-200 dark:!bg-blue-500/15 dark:!text-blue-300 dark:!border-blue-500/30",
          warning: "!bg-amber-50 !text-amber-900 !border-amber-200 dark:!bg-amber-500/15 dark:!text-amber-300 dark:!border-amber-500/30",
        },
      }}
      richColors
      closeButton
    />
  );
}

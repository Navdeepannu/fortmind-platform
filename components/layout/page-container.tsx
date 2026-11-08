import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Main-page width inside the workspace; app chrome stays outside this boundary. */
export function PageContainer({
  children,
  size = "standard",
}: {
  children: ReactNode;
  size?: "standard" | "compact";
}) {
  return (
    <div data-ui="page-gutters" className="w-full min-w-0 px-(--layout-gutter)">
      <div
        data-ui="page-container"
        data-layout-size={size}
        className={cn(
          "mx-auto w-full min-w-0 max-w-(--layout-content-max)",
          size === "compact" && "[--layout-content-max:var(--layout-content-compact)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

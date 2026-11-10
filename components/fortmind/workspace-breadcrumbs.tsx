"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  platformBreadcrumbs,
  settingsBreadcrumbs,
  type NavigationCrumb,
} from "@/lib/workspace-breadcrumbs";

function TopBarBreadcrumbs({ items }: { items: NavigationCrumb[] }) {
  return (
    <nav
      data-ui="topbar-breadcrumbs"
      aria-label="Breadcrumb"
      className="min-w-0 max-w-full"
    >
      <ol className="flex min-w-0 max-w-full items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-label">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li
              key={`${index}-${item.label}`}
              className={cn(
                "flex min-w-0 items-center gap-1.5",
                !current && "shrink-0",
                index === 0 && items.length > 2 && "max-sm:hidden",
              )}
            >
              {index > 0 && (
                <ChevronRight
                  aria-hidden="true"
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground/55",
                    index === 1 && items.length > 2 && "max-sm:hidden",
                  )}
                />
              )}
              {item.href && !current ? (
                <Link
                  href={item.href}
                  className="min-w-0 truncate rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  title={item.label}
                  className={cn(
                    "min-w-0 truncate",
                    current ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PlatformTopBarBreadcrumbs() {
  const pathname = usePathname();
  return <TopBarBreadcrumbs items={platformBreadcrumbs(pathname)} />;
}

export function SettingsTopBarBreadcrumbs() {
  const pathname = usePathname();
  return <TopBarBreadcrumbs items={settingsBreadcrumbs(pathname)} />;
}

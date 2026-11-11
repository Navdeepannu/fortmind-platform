"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/components/fortmind/workspace-shell";

const groups = [
  {
    label: "FortCases",
    items: [
      { title: "Investigations", href: "/settings/fortcases/investigations" },
      { title: "Alerts", href: "/settings/fortcases/alerts" },
      { title: "Escalation", href: "/settings/fortcases/escalation" },
      { title: "Responses", href: "/settings/fortcases/responses" },
      { title: "Impact", href: "/settings/fortcases/spend-impact" },
    ],
  },
  {
    label: "Organization",
    items: [{ title: "Trust and data", href: "/settings/trust-data" }],
  },
  {
    label: "Personal",
    items: [{ title: "Notifications", href: "/settings/notifications" }],
  },
] as const;

function SettingsNavigation({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings sections" className="flex flex-col gap-5">
      <p className="text-caption text-muted-foreground">On this page</p>
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="mb-1 text-caption font-medium text-muted-foreground">{group.label}</p>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "min-h-9 rounded-sm border-l-2 border-transparent px-3 py-2 text-label text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                pathname === item.href && "border-foreground bg-surface-hover font-medium text-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

const categoryTabs = [
  { label: "FortCases settings", href: "/settings/fortcases/investigations", prefix: "/settings/fortcases/" },
  { label: "Trust and data", href: "/settings/trust-data", prefix: "/settings/trust-data" },
  { label: "Notifications", href: "/settings/notifications", prefix: "/settings/notifications" },
];

export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNavigation, setMobileNavigation] = useState(false);
  return (
    <WorkspaceShell sectionOverride="Settings">
      <main data-ui="main settings-main" id="preview-main" className="min-w-0 py-5 md:py-8">
        <div className="mx-auto w-full max-w-[1160px] min-w-0">
          <div className="mb-6 flex min-w-0 flex-wrap items-center gap-4 border-b border-border">
            <nav aria-label="Settings categories" className="flex min-w-0 max-w-full items-center gap-5 overflow-x-auto">
              {categoryTabs.map((item) => {
                const selected = pathname.startsWith(item.prefix);
                return (
                  <Link key={item.href} href={item.href} aria-current={selected ? "page" : undefined}
                    className={cn("inline-flex h-11 shrink-0 items-center border-b-2 border-transparent px-1 text-label text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring", selected && "border-foreground font-medium text-foreground")}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex min-w-0 items-start gap-8 lg:gap-12">
            <aside className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] w-44 shrink-0 overflow-y-auto lg:block">
              <SettingsNavigation />
            </aside>
            <div id="settings-main" className="min-w-0 max-w-3xl flex-1 pb-12">
              <div className="mb-4 lg:hidden">
                <button type="button" aria-expanded={mobileNavigation} aria-controls="settings-section-list" onClick={() => setMobileNavigation(!mobileNavigation)}
                  className="flex min-h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 text-label font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Settings sections <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform", mobileNavigation && "rotate-180")} />
                </button>
                {mobileNavigation && <div id="settings-section-list" className="mt-2 rounded-md border border-border p-3"><SettingsNavigation close={() => setMobileNavigation(false)} /></div>}
              </div>
              {children}
            </div>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}

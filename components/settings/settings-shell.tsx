"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  CircleDollarSign,
  Inbox,
  Menu,
  ScanSearch,
  ShieldCheck,
  Siren,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WorkspaceThemeToggle } from "@/components/fortmind/theme-toggle";
import { platformRoutes } from "@/lib/platform-routes";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "FortCases",
    items: [
      {
        title: "Investigations",
        href: "/settings/fortcases/investigations",
        icon: ScanSearch,
      },
      { title: "Alerts", href: "/settings/fortcases/alerts", icon: Inbox },
      {
        title: "Escalation",
        href: "/settings/fortcases/escalation",
        icon: Siren,
      },
      { title: "Responses", href: "/settings/fortcases/responses", icon: Zap },
      {
        title: "Spend & Impact",
        href: "/settings/fortcases/spend-impact",
        icon: CircleDollarSign,
      },
    ],
  },
  {
    label: "Organization",
    items: [
      {
        title: "Trust & Data",
        href: "/settings/trust-data",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Personal",
    items: [
      { title: "Notifications", href: "/settings/notifications", icon: Bell },
    ],
  },
];
function SettingsNavigation({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings navigation" className="flex flex-col gap-7">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-xs font-medium text-muted-foreground">
            {group.label}
          </p>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "flex min-h-9 items-center gap-2.5 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring",
                pathname === item.href &&
                  "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
function BackLink({ close }: { close?: () => void }) {
  return (
    <Link
      href={platformRoutes.overview}
      onClick={close}
      className="mb-8 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to FortMind
    </Link>
  );
}
export function SettingsShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      data-ui="preview"
      className="text-sm leading-5.5 min-h-svh bg-background text-foreground"
    >
      <a
        data-ui="skip-link"
        href="#settings-main"
        className="fixed left-2 top-2 z-60 -translate-y-[160%] rounded-md border bg-background px-4 py-2 focus:translate-y-0"
      >
        Skip to settings
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-60 overflow-y-auto border-r bg-sidebar p-4 md:block">
        <BackLink />
        <SettingsNavigation />
        <div className="mt-8 border-t px-3 pt-4 text-xs leading-5 text-muted-foreground">
          Customer Zero
          <br />
          Prototype workspace
        </div>
      </aside>
      <div className="min-w-0 md:pl-60">
        <header className="flex h-16 items-center justify-between border-b px-5 md:justify-end md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open settings navigation"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <WorkspaceThemeToggle />
        </header>
        <main
          id="settings-main"
          className="min-w-0 px-5 py-8 md:px-10 md:py-10"
        >
          {children}
        </main>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-4">
          <SheetHeader>
            <SheetTitle>Settings navigation</SheetTitle>
          </SheetHeader>
          <BackLink close={() => setOpen(false)} />
          <SettingsNavigation close={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

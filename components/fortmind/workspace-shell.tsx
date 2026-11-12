"use client";

import Link from "next/link";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";
import { caseHref, platformRoutes } from "@/lib/platform-routes";
import { caseOverview } from "@/lib/case-overview-data";
import { usePreviewCases } from "@/lib/preview-case-store";
import { platformCases } from "@/lib/platform-cases";
import { PageContainer } from "@/components/layout/page-container";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ChevronRight,
  Bell,
  BookOpen,
  Building2,
  ChartColumn,
  ChevronsUpDown,
  Inbox,
  LayoutDashboard,
  Link2,
  Search,
  Settings,
  TriangleAlert,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type ImpactPeriod } from "@/lib/overview-data";
import { attentionIntegrations } from "@/lib/preview-integrations";
import { CaseQuickPreview } from "./case-table";
import { CopyTechnicalValue } from "./copy-technical-value";
import { WorkspaceThemeToggle } from "./theme-toggle";
import { FortMindLogo, FortMindMark } from "./brand-logo";

export { FortMindMark } from "./brand-logo";

type Panel = "integrations" | "search";

type PlatformSection = "Home" | "Cases" | "Integrations" | "Knowledge" | "Reports" | "Settings";

const WorkspaceContext = createContext<{
  openPanel: (panel: Panel) => void;
  impactPeriod: ImpactPeriod;
  setImpactPeriod: (period: ImpactPeriod) => void;
} | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("Workspace controls require WorkspaceShell");
  return context;
}


function AppSidebar({ section }: { section: PlatformSection }) {
  const { setOpenMobile } = useSidebar();

  const workspaceItems = [
    { label: "Home", icon: LayoutDashboard, href: platformRoutes.overview },
    { label: "Cases", icon: Inbox, href: platformRoutes.cases },
    { label: "Integrations", icon: Link2, href: platformRoutes.integrations },
    { label: "Knowledge", icon: BookOpen, href: platformRoutes.knowledge },
    { label: "Reports", icon: ChartColumn, href: platformRoutes.reports },
    { label: "Settings", icon: Settings, href: platformRoutes.settings },
  ] as const;

  const navItemClass = cn(
    "h-10 gap-3 rounded-sm px-3 text-label font-normal text-sidebar-foreground transition-colors",
    "[&>svg]:size-4 [&>svg]:stroke-[1.75] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "data-active:bg-sidebar-selected data-active:text-sidebar-accent-foreground data-active:font-normal",
    "data-active:hover:bg-sidebar-selected",
    "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center",
  );

  return (
    <Sidebar
      data-ui="sidebar"
      variant="inset"
      collapsible="icon"
      className="[&_[data-slot=sidebar-inner]]:overflow-hidden [&_[data-slot=sidebar-inner]]:rounded-xl [&_[data-slot=sidebar-inner]]:border [&_[data-slot=sidebar-inner]]:border-sidebar-border"
    >
      <SidebarHeader className="sticky top-0 z-10 shrink-0 gap-0 bg-sidebar p-0">
        {/* The product header and the utility toolbar share the same 48px baseline. */}
        <div
          data-ui="sidebar-brand"
          className="flex h-12 shrink-0 items-center bg-sidebar px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
        >
          <Link
            href={platformRoutes.overview}
            aria-label="FortMind overview"
            className="flex h-8 min-w-0 items-center rounded-md px-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden"
          >
            <FortMindLogo className="h-6 w-auto max-w-full" />
          </Link>
          {/* Keep only the brand in this header; sidebar controls live in the utility bar. */}
          <Link
            href={platformRoutes.overview}
            aria-label="FortMind overview"
            title="FortMind"
            className="hidden size-9 items-center justify-center rounded-md text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:flex"
          >
            <FortMindMark className="size-6" />
          </Link>
        </div>
        <div data-ui="workspace-organization" className="mx-3 mt-3 flex min-h-10 items-center gap-2 rounded-md px-2 text-label group-data-[collapsible=icon]:mx-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-sidebar-border bg-card font-mono text-caption">CZ</span>
          <span className="min-w-0 flex-1 truncate font-medium text-foreground group-data-[collapsible=icon]:hidden">Customer Zero</span>
          <span className="rounded-full border border-sidebar-border px-1.5 py-0.5 text-caption text-muted-foreground group-data-[collapsible=icon]:hidden">Member</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-sidebar px-3 pb-5 pt-5 group-data-[collapsible=icon]:px-2">
        <SidebarGroup role="navigation" aria-label="Platform navigation" className="px-0 py-0">
          <SidebarMenu className="gap-1">
            {workspaceItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  tooltip={item.label}
                  aria-label={item.label}
                  isActive={section === item.label}
                  aria-current={section === item.label ? "page" : undefined}
                  className={navItemClass}
                  render={<Link href={item.href} />}
                  onClick={() => setOpenMobile(false)}
                >
                  <item.icon aria-hidden="true" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  {item.label === "Integrations" && attentionIntegrations.length > 0 && (
                    <SidebarMenuBadge className="text-warning-foreground" aria-label={`${attentionIntegrations.length} tools need attention`}>{attentionIntegrations.length}</SidebarMenuBadge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Account preferences include appearance controls. */}
      <SidebarFooter className="bg-sidebar gap-0 border-t border-sidebar-border px-3 pt-3 pb-3 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account and appearance"
                title="Account and appearance"
                className="flex h-12 w-full items-center gap-1.5 rounded-md px-1.5 text-left text-body text-sidebar-foreground outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-card text-caption font-normal group-data-[collapsible=icon]:size-8"
                  aria-hidden="true"
                >
                  NA
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-label font-normal text-foreground">
                    Navdeep Annu
                  </span>
                  <span className="truncate text-caption text-muted-foreground">
                    Account & preferences
                  </span>
                </span>
                <ChevronsUpDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={8}
                className="w-64"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-body font-normal">Navdeep Annu</span>
                    <span className="text-caption font-normal text-muted-foreground">
                      Customer Zero
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={<Link href="/settings/fortcases/investigations" />}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Building2 aria-hidden="true" className="size-4" />
                    Organization settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href="/settings/notifications" />}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Bell aria-hidden="true" className="size-4" />
                    Notification preferences
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between gap-3 px-2 py-1.5 text-body">
                  <span>Appearance</span>
                  {/* Reuse the existing theme toggle; connect Clerk profile/sign-out later. */}
                  <WorkspaceThemeToggle />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function DesktopSidebarTrigger() {
  const { state } = useSidebar();

  return (
    <SidebarTrigger
      aria-label={state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"}
      className="hidden size-8 shrink-0 text-muted-foreground md:inline-flex"
    />
  );
}

function WorkspacePanel({
  panel,
  close,
}: {
  panel: Panel | null;
  close: () => void;
}) {
  const createdCases = usePreviewCases();
  const [query, setQuery] = useState("");
  const titles = {
    integrations: "Integrations",
    search: "Search cases",
  };
  const results = [...createdCases, ...platformCases].filter((item) =>
    [item.title, item.id, item.entities.hostname]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const detailedMatch = [
    caseOverview.id,
    caseOverview.title,
    ...caseOverview.entities.map((entity) => entity.name),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
  return (
    <>
      <Sheet
        open={Boolean(panel)}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <SheetContent
          data-ui="preview workspace panel"
          className="text-body bg-popover text-foreground w-full max-w-[540px] overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-[540px]"
        >
          <SheetHeader>
            <SheetTitle>{panel ? titles[panel] : "Workspace"}</SheetTitle>
            <SheetDescription>
              {panel === "search"
                ? "Find a case by title, identifier, or host."
                : "Customer Zero · preview workspace"}
            </SheetDescription>
          </SheetHeader>
          <div
            data-ui="panel-body"
            className="pt-2 pr-6 pb-7 pl-6 flex flex-col gap-5.5"
          >
            {panel === "integrations" && (
              <>
                <Alert
                  data-ui="warning"
                  className="bg-warning-muted text-warning-foreground border-warning-border"
                  role="status"
                >
                  <TriangleAlert />
                  <AlertTitle>Microsoft 365 needs attention</AlertTitle>
                  <AlertDescription className="text-warning-foreground text-label">
                    No new events for 42 minutes. Check the connection before
                    relying on current coverage.
                  </AlertDescription>
                </Alert>
                <div
                  data-ui="integration-row"
                  className="flex items-center gap-3 flex-wrap [&>_span:nth-child(2)]:flex [&>_span:nth-child(2)]:flex-1 [&>_span:nth-child(2)]:flex-col"
                >
                  <span
                    data-ui="microsoft-mark"
                    className="grid grid-cols-[repeat(2,_9px)] gap-0.5 shrink-0 [&_i:nth-child(2)]:bg-green-500 [&_i:nth-child(3)]:bg-blue-500 [&_i:nth-child(4)]:bg-amber-500"
                    aria-hidden="true"
                  >
                    <i className="w-2.25 h-2.25 bg-red-500" />
                    <i className="w-2.25 h-2.25 bg-red-500" />
                    <i className="w-2.25 h-2.25 bg-red-500" />
                    <i className="w-2.25 h-2.25 bg-red-500" />
                  </span>
                  <span>
                    <strong className="text-body font-medium">
                      Microsoft 365
                    </strong>
                    <small className="text-muted-foreground text-caption">
                      Identity & email events
                    </small>
                  </span>
                  <Badge
                    data-ui="warning-badge"
                    variant="outline"
                    className="text-warning-foreground bg-warning-muted border-transparent"
                  >
                    Needs attention
                  </Badge>
                </div>
                <dl data-ui="property-list" className="flex flex-col">
                  <div className="grid grid-cols-[145px_minmax(0,_1fr)] gap-5 pt-3.25 pr-0 pb-3.25 pl-0 border-b border-border text-label max-md:grid-cols-[115px_minmax(0,_1fr)] max-md:gap-3">
                    <dt className="text-muted-foreground">Connection</dt>
                    <dd className="font-medium">Configured</dd>
                  </div>
                  <div className="grid grid-cols-[145px_minmax(0,_1fr)] gap-5 pt-3.25 pr-0 pb-3.25 pl-0 border-b border-border text-label max-md:grid-cols-[115px_minmax(0,_1fr)] max-md:gap-3">
                    <dt className="text-muted-foreground">Last event</dt>
                    <dd className="font-medium">42 minutes ago</dd>
                  </div>
                  <div className="grid grid-cols-[145px_minmax(0,_1fr)] gap-5 pt-3.25 pr-0 pb-3.25 pl-0 border-b border-border text-label max-md:grid-cols-[115px_minmax(0,_1fr)] max-md:gap-3">
                    <dt className="text-muted-foreground">Next step</dt>
                    <dd className="font-medium">
                      Verify the connector and event forwarding in Microsoft
                      365.
                    </dd>
                  </div>
                </dl>
                <p data-ui="muted" className="text-muted-foreground text-prose">
                  This preview shows connection health without changing
                  credentials or integrations.
                </p>
                <Button
                  nativeButton={false}
                  variant="outline"
                  render={<Link href={platformRoutes.integrations} />}
                  onClick={close}
                >
                  Browse integrations <ArrowRight data-icon="inline-end" />
                </Button>
              </>
            )}
            {panel === "search" && (
              <>
                <Input
                  aria-label="Search workspace cases"
                  placeholder="Search cases, IDs, hosts…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <p
                  data-ui="muted"
                  className="text-muted-foreground text-prose"
                  role="status"
                >
                  {results.length + Number(detailedMatch)} matching cases
                </p>
                <div data-ui="search-results" className="flex flex-col gap-2">
                  {detailedMatch && (
                    <Button
                      nativeButton={false}
                      role="link"
                      variant="ghost"
                      className="px-3 py-2.5 h-auto min-h-16 text-left justify-between pt-2.5 pr-3 pb-2.5 pl-3 whitespace-normal"
                      render={<Link href={caseHref(caseOverview.id)} />}
                      onClick={close}
                    >
                      <span className="flex flex-col gap-1.25">
                        <strong className="text-label font-medium">
                          {caseOverview.title}
                        </strong>
                        <small className="text-caption font-mono text-muted-foreground">
                          {caseOverview.id} · fmlab-ws1
                        </small>
                      </span>
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  )}
                  {results.map((item) => (
                    <CaseQuickPreview key={item.id} item={item}>
                      <Button
                        variant="ghost"
                        className="h-auto min-h-16 text-left justify-between pt-2.5 pr-3 pb-2.5 pl-3 whitespace-normal"
                      >
                        <span className="flex flex-col gap-1.25">
                          <strong className="text-label font-medium">
                            {item.title}
                          </strong>
                          <small className="text-caption font-mono text-muted-foreground">
                            {item.id} · {item.entities.hostname}
                          </small>
                        </span>
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    </CaseQuickPreview>
                  ))}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function WorkspaceShell({ children, sectionOverride }: { children: ReactNode; sectionOverride?: PlatformSection }) {
  const segment = useSelectedLayoutSegment();
  const pathname = usePathname();
  const sections: Record<string, PlatformSection> = {
    overview: "Home",
    cases: "Cases",
    knowledge: "Knowledge",
    reports: "Reports",
    integrations: "Integrations",
  };
  const section = sectionOverride ?? sections[segment ?? "overview"] ?? "Home";
  const caseRoute = section === "Cases" && pathname.startsWith(`${platformRoutes.cases}/`);
  const caseSlug = caseRoute ? pathname.slice(platformRoutes.cases.length + 1).split("/")[0] : "";
  const caseId = caseSlug === "case-detail" ? caseOverview.id : caseSlug ? decodeURIComponent(caseSlug) : "";
  const [panel, setPanel] = useState<Panel | null>(null);
  const [period, setPeriod] = useState<ImpactPeriod>("7d");
  function openPanel(next: Panel) {
    setPanel(next);
  }
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPanel("search");
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  return (
    <WorkspaceContext.Provider
      value={{ openPanel, impactPeriod: period, setImpactPeriod: setPeriod }}
    >
      <TooltipProvider delay={200}>
        <SidebarProvider
          data-ui="preview workspace"
          className="text-body text-foreground bg-shell"
          style={
            {
              "--sidebar-width": "16rem",
              "--sidebar-width-icon": "4rem",
              "--workspace-header-height": "3rem",
            } as CSSProperties
          }
        >
          <a
            data-ui="skip-link"
            className="fixed left-2 top-2 z-60 -translate-y-[160%] rounded-md border bg-background px-4 py-2 focus:translate-y-0"
            href="#preview-main"
          >
            Skip to {section.toLowerCase()}
          </a>
          <AppSidebar section={section} />
          <SidebarInset
            data-ui="inset"
            className="min-w-0 min-h-dvh bg-background md:overflow-clip md:rounded-xl md:border-border md:peer-data-[variant=inset]:min-h-[calc(100dvh-1rem)]"
          >
            {/* Workspace tools stay available while content scrolls. */}
            <header
              data-ui="utility-bar"
              className="sticky top-0 z-30 flex h-(--workspace-header-height) shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-5 md:px-8"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <SidebarTrigger
                  aria-label="Open sidebar"
                  className="size-8 shrink-0 md:hidden"
                />
                <DesktopSidebarTrigger />
                <nav aria-label="Breadcrumb" className={cn("min-w-0 items-center gap-2 text-body", caseRoute ? "flex" : "hidden sm:flex")}>
                  {caseRoute ? (
                    <>
                      <Link href={platformRoutes.cases} className="text-muted-foreground hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
                        Cases
                      </Link>
                      <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 truncate max-sm:hidden">
                        <CopyTechnicalValue label="case ID" value={caseId} />
                      </span>
                      <span className="text-muted-foreground sm:hidden">Case</span>
                    </>
                  ) : (
                    <span className="truncate font-medium">{section}</span>
                  )}
                </nav>
                <Button
                  data-ui="global-search"
                  variant="outline"
                  size="sm"
                  className="ml-auto min-w-0 max-w-64 flex-1 justify-start gap-2 px-3 text-muted-foreground has-data-[icon=inline-start]:pl-3"
                  onClick={() => openPanel("search")}
                  aria-label="Search cases"
                >
                  <Search data-icon="inline-start" aria-hidden="true" />
                  <span>Search cases…</span>
                  <kbd
                    className="ml-auto hidden rounded-sm border border-border/70 bg-background px-1 font-sans text-caption text-muted-foreground lg:inline-flex"
                    aria-hidden="true"
                  >
                    ⌘ K
                  </kbd>
                </Button>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={
                      attentionIntegrations.length
                        ? `Notifications: ${attentionIntegrations.length} integration issue${attentionIntegrations.length === 1 ? "" : "s"}`
                        : "Notifications"
                    }
                    title="Notifications"
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="relative text-muted-foreground"
                      />
                    }
                  >
                    <Bell aria-hidden="true" className="size-4" />
                    {attentionIntegrations.length > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute right-1.5 top-1.5 size-1.5 rounded-full border border-shell bg-warning"
                      />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-80 max-w-[calc(100vw-2rem)]"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    {attentionIntegrations.length > 0 ? (
                      <DropdownMenuItem
                        onClick={() => openPanel("integrations")}
                        className="flex items-start gap-3 py-3"
                      >
                        <TriangleAlert
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-warning-foreground"
                        />
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="text-body font-medium">
                            {attentionIntegrations.length} integration
                            {attentionIntegrations.length === 1
                              ? " needs"
                              : "s need"}{" "}
                            attention
                          </span>
                          <span className="text-caption text-muted-foreground">
                            Review your connected security tools
                          </span>
                        </span>
                      </DropdownMenuItem>
                    ) : (
                      <p className="px-2 py-5 text-center text-prose text-muted-foreground">
                        No new notifications
                      </p>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      render={<Link href="/settings/notifications" />}
                    >
                      Notification preferences
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <WorkspaceThemeToggle />
              </div>
            </header>
            <PageContainer>{children}</PageContainer>
          </SidebarInset>
          <WorkspacePanel panel={panel} close={() => setPanel(null)} />
        </SidebarProvider>
      </TooltipProvider>
    </WorkspaceContext.Provider>
  );
}

"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { caseHref, platformRoutes } from "@/lib/platform-routes";
import { caseOverview } from "@/lib/case-overview-data";
import { usePreviewCases } from "@/lib/preview-case-store";
import { platformCases } from "@/lib/platform-cases";
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
  Bell,
  BrainCircuit,
  Building2,
  ChartColumn,
  ChevronsUpDown,
  Inbox,
  LayoutDashboard,
  Link2,
  Search,
  Settings,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
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
import { type SecurityCase } from "@/lib/preview-data";
import { type ImpactPeriod } from "@/lib/overview-data";
import { attentionIntegrations } from "@/lib/preview-integrations";
import { CasePreview } from "./case-table";
import { WorkspaceThemeToggle } from "./theme-toggle";
import { NewCase } from "./new-case";

type Panel = "integrations" | "search";

type PlatformSection =
  | "Overview"
  | "Cases"
  | "OSCAR Context"
  | "Reports"
  | "Integrations";

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

export function FortMindMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 5h8l5 6v16H8V16l-6-6V5Zm20 0h8v5l-6 6v11h-7V11l5-6Z" />
    </svg>
  );
}

function AppSidebar({ section }: { section: PlatformSection }) {
  const { setOpenMobile } = useSidebar();

  const workspaceItems = [
    { label: "Overview", icon: LayoutDashboard, href: platformRoutes.overview },
    { label: "Cases", icon: Inbox, href: platformRoutes.cases },
    {
      label: "OSCAR Context",
      icon: BrainCircuit,
      href: platformRoutes.knowledge,
    },
    { label: "Reports", icon: ChartColumn, href: platformRoutes.reports },
  ];

  const managementItems: {
    label: string;
    icon: LucideIcon;
    href: string;
    count?: number;
  }[] = [
    {
      label: "Integrations",
      icon: Link2,
      href: platformRoutes.integrations,
      count: attentionIntegrations.length,
    },
    { label: "Settings", icon: Settings, href: platformRoutes.settings },
  ];

  const navItemClass =
    "h-10 gap-3 rounded-lg px-3 text-sm font-normal transition-colors [&>svg]:size-4 " +
    "data-active:bg-sidebar-foreground/10 data-active:text-sidebar-foreground " +
    "data-active:font-medium data-active:hover:bg-sidebar-foreground/10 " +
    "focus-visible:ring-2 focus-visible:ring-sidebar-ring " +
    "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center";

  return (
    <Sidebar data-ui="sidebar" variant="sidebar" collapsible="icon">
      <SidebarHeader className="gap-0 p-0">
        {/* The product header and the utility toolbar share the same 48px baseline. */}
        <div className=" bg-card flex h-12 shrink-0  items-center justify-between border-b border-sidebar-border px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <Link
            href={platformRoutes.overview}
            aria-label="FortMind overview"
            className="flex h-full min-w-0 items-center gap-2 rounded-md px-1 text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden"
          >
            <FortMindMark className="size-6 shrink-0" />
            <span className="truncate text-lg font-semibold tracking-tight">
              FortMind
            </span>
          </Link>
          {/* Collapsed sidebar retains product identity; the expand control lives in the top bar. */}
          <Link
            href={platformRoutes.overview}
            aria-label="FortMind overview"
            title="FortMind"
            className="hidden size-9 items-center justify-center rounded-md text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:flex"
          >
            <FortMindMark className="size-6" />
          </Link>
          <SidebarTrigger
            aria-label="Collapse sidebar"
            className="size-8 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
          />
        </div>

        {/* Single-organization context: deliberately not a button or dropdown. */}
        <div className=" bg-card px-3 pt-3  group-data-[collapsible=icon]:px-2">
          <div
            className="mt-1 flex min-h-14 items-center gap-3 rounded-lg border border-sidebar-border bg-card px-2.5 py-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:mt-1 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
            title="Current organization: Customer Zero"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-foreground">
              <Building2 aria-hidden="true" className="size-[18px]" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium">
                Customer Zero
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Organization
              </span>
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-card gap-0 px-3 group-data-[collapsible=icon]:px-2">
        <SidebarGroup className="px-0 pt-4 pb-6 [&_button]:min-h-10 [&_button]:text-sm [&_button]:font-medium group-data-[collapsible=icon]:pt-3 group-data-[collapsible=icon]:pb-5">
          <NewCase placement="sidebar" />
        </SidebarGroup>

        <SidebarGroup
          role="navigation"
          aria-label="Workspace navigation"
          className="px-0 py-0"
        >
          <SidebarGroupLabel className="h-7 px-2 text-xs font-medium text-muted-foreground">
            Workspace
          </SidebarGroupLabel>
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
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mt-3 mb-2 hidden group-data-[collapsible=icon]:block" />
        <SidebarGroup
          role="navigation"
          aria-label="Management navigation"
          className="mt-5 px-0 py-0 group-data-[collapsible=icon]:mt-0"
        >
          <SidebarGroupLabel className="h-7 px-2 text-xs font-medium text-muted-foreground">
            Management
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {managementItems.map((item) => (
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
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </SidebarMenuButton>
                {item.count ? (
                  <SidebarMenuBadge
                    aria-label={`${item.count} integration${item.count === 1 ? "" : "s"} need attention`}
                    className="text-warning-foreground"
                  >
                    {item.count}
                  </SidebarMenuBadge>
                ) : null}
                {item.count ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-1 top-1 hidden size-1.5 rounded-full bg-warning group-data-[collapsible=icon]:block"
                  />
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* The user's account menu also owns theme switching, not the global toolbar. */}
      <SidebarFooter className="bg-card gap-0 px-3 pt-3 pb-3 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account and appearance"
                title="Account and appearance"
                className="flex h-12 w-full items-center gap-3 rounded-lg px-2 text-left text-sm text-sidebar-foreground outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium group-data-[collapsible=icon]:size-8"
                  aria-hidden="true"
                >
                  NA
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-medium">
                    Navdeep Annu
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    My account
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
                    <span className="text-sm font-medium">Navdeep Annu</span>
                    <span className="text-xs font-normal text-muted-foreground">
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
                <div className="flex items-center justify-between gap-3 px-2 py-1.5 text-sm">
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

function CollapsedSidebarTrigger() {
  const { state } = useSidebar();
  if (state !== "collapsed") return null;

  return (
    <SidebarTrigger
      aria-label="Expand sidebar"
      className="hidden md:inline-flex"
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
  const [selected, setSelected] = useState<SecurityCase | null>(null);
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
          className="text-sm leading-5.5 bg-card text-foreground w-full max-w-[540px] overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-[540px]"
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
                  <AlertDescription className="text-warning-foreground text-[13px]">
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
                    <strong className="text-sm font-medium">
                      Microsoft 365
                    </strong>
                    <small className="text-muted-foreground text-xs">
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
                  <div className="grid grid-cols-[145px_minmax(0,_1fr)] gap-5 pt-3.25 pr-0 pb-3.25 pl-0 border-b border-border text-[13px] leading-5.25 max-md:grid-cols-[115px_minmax(0,_1fr)] max-md:gap-3">
                    <dt className="text-muted-foreground">Connection</dt>
                    <dd className="font-medium">Configured</dd>
                  </div>
                  <div className="grid grid-cols-[145px_minmax(0,_1fr)] gap-5 pt-3.25 pr-0 pb-3.25 pl-0 border-b border-border text-[13px] leading-5.25 max-md:grid-cols-[115px_minmax(0,_1fr)] max-md:gap-3">
                    <dt className="text-muted-foreground">Last event</dt>
                    <dd className="font-medium">42 minutes ago</dd>
                  </div>
                  <div className="grid grid-cols-[145px_minmax(0,_1fr)] gap-5 pt-3.25 pr-0 pb-3.25 pl-0 border-b border-border text-[13px] leading-5.25 max-md:grid-cols-[115px_minmax(0,_1fr)] max-md:gap-3">
                    <dt className="text-muted-foreground">Next step</dt>
                    <dd className="font-medium">
                      Verify the connector and event forwarding in Microsoft
                      365.
                    </dd>
                  </div>
                </dl>
                <p data-ui="muted" className="text-muted-foreground text-sm">
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
                  className="text-muted-foreground text-sm"
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
                        <strong className="text-[13px] font-medium">
                          {caseOverview.title}
                        </strong>
                        <small className="text-xs font-mono text-muted-foreground">
                          {caseOverview.id} · fmlab-ws1
                        </small>
                      </span>
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  )}
                  {results.map((item) => (
                    <Button
                      variant="ghost"
                      key={item.id}
                      onClick={() => {
                        close();
                        setSelected(item);
                      }}
                      className="h-auto min-h-16 text-left justify-between pt-2.5 pr-3 pb-2.5 pl-3 whitespace-normal"
                    >
                      <span className="flex flex-col gap-1.25">
                        <strong className="text-[13px] font-medium">
                          {item.title}
                        </strong>
                        <small className="text-xs font-mono text-muted-foreground">
                          {item.id} · {item.entities.hostname}
                        </small>
                      </span>
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <CasePreview item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const sections: Record<string, PlatformSection> = {
    overview: "Overview",
    cases: "Cases",
    knowledge: "OSCAR Context",
    reports: "Reports",
    integrations: "Integrations",
  };
  const section = sections[segment ?? "overview"] ?? "Overview";
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
          className="text-sm leading-5.5 text-foreground bg-card"
          style={
            {
              "--sidebar-width": "16rem",
              "--sidebar-width-icon": "4rem",
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
            className="min-w-0 bg-background has-[[data-case-workspace]]:min-h-dvh"
          >
            {/* A compact utility bar, not a second navigation system.
                On desktop the left-side trigger is only visible when collapsed. */}
            <header
              data-ui="utility-bar"
              className="flex h-12 bg-card shrink-0 items-center justify-between gap-3 border-b  px-4 md:px-6 in-has-[[data-case-workspace]]:sticky in-has-[[data-case-workspace]]:top-0 in-has-[[data-case-workspace]]:z-30"
            >
              <div className="flex items-center gap-2">
                <SidebarTrigger
                  aria-label="Open sidebar"
                  className="md:hidden"
                />
                <CollapsedSidebarTrigger />
              </div>
              <div className="ml-auto flex items-center gap-1 sm:gap-2">
                <Button
                  data-ui="global-search"
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={() => openPanel("search")}
                  aria-label="Search cases"
                >
                  <Search aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">Search cases…</span>
                  <kbd
                    className="ml-4 hidden rounded border border-border px-1.5 py-0.5 font-sans text-xs leading-none text-muted-foreground lg:inline"
                    aria-hidden="true"
                  >
                    ⌘ K
                  </kbd>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={
                      attentionIntegrations.length
                        ? `Notifications: ${attentionIntegrations.length} integration issue${attentionIntegrations.length === 1 ? "" : "s"}`
                        : "Notifications"
                    }
                    title="Notifications"
                    className="relative inline-flex size-9 items-center justify-center rounded-md text-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Bell aria-hidden="true" className="size-4" />
                    {attentionIntegrations.length > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute right-1.5 top-1.5 size-1.5 rounded-full border border-background bg-warning"
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
                          <span className="text-sm font-medium">
                            {attentionIntegrations.length} integration
                            {attentionIntegrations.length === 1
                              ? " needs"
                              : "s need"}{" "}
                            attention
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Review your connected security tools
                          </span>
                        </span>
                      </DropdownMenuItem>
                    ) : (
                      <p className="px-2 py-5 text-center text-sm text-muted-foreground">
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
              </div>
            </header>
            {children}
          </SidebarInset>
          <WorkspacePanel panel={panel} close={() => setPanel(null)} />
        </SidebarProvider>
      </TooltipProvider>
    </WorkspaceContext.Provider>
  );
}

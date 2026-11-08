"use client";

import { cn } from "@/lib/utils";
import { semanticStyles } from "@/lib/semantic-styles";
import Link from "next/link";
import { integrationHref } from "@/lib/platform-routes";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ExternalLink,
  KeyRound,
  ListFilter,
  LoaderCircle,
  Plug,
  Search,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { integrationStates } from "@/lib/semantic-states";
import {
  attentionIntegrations,
  integrationCategories,
  previewIntegrations,
  type IntegrationAvailability,
  type IntegrationCategory,
  type PreviewIntegration,
} from "@/lib/preview-integrations";

type AvailabilityFilter = "all" | IntegrationAvailability;
type SortOrder = "recommended" | "name" | "usage";

const availabilityFilters: { value: AvailabilityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "connected", label: "Connected" },
  { value: "attention", label: "Needs attention" },
  { value: "available", label: "Available" },
];
const sortLabels: Record<SortOrder, string> = {
  recommended: "Recommended",
  name: "Name A–Z",
  usage: "Most used",
};
const availabilityRank: Record<IntegrationAvailability, number> = {
  attention: 0,
  connected: 1,
  available: 2,
};

function IntegrationMark({ integration }: { integration: PreviewIntegration }) {
  const microsoft = integration.slug.startsWith("microsoft-");
  return (
    <span data-ui="mark" className="inline-flex size-10 flex-none items-center justify-center rounded-lg border bg-background text-caption font-bold tracking-tight" data-microsoft={microsoft} aria-hidden="true">
      {microsoft ? (
        <span data-ui="microsoft-mark" className="grid -rotate-4 grid-cols-[repeat(2,8px)] grid-rows-[repeat(2,8px)] gap-0.5 max-w-9 truncate"><i className="block bg-current" /><i className="block bg-current" /><i className="block bg-current" /><i className="block bg-current" /></span>
      ) : (
        <span className="max-w-9 truncate">{integration.mark}</span>
      )}
    </span>
  );
}

function ConnectionBadge({ integration }: { integration: PreviewIntegration }) {
  const definition = integration.availability === "connected"
    ? integrationStates.Connected
    : integrationStates["Not connected"];
  const label = integration.availability === "attention" ? "Needs attention" : definition.label;
  const tone = integration.availability === "attention" ? "warning" : definition.tone;
  return (
    <Badge data-ui="connection-badge" variant="outline" className={cn("h-5.5 flex-none gap-1 rounded-sm px-1.5 py-px text-caption font-medium", semanticStyles[tone].badge)} data-tone={tone}>
      {label}
    </Badge>
  );
}

function IntegrationCard({ integration }: { integration: PreviewIntegration }) {
  return (
    <Link data-ui="card-link"
      href={integrationHref(integration.slug)}
      className="group/integration block h-full min-w-0 rounded-lg no-underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3"
      aria-label={`${integration.name}, ${integration.availability === "attention" ? "needs attention" : integration.availability === "connected" ? "connected" : "available"}. View integration details`}
    >
      <Card data-ui="card" size="sm" className="h-full min-h-[252px] gap-0 rounded-lg border bg-card p-0 ring-0 transition-colors duration-150 group-hover/integration:border-ring group-focus-visible/integration:border-ring">
        <CardHeader data-ui="card-header" className="flex items-start justify-between gap-2.5 min-h-20 pt-5 pr-5 pb-0 pl-5">
          <div data-ui="card-identity" className="flex items-center gap-2.75 min-w-0">
            <IntegrationMark integration={integration} />
            <div data-ui="card-name" className="min-w-0">
              <CardTitle className="line-clamp-2 text-panel-title">{integration.name}</CardTitle>
              <span className="block mt-0.5 overflow-hidden text-muted-foreground text-caption text-ellipsis whitespace-nowrap">{integration.category}</span>
            </div>
          </div>
          <ConnectionBadge integration={integration} />
        </CardHeader>
        <CardContent data-ui="card-body" className="flex-1 pt-4 pr-5 pb-5 pl-5">
          <p className="text-muted-foreground text-label line-clamp-3">{integration.description}</p>
          {integration.issue && (
            <div data-ui="card-issue" className="flex items-start gap-1.5 mt-2.5 text-warning-foreground text-caption"><TriangleAlert aria-hidden="true" className="w-3.25 h-3.25 mt-px" />{integration.issue}</div>
          )}
        </CardContent>
        <CardFooter data-ui="card-footer" className="gap-1.75 min-h-9.75 pt-4 pr-5 pb-4 pl-5 border-border rounded-none bg-transparent text-muted-foreground text-caption whitespace-nowrap">
          <span>{integration.enabledTools} {integration.enabledTools === 1 ? "tool" : "tools"} enabled</span>
          <span data-ui="card-footer-dot" aria-hidden="true" className="opacity-55">·</span>
          <span>{integration.casesUsed === undefined ? "No usage yet" : `${integration.casesUsed} sample cases`}</span>
          <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5 ml-auto" />
        </CardFooter>
      </Card>
    </Link>
  );
}

export function IntegrationsDirectory() {
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [category, setCategory] = useState<IntegrationCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("recommended");

  const counts = useMemo(() => ({
    all: previewIntegrations.length,
    connected: previewIntegrations.filter((item) => item.availability === "connected").length,
    attention: attentionIntegrations.length,
    available: previewIntegrations.filter((item) => item.availability === "available").length,
  }), []);
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return previewIntegrations
      .filter((item) => availability === "all" || item.availability === availability)
      .filter((item) => category === "all" || item.category === category)
      .filter((item) => !normalized || [item.name, item.category, item.description, ...item.tools]
        .join(" ").toLocaleLowerCase().includes(normalized))
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "usage") return (b.casesUsed ?? -1) - (a.casesUsed ?? -1) || a.name.localeCompare(b.name);
        return availabilityRank[a.availability] - availabilityRank[b.availability] || a.name.localeCompare(b.name);
      });
  }, [availability, category, query, sort]);
  const hasFilters = availability !== "all" || category !== "all" || Boolean(query);

  return (
      <main data-ui="main integrations-main" id="preview-main" className="min-w-0 py-5 md:py-8">
        <header data-ui="page-heading" className="flex flex-wrap items-start justify-between gap-6 max-[681px]:items-start">
          <div>
            <span data-ui="eyebrow" className="mb-1.75 block text-caption font-semibold tracking-[.09em] uppercase text-muted-foreground">Workspace tools</span>
            <h1 className="text-page-title">Integrations</h1>
            <p className="max-w-170 mt-1.5 text-muted-foreground text-prose">Connect security data and investigation tools so OSCAR can follow evidence across your environment.</p>
          </div>
          <Badge data-ui="preview-badge" variant="outline" className="mt-1.25 text-muted-foreground bg-card max-[681px]:hidden">Design preview</Badge>
        </header>

        {attentionIntegrations.length > 0 && (
          <Alert data-ui="attention" className="mt-6.25 items-center gap-x-2.75 border-warning-border bg-warning-muted px-3.75 py-3 text-foreground has-[>svg]:grid-cols-[18px_minmax(0,1fr)_auto] max-[681px]:has-[>svg]:grid-cols-[17px_minmax(0,1fr)]" role="status">
            <TriangleAlert aria-hidden="true" className="col-start-1 [grid-row:1_/_3] w-4.25 h-4.25 text-warning-foreground" />
            <AlertTitle className="col-start-2 row-start-1 text-label font-semibold">{attentionIntegrations.length} {attentionIntegrations.length === 1 ? "integration needs" : "integrations need"} attention</AlertTitle>
            <AlertDescription className="col-start-2 row-start-2 text-muted-foreground text-caption">{attentionIntegrations[0].name}: {attentionIntegrations[0].issue}</AlertDescription>
            <Link data-ui="attention-link" href={integrationHref(attentionIntegrations[0].slug)} className="col-start-3 row-span-2 inline-flex items-center gap-1.75 whitespace-nowrap px-0.75 py-1.25 text-caption font-semibold text-warning-foreground hover:underline hover:underline-offset-3 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3 max-[681px]:col-start-2 max-[681px]:row-start-3 max-[681px]:mt-1">
              Review connection <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
            </Link>
          </Alert>
        )}

        <section data-ui="directory" className="mt-6.75" aria-label="Integration directory">
          <div data-ui="directory-top" className="flex items-center justify-between gap-4 max-[681px]:overflow-x-auto">
            <ToggleGroup data-ui="status-filters"
              aria-label="Connection status"
              value={[availability]}
              onValueChange={(values) => setAvailability((values[0] as AvailabilityFilter | undefined) ?? "all")}
              variant="outline"
              spacing={1}
              className="gap-1.75 max-[851px]:max-w-full max-[851px]:overflow-x-auto max-[681px]:flex-none [&_[data-slot='toggle-group-item']:hover]:text-foreground [&_[data-slot='toggle-group-item']:hover]:bg-muted [&_[data-slot='toggle-group-item'][data-pressed]]:text-foreground [&_[data-slot='toggle-group-item'][data-pressed]]:border-input [&_[data-slot='toggle-group-item'][data-pressed]]:bg-muted"
            >
              {availabilityFilters.map((filter) => (
                <ToggleGroupItem key={filter.value} value={filter.value} className="h-8 gap-1.75 pt-0 pr-3 pb-0 pl-3 border-border rounded-md text-muted-foreground bg-card text-caption font-medium">
                  {filter.label}<span data-ui="filter-count" className="inline-flex h-4.5 min-w-4.75 items-center justify-center rounded-sm bg-muted px-1 text-caption tabular-nums text-muted-foreground">{counts[filter.value]}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <span data-ui="preview-note" className="text-muted-foreground text-caption whitespace-nowrap max-[1161px]:hidden">Illustrative connections and usage · no live data</span>
          </div>
          <div data-ui="directory-toolbar" className="flex items-center gap-2.25 mt-4.5 max-[851px]:flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button data-ui="category-trigger" variant="outline" size="sm" className="w-52.5 justify-start [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis max-[681px]:w-42.5 [&_svg:last-child]:ml-auto" aria-label={`Category: ${category === "all" ? "All categories" : category}`} />} className="h-9 rounded-md text-label">
                <SlidersHorizontal data-icon="inline-start" />
                <span>{category === "all" ? "All categories" : category}</span>
                <ChevronDown data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent data-ui="filter-menu" align="start" className="min-w-53.75">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Category</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={category} onValueChange={(value) => setCategory(value as IntegrationCategory | "all")}>
                    <DropdownMenuRadioItem value="all" closeOnClick className="min-h-8">All categories</DropdownMenuRadioItem>
                    {integrationCategories.map((item) => <DropdownMenuRadioItem key={item} value={item} closeOnClick className="min-h-8">{item}</DropdownMenuRadioItem>)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div data-ui="directory-search" className="relative flex-1 min-w-42.5 max-w-105 ml-auto max-[851px]:order-3 max-[851px]:max-w-none max-[851px]:basis-full max-[851px]:ml-0">
              <Search aria-hidden="true" className="absolute z-1 top-2.5 left-2.75 w-4 h-4 text-muted-foreground" />
              <Input aria-label="Search integrations and tools" placeholder="Search integrations and tools…" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 rounded-md text-label w-full pl-8.5 bg-card" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button data-ui="sort-trigger" variant="outline" size="sm" className="w-40 justify-start max-[681px]:w-37.5 [&_svg:last-child]:ml-auto" aria-label={`Sort integrations: ${sortLabels[sort]}`} />} className="h-9 rounded-md text-label">
                <ListFilter data-icon="inline-start" />
                {sortLabels[sort]}
                <ChevronDown data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent data-ui="filter-menu" align="end" className="min-w-53.75">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Sort integrations</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={sort} onValueChange={(value) => setSort(value as SortOrder)}>
                    {(Object.keys(sortLabels) as SortOrder[]).map((option) => (
                      <DropdownMenuRadioItem key={option} value={option} closeOnClick className="min-h-8">{sortLabels[option]}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div data-ui="results-heading" className="flex items-center justify-between gap-4.5 mt-7.25 mr-0 mb-3.25 ml-0">
            <div className="flex items-baseline gap-2.75"><h2 className="text-section-title">{availability === "all" ? "All integrations" : availabilityFilters.find((item) => item.value === availability)?.label}</h2><span role="status" className="text-muted-foreground text-caption tabular-nums">{visible.length} {visible.length === 1 ? "integration" : "integrations"}</span></div>
            {hasFilters && <Button variant="ghost" size="sm" onClick={() => { setAvailability("all"); setCategory("all"); setQuery(""); }} className="text-muted-foreground">Clear filters</Button>}
          </div>
          {visible.length > 0 ? (
            <div data-ui="card-grid" className="grid grid-cols-3 gap-6 max-[1161px]:grid-cols-2 max-[681px]:grid-cols-1">{visible.map((integration) => <IntegrationCard key={integration.slug} integration={integration} />)}</div>
          ) : (
            <Empty data-ui="empty" className="min-h-77.5 border border-dashed border-border bg-card">
              <EmptyHeader><Search aria-hidden="true" className="w-5.75 h-5.75 text-muted-foreground" /><EmptyTitle className="w-5.75 h-5.75 text-muted-foreground">No integrations found</EmptyTitle><EmptyDescription className="w-5.75 h-5.75 text-muted-foreground">Try another name, tool, or category.</EmptyDescription></EmptyHeader>
              <Button variant="outline" size="sm" onClick={() => { setAvailability("all"); setCategory("all"); setQuery(""); }}>Clear filters</Button>
            </Empty>
          )}
        </section>
      </main>
  );
}

export function IntegrationDetail({ integration }: { integration: PreviewIntegration }) {
  const [sampleTest, setSampleTest] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const available = integration.availability === "available";
  function runSampleTest() {
    setSampleTest("running");
    window.setTimeout(() => setSampleTest(integration.availability === "attention" ? "failed" : "passed"), 650);
  }
  return (
      <main data-ui="main integration-detail" id="preview-main" className="min-w-0 py-5 md:py-8">
        <Link data-ui="back" href="/platform/integrations" className="inline-flex items-center gap-1.75 text-muted-foreground text-caption [&:focus-visible]:outline-2 [&:focus-visible]:outline-ring [&:focus-visible]:outline-offset-3 [&:hover]:text-foreground"><ArrowLeft aria-hidden="true" className="w-3.75 h-3.75" />All integrations</Link>
        <div data-ui="detail-heading" className="flex items-center gap-3.75 mt-6 max-[681px]:items-start max-[681px]:flex-wrap">
          <IntegrationMark integration={integration} />
          <div data-ui="detail-heading-copy" className="flex-1 min-w-0">
            <span data-ui="eyebrow" className="mb-1.75 block text-caption font-semibold tracking-[.09em] uppercase text-muted-foreground">{integration.category}</span>
            <h1 className="text-page-title">{integration.name}</h1>
            <p className="mt-1 text-muted-foreground text-label">{integration.description}</p>
          </div>
          <ConnectionBadge integration={integration} />
        </div>
        <p data-ui="detail-disclaimer" className="mt-5.5 mr-0 mb-4.75 ml-0 pt-2.25 pr-3 pb-2.25 pl-3 border border-border rounded-md bg-card text-muted-foreground text-caption">Static design preview. Connection states, usage, and sample tests below do not reflect live credentials or provider responses.</p>
        <div data-ui="detail-grid" className="grid grid-cols-[minmax(0,_1.55fr)_minmax(280px,_1fr)] items-start gap-4 max-[851px]:grid-cols-1">
          <div data-ui="detail-primary" className="grid gap-4 min-w-0">
            <Card data-ui="detail-card" className="gap-0 rounded-lg border bg-card p-0 ring-0">
              <CardHeader><CardTitle>Connection health</CardTitle><p>How this tool would be available to OSCAR.</p></CardHeader>
              <CardContent>
                <div data-ui="health-summary" className="flex items-start gap-2.5 pb-4.25 border-b border-border [&>_span:last-child]:text-muted-foreground [&>_span:last-child]:text-caption [&>_span:last-child]:leading-4 [&[data-attention='true']_>_span:last-child]:text-warning-foreground" data-attention={integration.availability === "attention"}>
                  <ConnectionBadge integration={integration} />
                  <span>{integration.issue ?? (available ? "No connection is configured in this preview." : "Illustrative connection is available for investigation lookups.")}</span>
                </div>
                <dl data-ui="facts" className="grid grid-cols-2 gap-y-3.75 gap-x-5 mt-4.25">
                  <div className="min-w-0"><dt className="text-muted-foreground text-caption">Connection</dt><dd className="mt-0.75 text-caption font-medium">{available ? "Not connected" : "Configured in preview"}</dd></div>
                  <div className="min-w-0"><dt className="text-muted-foreground text-caption">Enabled tools</dt><dd className="mt-0.75 text-caption font-medium">{integration.enabledTools} of {integration.tools.length}</dd></div>
                  <div className="min-w-0"><dt className="text-muted-foreground text-caption">Cases used in</dt><dd className="mt-0.75 text-caption font-medium">{integration.casesUsed === undefined ? "No sample usage" : `${integration.casesUsed} sample cases`}</dd></div>
                  <div className="min-w-0"><dt className="text-muted-foreground text-caption">Last live check</dt><dd className="mt-0.75 text-caption font-medium">Unavailable in design preview</dd></div>
                </dl>
              </CardContent>
              <CardFooter data-ui="detail-card-footer" className="max-[681px]:flex-col max-[681px]:items-start justify-between gap-3.5 pt-3.25 pr-5 pb-3.25 pl-5 border-border rounded-none bg-background">
                <div className="flex flex-col gap-px"><strong className="text-caption font-semibold">Connection test</strong><span className="text-muted-foreground text-caption">Runs a local sample state only. No provider request is sent.</span></div>
                <Button variant="outline" size="sm" disabled={available || sampleTest === "running"} onClick={runSampleTest} className="flex-none">
                  {sampleTest === "running" ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />}
                  {sampleTest === "running" ? "Checking sample…" : "Run sample test"}
                </Button>
              </CardFooter>
              {sampleTest !== "idle" && sampleTest !== "running" && (
                <p data-ui="sample-result" className="flex items-start gap-1.75 mt-0 mr-0 mb-0 ml-0 pt-2.75 pr-5 pb-2.75 pl-5 border-t border-success-border text-success-foreground bg-success-muted text-caption [&[data-failed='true']]:border-warning-border [&[data-failed='true']]:text-warning-foreground [&[data-failed='true']]:bg-warning-muted" role="status" data-failed={sampleTest === "failed"}>
                  {sampleTest === "failed" ? <TriangleAlert aria-hidden="true" className="w-3.5 h-3.5 mt-px" /> : <Check aria-hidden="true" className="w-3.5 h-3.5 mt-px" />}
                  {sampleTest === "failed" ? `Sample check needs attention: ${integration.issue}` : "Sample check passed. This is an illustrative result, not a live provider response."}
                </p>
              )}
            </Card>
            <Card data-ui="detail-card" className="gap-0 rounded-lg border bg-card p-0 ring-0">
              <CardHeader><CardTitle>OSCAR tools</CardTitle><p>{available ? "Tools available after a connection is configured." : "Tools shown as enabled in this preview configuration."}</p></CardHeader>
              <CardContent data-ui="tools-list" className="pt-0 pr-0 pb-0 pl-0 [&>_div:first-child]:border-t-0">
                {integration.tools.map((tool) => (
                  <div key={tool} className="flex items-center gap-2.5 min-h-13.5 pt-2.5 pr-5 pb-2.5 pl-5 border-t border-border">
                    <span data-ui="tool-icon" className="inline-flex items-center justify-center w-6.25 h-6.25 flex-none rounded-md bg-muted text-muted-foreground">{available ? <Plug aria-hidden="true" className="w-3.5 h-3.5" /> : <Check aria-hidden="true" className="w-3.5 h-3.5" />}</span>
                    <div className="flex flex-1 flex-col min-w-0"><strong className="overflow-hidden text-ellipsis whitespace-nowrap text-caption font-medium capitalize">{tool.replaceAll("_", " ")}</strong><code className="overflow-hidden text-muted-foreground font-mono text-caption text-ellipsis whitespace-nowrap">{tool}</code></div>
                    <Badge variant="outline" className="text-muted-foreground text-caption">{available ? "Available" : "Enabled"}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div data-ui="detail-secondary" className="grid gap-4 min-w-0">
            <Card data-ui="detail-card" className="gap-0 rounded-lg border bg-card p-0 ring-0">
              <CardHeader><CardTitle><KeyRound aria-hidden="true" />Credentials & access</CardTitle><p>Configuration requirements for this connector.</p></CardHeader>
              <CardContent>
                <dl data-ui="facts stacked-facts" className="grid gap-y-3.75 gap-x-5 grid-cols-1 mt-0 mr-0 mb-0 ml-0">
                  <div className="min-w-0"><dt className="text-muted-foreground text-caption">Authentication</dt><dd className="mt-0.75 text-caption font-medium">{integration.authMethod}</dd></div>
                  <div className="min-w-0"><dt className="text-muted-foreground text-caption">Credential value</dt><dd className="mt-0.75 text-caption font-medium">No secrets are stored or displayed by this preview.</dd></div>
                </dl>
                <h3>Required scopes</h3>
                {integration.scopes ? (
                  <ul data-ui="scope-list" className="flex flex-wrap gap-1.5">{integration.scopes.map((scope) => <li key={scope} className="pt-0.75 pr-1.75 pb-0.75 pl-1.75 border border-border rounded-sm bg-background"><code className="font-mono text-caption">{scope}</code></li>)}</ul>
                ) : <p data-ui="detail-muted" className="text-muted-foreground text-caption">{integration.scopeNote ?? "Provider-specific permissions must be confirmed before connecting."}</p>}
              </CardContent>
            </Card>
            <Card data-ui="detail-card" className="gap-0 rounded-lg border bg-card p-0 ring-0">
              <CardHeader><CardTitle><BookOpen aria-hidden="true" />Limits & documentation</CardTitle><p>Check provider requirements before production use.</p></CardHeader>
              <CardContent>
                <h3>Rate limits</h3>
                <p data-ui="detail-muted" className="text-muted-foreground text-caption">{integration.rateLimit ?? "Provider and plan dependent; no limit is asserted in this preview."}</p>
                <a data-ui="doc-link" href={integration.docsUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 mt-4.5 text-primary text-caption font-medium [&:focus-visible]:outline-2 [&:focus-visible]:outline-ring [&:focus-visible]:outline-offset-3 [&:hover]:underline [&:hover]:underline-offset-3">
                  View provider documentation <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
  );
}

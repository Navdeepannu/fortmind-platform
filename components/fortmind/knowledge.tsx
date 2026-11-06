"use client";

import { useState } from "react";
import { BookOpen, Plus, Search } from "lucide-react";
import { useBrowserRecord } from "@/hooks/use-browser-record";
import { demoFacts, factCategories, validFacts, type FactCategory, type TaughtFact } from "@/lib/knowledge-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ruleFilters = ["All rules", "Internal network ranges", "Approved software", "Known accounts"];
const date = (value: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "America/Toronto" }).format(new Date(value));

function FactEditor({ fact, onClose, save }: { fact: TaughtFact | null; onClose: () => void; save: (category: FactCategory, content: string) => boolean }) {
  const [category, setCategory] = useState<FactCategory>(fact?.category ?? "Internal subnets");
  const [content, setContent] = useState(fact?.content ?? "");
  const [error, setError] = useState("");
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent data-ui="preview" className="text-sm leading-5.5 text-foreground max-w-lg"><DialogHeader><DialogTitle>{fact ? "Edit taught fact" : "Teach a fact"}</DialogTitle><DialogDescription>Give OSCAR specific context, not a verdict or an instruction to bypass investigation. This prototype saves facts in this browser only.</DialogDescription></DialogHeader>
    <form onSubmit={event => { event.preventDefault(); if (content.trim().length < 10) { setError("Describe the fact in at least 10 characters."); return; } if (save(category, content.trim())) onClose(); else setError("The fact could not be saved. Check browser storage permissions and try again."); }} className="flex flex-col gap-5">
      <FieldGroup><Field><FieldLabel htmlFor="fact-category">Category</FieldLabel><NativeSelect id="fact-category" value={category} onChange={event => setCategory(event.target.value as FactCategory)}>{factCategories.map(item => <NativeSelectOption key={item} value={item}>{item}</NativeSelectOption>)}</NativeSelect></Field>
        <Field data-invalid={Boolean(error)}><FieldLabel htmlFor="fact-content">Fact</FieldLabel><Textarea id="fact-content" rows={5} required minLength={10} maxLength={2000} value={content} onChange={event => { setContent(event.target.value); setError(""); }} aria-invalid={Boolean(error)} aria-describedby={error ? "fact-error" : "fact-help"} placeholder="Describe a specific, verifiable fact about your environment…" /><FieldDescription id="fact-help">Include the scope and relevant exceptions. Do not include passwords, API keys, or signing secrets.</FieldDescription>{error && <p id="fact-error" role="alert" className="text-xs text-destructive">{error}</p>}</Field>
      </FieldGroup><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">{fact ? "Save fact" : "Teach fact"}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}

export function Knowledge() {
  const facts = useBrowserRecord("fortmind.prototype.knowledge.v1", demoFacts, validFacts);
  const [ruleFilter, setRuleFilter] = useState("All rules");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("active");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<TaughtFact | "new" | null>(null);
  const [retiring, setRetiring] = useState<TaughtFact | null>(null);
  const [message, setMessage] = useState("");
  const scoped = facts.value.filter(item => status === "all" || item.retired === (status === "retired"));
  const visible = scoped.filter(item => (category === "All" || item.category === category) && [item.content, item.category, item.author].join(" ").toLowerCase().includes(query.toLowerCase().trim()));
  function saveFact(nextCategory: FactCategory, content: string) {
    const now = new Date().toISOString();
    const existing = typeof editor === "object" ? editor : null;
    const next: TaughtFact = existing ? { ...existing, category: nextCategory, content, updatedAt: now } : { id: crypto.randomUUID(), category: nextCategory, content, author: "You (local)", createdAt: now, updatedAt: now, usedInCases: 0, retired: false };
    const saved = facts.save(existing ? facts.value.map(item => item.id === next.id ? next : item) : [next, ...facts.value]);
    if (saved) setMessage(`${existing ? "Fact updated" : "Fact taught"} and saved in this browser. OSCAR’s live knowledge has not changed.`);
    return saved;
  }
  return <main data-ui="main" id="preview-main" className="mx-auto w-full min-w-0 p-5 md:p-8 flex flex-col gap-8">
    <header data-ui="page-heading" className="flex flex-wrap justify-between items-center gap-6 max-[1101px]:items-start max-md:items-start max-md:gap-3 !mb-0"><div><h1 className="text-page-title">OSCAR Context</h1><p className="mt-1 text-body text-muted-foreground">Knowledge that helps OSCAR understand your environment during investigations.</p></div><Button disabled={!facts.ready} onClick={() => setEditor("new")}><Plus data-icon="inline-start" />Teach a fact</Button></header>
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span>Customer Zero · reference fixture and browser-local facts</span><Badge variant="outline">No live knowledge service connected</Badge></div>
    {facts.error && <Alert variant="destructive"><AlertTitle>Browser storage issue</AlertTitle><AlertDescription>{facts.error}</AlertDescription></Alert>}
    <section aria-labelledby="rules-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-2xl"><h2 id="rules-heading" className="text-section-title">Rules</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Organization-managed facts about your address ranges, approved software, and known accounts. Rules add context to a case; they never decide its verdict.</p></div><Badge variant="secondary">Managed by organization admins</Badge></div>
      <ToggleGroup aria-label="Rule category" value={[ruleFilter]} onValueChange={values => { if (values[0]) setRuleFilter(values[0]); }} variant="outline" className="flex-wrap justify-start" spacing={1}>{ruleFilters.map(filter => <ToggleGroupItem value={filter} key={filter}>{filter}<span className="text-muted-foreground">0</span></ToggleGroupItem>)}</ToggleGroup>
      <Empty className="border py-6"><EmptyHeader className="max-w-2xl"><BookOpen className="size-5 text-muted-foreground" aria-hidden="true" /><EmptyTitle>{ruleFilter === "All rules" ? "No rules yet" : `No ${ruleFilter.toLowerCase()} rules`}</EmptyTitle><EmptyDescription>Only organization admins can add or change rules. Ask an admin to record verified network ranges, approved software, and known accounts when the rules service is connected.</EmptyDescription></EmptyHeader></Empty>
    </section>
    <Separator />
    <section aria-labelledby="facts-heading" className="flex min-w-0 flex-col gap-4">
      <div><h2 id="facts-heading" className="text-section-title">Taught facts</h2><p className="mt-1 text-sm text-muted-foreground">Context contributed by users, kept separate from admin-managed rules.</p></div>
      <div className="flex flex-wrap items-center justify-between gap-3"><ToggleGroup aria-label="Fact category" value={[category]} onValueChange={values => { if (values[0]) setCategory(values[0]); }} variant="outline" spacing={1} className="flex-wrap justify-start">{["All", ...factCategories].map(item => <ToggleGroupItem value={item} key={item}>{item}<span className="text-muted-foreground">{item === "All" ? scoped.length : scoped.filter(fact => fact.category === item).length}</span></ToggleGroupItem>)}</ToggleGroup>
        <div className="flex min-w-0 flex-wrap gap-2"><NativeSelect aria-label="Fact status" value={status} onChange={event => setStatus(event.target.value)}><NativeSelectOption value="active">Active facts</NativeSelectOption><NativeSelectOption value="retired">Retired facts</NativeSelectOption><NativeSelectOption value="all">All facts</NativeSelectOption></NativeSelect><Input aria-label="Search taught facts" className="w-56 max-w-full" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search taught facts…" /></div>
      </div>
      <p role="status" className="text-xs text-muted-foreground">{message || (facts.ready ? `${visible.length} ${visible.length === 1 ? "fact" : "facts"} shown` : "Loading saved facts…")}</p>
      {visible.length ? <div className="min-w-0 overflow-hidden rounded-lg border bg-card"><Table><TableHeader><TableRow><TableHead className="pl-4">Fact / category</TableHead><TableHead>Usage</TableHead><TableHead>Author / updated</TableHead><TableHead className="pr-4 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{visible.map(fact => <TableRow key={fact.id}><TableCell className="min-w-72 max-w-xl whitespace-normal py-4 pl-4"><p className="leading-6">{fact.content}</p><div className="mt-2 flex gap-2"><Badge variant="secondary">{fact.category}</Badge>{fact.retired && <Badge variant="outline">Retired</Badge>}</div></TableCell><TableCell className="text-xs text-muted-foreground">{fact.usedInCases ? `${fact.usedInCases} demo cases` : "Not used yet"}</TableCell><TableCell className="text-xs leading-6"><p>{fact.author}</p><time dateTime={fact.updatedAt} className="text-muted-foreground" title={`Created ${date(fact.createdAt)} · Updated ${date(fact.updatedAt)}`}>{date(fact.updatedAt)}</time></TableCell><TableCell className="pr-4"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" disabled={fact.retired} onClick={() => setEditor(fact)} aria-label={`Edit fact: ${fact.content}`}>Edit</Button><Button variant="ghost" size="sm" disabled={fact.retired} onClick={() => setRetiring(fact)} aria-label={`Retire fact: ${fact.content}`}>Retire</Button></div></TableCell></TableRow>)}</TableBody></Table></div> : <Empty className="border"><EmptyHeader><Search className="size-5" /><EmptyTitle>No matching facts</EmptyTitle><EmptyDescription>Try a different category, status, or search. You can teach a fact without adding an organization rule.</EmptyDescription></EmptyHeader><Button variant="outline" onClick={() => { setCategory("All"); setQuery(""); setStatus("active"); }}>Clear filters</Button></Empty>}
    </section>
    {editor && <FactEditor key={editor === "new" ? "new" : editor.id} fact={editor === "new" ? null : editor} onClose={() => setEditor(null)} save={saveFact} />}
    <Dialog open={Boolean(retiring)} onOpenChange={open => { if (!open) setRetiring(null); }}><DialogContent data-ui="preview" className="text-sm leading-5.5 text-foreground"><DialogHeader><DialogTitle>Retire this fact?</DialogTitle><DialogDescription>The fact stays in the local record but is excluded from active facts. This does not alter live investigations.</DialogDescription></DialogHeader><p className="text-sm leading-6">{retiring?.content}</p>{facts.error && <p role="alert" className="text-xs text-destructive">{facts.error}</p>}<DialogFooter><Button variant="outline" onClick={() => setRetiring(null)}>Cancel</Button><Button onClick={() => { if (retiring && facts.save(facts.value.map(item => item.id === retiring.id ? { ...item, retired: true, updatedAt: new Date().toISOString() } : item))) { setMessage("Fact retired and saved in this browser."); setRetiring(null); } }}>Retire fact</Button></DialogFooter></DialogContent></Dialog>
  </main>;
}

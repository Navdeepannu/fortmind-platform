import { Info, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SettingsHeading } from "./settings-form";

const sections = [
  ["processing", "Processing & storage"], ["redaction", "Redaction & its limits"], ["retention", "Retention & deletion"],
  ["access", "Sign-in & roles"], ["providers", "Connected tools & providers"], ["audit", "Audit & exports"],
  ["sharing", "Shared summaries"], ["responsibilities", "Your responsibilities"],
] as const;
const processing = [
  ["Cases, evidence summaries, notes, timelines, settings and OSCAR memory", "Google Cloud · us-central1, Iowa, United States", "Until deleted; case deletion is not available in the reference product"],
  ["Database backups", "Google Cloud · United States multi-region", "Last seven daily backups"],
  ["Language-model requests", "Google Cloud global endpoint · any Google Cloud region", "Determined by Google Cloud"],
  ["Redacted recorded lookups and stored-key access logs", "Google Cloud · United States multi-region", "No expiry"],
  ["Connected-tool keys and chat credentials", "Google Cloud · region chosen by Google Cloud", "Until disconnected; see deletion exceptions below"],
  ["Messages between FortCases services", "Google Cloud · region chosen by Google Cloud", "Up to seven days"],
  ["Service logs, which can contain alert details and indicators", "Google Cloud · region chosen by Google Cloud", "30 days"],
  ["Sign-in, membership and roles", "Clerk’s service", "Set by Clerk"],
  ["Escalation, notification and weekly-report email", "Resend’s service", "Set by Resend"],
  ["Optional Slack / Microsoft Teams notifications", "Slack / Microsoft services", "Set by the respective provider"],
  ["Optional browser push notifications", "The browser maker’s push service", "Set by the browser maker"],
  ["Connected-tool queries", "Each connected tool’s vendor", "Set by that vendor"],
];
function DocumentSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-8 border-b py-7 first:pt-0 last:border-0"><h2 id={`${id}-heading`} className="mb-3 text-base font-semibold">{title}</h2><div className="flex flex-col gap-4 text-sm leading-6 text-muted-foreground">{children}</div></section>;
}
export function TrustData() {
  return <div className="mx-auto max-w-6xl">
    <SettingsHeading title="Trust & Data" description="Where FortCases data goes, what is retained, and who can access it. Scope: the case queue, OSCAR investigations, Integrations, Knowledge and FortCases settings." />
    <Alert className="mb-8"><Info /><AlertTitle>Product reference · reviewed November 5, 2026</AlertTitle><AlertDescription>The information below is preserved from the supplied FortMind Trust and Data screenshot. It describes that product’s policies, not a verified deployment of this local prototype. Preferences and taught facts in this prototype are browser-local; no organization backend is connected. Older FortMind incident-triage services are outside this document’s scope.</AlertDescription></Alert>
    <div className="grid min-w-0 gap-10 xl:grid-cols-[minmax(0,1fr)_190px]">
      <article className="min-w-0">
        <DocumentSection id="processing" title="Where data is processed and stored">
          <p>The reference product runs FortCases on Google Cloud in us-central1 (Iowa, United States). The language model uses Google Cloud’s global endpoint and may process requests in any Google Cloud region. Investigation conclusions are stored with the case; memory also holds redacted case summaries, verdict corrections, taught facts, numeric representations for similarity search, and admin-managed rules.</p>
          <div className="overflow-hidden rounded-lg border text-foreground"><Table><TableHeader><TableRow><TableHead className="min-w-60">Data</TableHead><TableHead className="min-w-44">Provider / location</TableHead><TableHead className="min-w-44">Retention in reference</TableHead></TableRow></TableHeader><TableBody>{processing.map(([data, location, retention]) => <TableRow key={data}><TableCell className="whitespace-normal align-top text-xs leading-5">{data}</TableCell><TableCell className="whitespace-normal align-top text-xs leading-5">{location}</TableCell><TableCell className="whitespace-normal align-top text-xs leading-5">{retention}</TableCell></TableRow>)}</TableBody></Table></div>
          <p>Some cloud activity-log and threat-finding results are retained with their evidence summary: at most ten events per lookup, redacted in the same way as recorded lookups and shortened when long.</p>
        </DocumentSection>
        <DocumentSection id="redaction" title="What is redacted, and what is not">
          <Alert><Info /><AlertTitle>The alert itself is not redacted</AlertTitle><AlertDescription>The language model receives the original alert and its indicators. Reports, findings and hypotheses can quote the alert. Analyst notes and stored taught facts are also retained as typed; the model reads a redacted copy of taught facts.</AlertDescription></Alert>
          <p>Most lookup summaries are redacted before reaching the model; the model receives a summary, not the tool’s full response. Recorded lookup requests and responses are redacted before storage. Redaction also covers memory summaries and verdict corrections, failure reasons, certain review summaries, and notification content. The source does not claim that all sensitive data is removed.</p>
          <details className="rounded-lg border px-4 py-3"><summary className="cursor-pointer font-medium text-foreground">Redaction rules and known gaps</summary><div className="mt-4 flex flex-col gap-4">
            <p><strong className="text-foreground">Replaced with a code:</strong> plain-text email addresses, supported phone-number formats, and private, loopback or link-local IPv4 addresses.</p>
            <p><strong className="text-foreground">Removed:</strong> recognized US Social Security and payment-card numbers, Authorization headers, Bearer tokens, and credential values under recognized names such as api_key, client_secret, access_token, refresh_token, password and secret. URL parameters named token or key also lose their values.</p>
            <p><strong className="text-foreground">May remain:</strong> public IPv4 and IPv6 addresses, hostnames, domains, file hashes, non-email usernames, encoded email addresses, numeric JSON values, and credentials under unrecognized names such as user_password or the URL parameter sig. The reference lists additional edge cases; redaction is not a substitute for minimizing submitted data.</p>
            <p>In stored lookups, admins see stable replacement codes that permit correlation across cases; members see only value types such as &lt;email&gt;. Notification and shared-summary masking has its own rules and should not be treated as identical to lookup redaction.</p>
          </div></details>
          <p>Admin rules are stored as entered. For matching rules, the model sees the case’s matched address, account or hash, not the stored address range or account rule. Rule notes, software names and publishers are redacted before model use. Unmatched rules contribute only a count. A rule never decides a verdict; concerning activity still requires review.</p>
        </DocumentSection>
        <DocumentSection id="retention" title="Retention and deletion">
          <p className="font-medium text-foreground">The source explicitly states that case data is not automatically deleted, apart from shared-link records. FortCases does not yet offer case deletion.</p>
          <ul className="ml-5 flex list-disc flex-col gap-2"><li>Cases, held alerts, evidence, timelines, memory and recorded lookups have no automatic end date. Closing a held alert as noise retains its record.</li><li>Deleting an organization does not delete its cases, recorded lookups, OSCAR memory or connected-tool keys. Shared links are an exception and are removed when the organization is deleted.</li><li>Disconnecting a tool or deleting a custom connector deletes its keys, while prior tool results stay with their cases.</li><li>Retiring a fact stops its use; the fact remains on record. Removed never-act-on entries also remain recorded with who removed them and when.</li><li>Analysts can delete their own notes; the timeline records the deletion. Rerunning analysis replaces prior findings.</li><li>Shared links are deleted seven days after expiry or revocation; revocation empties the summary immediately.</li></ul>
          <details className="rounded-lg border px-4 py-3"><summary className="cursor-pointer font-medium text-foreground">Additional retention exceptions</summary><p className="mt-3">A replaced signing secret is deleted after its 24-hour overlap. Handled chat requests clear after an hour; link codes clear a day after expiry. Linked Slack accounts remain until unlinked, disconnected, or moved to another workspace. Disconnecting or replacing a response-action key deletes the key; a failed deletion requires manual handling. Its connection record has no expiry, and organization deletion keeps both the response key and that record. Above 2,000 held alerts with content per hour, additional records omit alert content.</p></details>
        </DocumentSection>
        <DocumentSection id="access" title="Sign-in, roles and permissions">
          <p>Clerk manages sign-in, members and roles. The source supports password or email-code sign-in and Google or Microsoft accounts. Two-step verification is optional rather than mandatory. Organization SAML single sign-on is not available in that reference.</p>
          <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-lg border p-4"><h3 className="mb-2 font-medium text-foreground">Admins</h3><p>Manage FortCases settings, rules, tools, signing secrets and organization chat integrations. Admins approve or reject proposed actions, manage response-action credentials and the never-act-on list, export audit trails, and create or revoke shared summaries.</p></div><div className="rounded-lg border p-4"><h3 className="mb-2 font-medium text-foreground">Members</h3><p>Work cases, write notes, teach facts, read rules, inspect held alerts, and manage their own preferences and Slack linkage. Other organization role names count as member. Client-organization actions require the role granted by that organization.</p></div></div>
          <p>This local prototype does not authenticate users or enforce organization permissions. Editing local demo settings does not grant production permissions.</p>
        </DocumentSection>
        <DocumentSection id="providers" title="Connected tools, notifications and third parties">
          <p>OSCAR sends connected tools the indicators it looks up, such as IP addresses, domains and hashes. Lookups of organization hosts and accounts are restricted to the organization’s own security systems in the source. Do not assume that configuring a connector prevents disclosure of all sensitive indicators.</p>
          <p>The reference generally uses read-only tool access. It describes an explicit exception for optional Elastic Security write-back: acknowledging an alert after a verdict, or closing it when OSCAR closes a case as benign, requires update permissions. Optional Slack approvals also require additional Slack permissions. These exceptions are not connected in this prototype.</p>
          <p>Resend handles email, Clerk supplies sign-in email addresses, and enabled chat channels send content to Slack or Microsoft. Browser push uses the browser maker’s push service. Case notifications carry masked titles and links; weekly email carries organization-level counts, rates, times and a link, rather than case titles, model details or costs. Provider-side retention is controlled by each provider.</p>
          <p>Response recommendations may be measured using existing lookup access in the reference product. Response execution cannot yet be enabled. A verdict based on the alert alone is distinguished from one supported by a planned, successful tool lookup; unsupported verdicts require analyst review.</p>
        </DocumentSection>
        <DocumentSection id="audit" title="Audit trails and exports">
          <p>The source records case activity and who performed it. Admin JSON export includes the timeline, reasoning, actions and decisions, notes, and recorded requests and responses for up to 500 lookups per case. Large entries can be shortened or omitted with a marker. CSV contains the timeline without recorded lookup payloads.</p>
          <p>Recording is best-effort. A failed recording is marked as not recorded; if stored lookups cannot be read when exporting, JSON export fails rather than silently producing an incomplete file. There is no organization-wide audit export in the source. These audit exports are distinct from the demo operational Reports CSV.</p>
        </DocumentSection>
        <DocumentSection id="sharing" title="Sharing a case summary">
          <p>An admin can create a read-only summary link that anyone with the link can open without signing in. Links can last 1, 7, 14 or 30 days, with at most 20 open links per case. They contain a snapshot taken at creation and do not update with the case.</p>
          <p>The summary excludes original alerts, tool payloads, cost and model details, and certain indicator-bearing timeline entries. It includes case context, conclusions and a timeline. Some information is masked, but hostnames, domains, file hashes, names, usernames and public IPv6 addresses in titles or conclusions may remain visible. Admins preview a summary before sharing. Creation, revocation and open counts are recorded.</p>
        </DocumentSection>
        <DocumentSection id="responsibilities" title="Risks, limitations and organizational responsibilities">
          <p>Review data routing, provider terms, redaction gaps and retention before connecting tools or forwarding alerts. Restrict credential scope, protect signing secrets, review access and shared links, and establish your own investigation and response approval policy. No compliance certification or universal deletion guarantee is asserted here.</p>
          <p>OSCAR’s conclusions need review against evidence. A matched rule does not establish that activity is safe, and confidence does not itself authorize response actions. Browser-local prototype configuration is not a substitute for server-side authorization, audit logging or policy enforcement.</p>
          <a href="mailto:support@fortmind.ai" className="inline-flex items-center gap-2 self-start font-medium text-foreground underline underline-offset-4"><Mail className="size-4" aria-hidden="true" />Contact support@fortmind.ai</a>
        </DocumentSection>
      </article>
      <aside className="hidden xl:block"><nav aria-label="On this page" className="sticky top-8 flex flex-col gap-1 border-l pl-5"><p className="mb-2 text-xs font-medium text-foreground">On this page</p>{sections.map(([id, title]) => <a key={id} href={`#${id}`} className="rounded py-1.5 text-xs leading-5 text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring">{title}</a>)}</nav></aside>
    </div>
  </div>;
}

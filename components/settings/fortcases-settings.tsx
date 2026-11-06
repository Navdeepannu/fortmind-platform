"use client";

import { useState } from "react";
import { LockKeyhole, Mail, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { demoSpend, validEmail } from "@/lib/settings-data";
import { SettingRow, SettingsForm, SettingsGroup, useSettingsForm } from "./settings-form";

function ConfidenceControl({ label, value, onChange, disabled }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return <div className="flex w-full items-center gap-4"><Slider aria-label={label} min={0} max={100} step={1} value={[value]} onValueChange={next => onChange(Array.isArray(next) ? next[0] : next)} disabled={disabled} /><output className="w-10 shrink-0 text-right text-sm tabular-nums" aria-label={`${label} value`}>{value}%</output></div>;
}

export function InvestigationsSettings() {
  const form = useSettingsForm("investigations");
  const value = form.value;
  return <SettingsForm title="Investigations" description="Set how OSCAR evaluates evidence, asks for review, and uses previous investigations." state={form}>
    <SettingsGroup title="Autonomy" description="Choose the level of analyst oversight for this demo configuration.">
      <RadioGroup aria-label="Autonomy mode" value={value.mode} onValueChange={mode => { if (mode === "observe" || mode === "confirm") form.change({ ...value, mode }); }} className="gap-0">
        {[
          { id: "observe", title: "Observe", description: "Investigate and propose a verdict. An analyst makes the decision." },
          { id: "confirm", title: "Act with Confirmation", description: "Prepare proposed actions and require an analyst’s confirmation." },
          { id: "report", title: "Act and Report", description: "Requires organization administrator approval and connected enforcement. Unavailable in this prototype." },
        ].map(mode => <label key={mode.id} className="flex cursor-pointer items-start gap-3 border-b px-5 py-4 last:border-0 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"><RadioGroupItem value={mode.id} disabled={mode.id === "report"} className="mt-0.5" /><span className="flex flex-col gap-1"><span className="text-sm font-medium">{mode.title}</span><span className="text-xs leading-5 text-muted-foreground">{mode.description}</span></span></label>)}
      </RadioGroup>
    </SettingsGroup>
    <SettingsGroup title="Confidence thresholds" description="Investigation confidence is separate from the verdict. These are prototype policy values, not calibrated probabilities.">
      <SettingRow label="Analyze confidence" description="Below this threshold, request analyst review."><ConfidenceControl label="Analyze confidence" value={value.analyze} onChange={analyze => form.change({ ...value, analyze })} /></SettingRow>
      <SettingRow label="Report confidence" description="Minimum confidence before accepting the report."><ConfidenceControl label="Report confidence" value={value.report} onChange={report => form.change({ ...value, report })} /></SettingRow>
      <SettingRow label="Auto-close confidence" description="Available with Act and Report and organization approval."><ConfidenceControl label="Auto-close confidence" value={value.autoClose} onChange={() => {}} disabled /></SettingRow>
    </SettingsGroup>
    <SettingsGroup title="Investigation limits">
      <SettingRow label="Investigation timeout" htmlFor="timeout" description="Maximum time before a case needs attention. Minutes, from 1 to 120."><Input id="timeout" type="number" min={1} max={120} step={1} required value={value.timeout} onChange={event => form.change({ ...value, timeout: Number(event.target.value) })} /></SettingRow>
      <SettingRow label="Memory depth" htmlFor="memory" description="Maximum prior investigations to consider as context."><NativeSelect id="memory" value={value.memory} onChange={event => form.change({ ...value, memory: Number(event.target.value) })}>{[0, 5, 10, 20, 50].map(n => <NativeSelectOption key={n} value={n}>{n === 0 ? "No prior cases" : `${n} prior cases`}</NativeSelectOption>)}</NativeSelect></SettingRow>
    </SettingsGroup>
  </SettingsForm>;
}

export function AlertsSettings() {
  const form = useSettingsForm("alerts"); const value = form.value;
  return <SettingsForm title="Alerts" description="Manage alert intake and the way repeated detections are grouped before investigation." state={form}>
    <SettingsGroup title="Alert intake" description="A connected organization API is required to provide an intake endpoint and organization identifier.">
      <SettingRow label="Intake endpoint" htmlFor="intake-endpoint" description="The source product uses /api/cases/ingest. No live endpoint has been provisioned for this prototype."><Input id="intake-endpoint" value="Not connected" readOnly disabled /></SettingRow>
      <SettingRow label="Organization identifier" htmlFor="organization-id" description="Customer Zero is a local prototype workspace."><Input id="organization-id" value="Not available" readOnly disabled /></SettingRow>
      <div className="flex flex-col gap-3 px-5 py-4"><h3 className="flex items-center gap-2 text-sm font-medium"><LockKeyhole className="size-4" aria-hidden="true" />Signing and secret management</h3><ol className="ml-4 flex list-decimal flex-col gap-2 text-xs leading-5 text-muted-foreground"><li>Obtain the organization’s endpoint and signing specification from your administrator.</li><li>The reference uses <code>X-FortMind-Signature: sha256=&lt;hex&gt;</code>, where the hex value is the HMAC-SHA256 of the exact request body keyed with the signing secret. Store the secret in your approved secret manager.</li><li>Verify a test event in intake logs before enabling forwarding.</li></ol><p className="text-xs leading-5 text-muted-foreground">Signing configuration is not connected. This prototype cannot reveal, issue, or rotate signing secrets. Do not paste secrets into these forms.</p><Button type="button" variant="outline" disabled className="self-start">Secret management unavailable</Button></div>
    </SettingsGroup>
    <SettingsGroup title="Repeat detection" description="Measure repeated detections while each alert continues to open its own case.">
      <SettingRow label="Measure repeated alerts" htmlFor="repeat-detection" description="Measure only: each alert still opens its own case. Live repeat grouping is not available."><Switch id="repeat-detection" checked={value.repeatDetection} onCheckedChange={repeatDetection => form.change({ ...value, repeatDetection })} /></SettingRow>
      <SettingRow label="Detection time window" htmlFor="repeat-window" description="Compare alerts within this many minutes. Range: 1–1,440."><Input id="repeat-window" type="number" min={1} max={1440} step={1} required disabled={!value.repeatDetection} value={value.window} onChange={event => form.change({ ...value, window: Number(event.target.value) })} /></SettingRow>
      <div className="px-5 py-4"><FieldGroup><Field><FieldLabel htmlFor="excluded-rules">Excluded detection rules</FieldLabel><Textarea id="excluded-rules" value={value.excludedRules} maxLength={4000} rows={4} onChange={event => form.change({ ...value, excludedRules: event.target.value })} placeholder="One detection rule ID per line" /><FieldDescription>These rule IDs would bypass repeat grouping. No live alert processing is changed.</FieldDescription></Field></FieldGroup></div>
    </SettingsGroup>
  </SettingsForm>;
}

export function EscalationSettings() {
  const form = useSettingsForm("escalation"); const value = form.value;
  const [email, setEmail] = useState(""); const [error, setError] = useState("");
  function addRecipient() {
    const normalized = email.trim().toLowerCase();
    if (!validEmail(normalized)) { setError("Enter a valid email address."); return; }
    if (value.recipients.includes(normalized)) { setError("This recipient is already listed."); return; }
    if (value.recipients.length >= 20) { setError("Use at most 20 recipients."); return; }
    form.change({ ...value, recipients: [...value.recipients, normalized] }); setEmail(""); setError("");
  }
  return <SettingsForm title="Escalation" description="Decide who should be notified when evidence is insufficient, confidence is below policy, or an investigation fails." state={form}>
    <SettingsGroup title="Escalation notifications">
      <SettingRow label="Notify escalation recipients" htmlFor="escalation-enabled" description="Organization-wide routing, separate from your personal notifications."><Switch id="escalation-enabled" checked={value.enabled} onCheckedChange={enabled => form.change({ ...value, enabled })} /></SettingRow>
      <div className="px-5 py-4 text-xs leading-5 text-muted-foreground">Escalation can occur when OSCAR needs an analyst’s decision, an investigation reaches a configured limit, or a tool failure prevents completion. Notification delivery needs a connected backend.</div>
    </SettingsGroup>
    <SettingsGroup title="Email recipients" description="Add up to 20 addresses. Changes remain local until a delivery service is connected.">
      {value.recipients.length === 0 ? <Empty><EmptyHeader><Mail className="size-5" aria-hidden="true" /><EmptyTitle>No recipients added</EmptyTitle><EmptyDescription>Add a recipient to review the escalation configuration. No emails are sent by this prototype.</EmptyDescription></EmptyHeader></Empty> : <ul className="divide-y">{value.recipients.map(recipient => <li key={recipient} className="flex items-center justify-between gap-3 px-5 py-3"><span className="min-w-0 break-all text-sm">{recipient}</span><Button type="button" variant="ghost" size="icon" aria-label={`Remove ${recipient}`} onClick={() => form.change({ ...value, recipients: value.recipients.filter(item => item !== recipient) })}><Trash2 /></Button></li>)}</ul>}
      <div className="px-5 py-4"><FieldGroup><Field data-invalid={Boolean(error)}><FieldLabel htmlFor="recipient-email">Add recipient</FieldLabel><div className="flex flex-wrap gap-2"><Input id="recipient-email" type="email" className="min-w-0 flex-1" value={email} aria-invalid={Boolean(error)} aria-describedby={error ? "recipient-error" : undefined} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addRecipient(); } }} onChange={event => { setEmail(event.target.value); setError(""); }} placeholder="analyst@example.com" /><Button type="button" variant="outline" onClick={addRecipient}><Plus data-icon="inline-start" />Add</Button></div>{error && <p id="recipient-error" role="alert" className="text-xs text-destructive">{error}</p>}</Field></FieldGroup></div>
    </SettingsGroup>
  </SettingsForm>;
}

export function ResponsesSettings() {
  const form = useSettingsForm("responses"); const value = form.value;
  return <SettingsForm title="Responses" description="Set the boundary between recommending a response and taking action on an account or asset." state={form}>
    <SettingsGroup title="Response mode">
      <RadioGroup aria-label="Response mode" value={value.mode} onValueChange={mode => { if (mode === "off" || mode === "measure") form.change({ mode }); }} className="gap-0">
        {[{ id: "off", title: "Off", text: "Do not prepare response recommendations in the demo policy." }, { id: "measure", title: "Measure Only", text: "Review proposed responses without executing them. No account or endpoint is changed." }].map(mode => <label key={mode.id} className="flex cursor-pointer items-start gap-3 border-b px-5 py-4 last:border-0"><RadioGroupItem value={mode.id} className="mt-0.5" /><span className="flex flex-col gap-1"><span className="font-medium">{mode.title}</span><span className="text-xs leading-5 text-muted-foreground">{mode.text}</span></span></label>)}
      </RadioGroup>
    </SettingsGroup>
    <SettingsGroup title="Response execution" description="Not connected"><div className="flex flex-col gap-3 px-5 py-4"><Badge variant="secondary" className="self-start">Unavailable</Badge><p className="text-sm leading-6 text-muted-foreground">Actions such as disabling a compromised account or isolating a host require provider integrations, authorization, approval policies, and an audit trail. They cannot be enabled or executed here.</p><Button type="button" variant="outline" disabled className="self-start">Response actions unavailable</Button></div></SettingsGroup>
    <SettingsGroup title="Recent response activity"><Empty><EmptyHeader><EmptyTitle>No connected response activity</EmptyTitle><EmptyDescription>No live response actions have been executed or measured by this prototype.</EmptyDescription></EmptyHeader></Empty></SettingsGroup>
  </SettingsForm>;
}

export function SpendSettings() {
  const form = useSettingsForm("spend"); const value = form.value;
  const usage = Math.round(demoSpend.amount / value.dailyBudget * 1000) / 10;
  return <SettingsForm title="Spend & Impact" description="Set an investigation budget and the assumptions used to estimate analyst time saved." state={form}>
    <SettingsGroup title="Investigation budget" description="USD demo values. Local limits are not enforced against an investigation service.">
      <div className="flex flex-col gap-3 px-5 py-4"><div className="flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">Today’s spend · demo snapshot {demoSpend.date}</p><p className="mt-1 text-2xl font-semibold tabular-nums">${demoSpend.amount.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">USD</span></p></div><span className="text-xs tabular-nums text-muted-foreground">{usage}% of ${value.dailyBudget.toFixed(2)}</span></div><Progress value={Math.min(usage, 100)} aria-label="Demo daily budget used" />{usage > 100 && <p role="status" className="text-xs text-warning-foreground">Demo usage exceeds the proposed budget. Saving this value does not stop live investigations.</p>}</div>
      <SettingRow label="Daily budget (USD)" htmlFor="daily-budget" description="Amount from $1 to $100,000 per day."><Input id="daily-budget" type="number" min={1} max={100000} step="0.01" required value={value.dailyBudget} onChange={event => form.change({ ...value, dailyBudget: Number(event.target.value) })} /></SettingRow>
    </SettingsGroup>
    <SettingsGroup title="Impact assumptions" description="Planning assumptions, distinct from measured reporting metrics.">
      <SettingRow label="Analyst minutes per case" htmlFor="analyst-minutes" description="Used to estimate saved analyst time. Not a measured time study."><Input id="analyst-minutes" type="number" min={1} max={480} step={1} required value={value.analystMinutes} onChange={event => form.change({ ...value, analystMinutes: Number(event.target.value) })} /></SettingRow>
      <SettingRow label="Autonomy goal" description="Target share of decisions completed without an analyst."><ConfidenceControl label="Autonomy goal" value={value.autonomyGoal} onChange={autonomyGoal => form.change({ ...value, autonomyGoal })} /></SettingRow>
    </SettingsGroup>
  </SettingsForm>;
}

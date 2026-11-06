"use client";

import { useId, type ReactNode } from "react";
import { Info } from "lucide-react";
import { useBrowserDraft } from "@/hooks/use-browser-record";
import { settingsDefaults, settingsValidators, type SettingsValues } from "@/lib/settings-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

export function useSettingsForm<K extends keyof SettingsValues>(section: K) {
  return useBrowserDraft<SettingsValues[K]>(`fortmind.prototype.settings.${section}.v1`, settingsDefaults[section], settingsValidators[section]);
}
export function SettingsHeading({ title, description, personal = false }: { title: string; description: string; personal?: boolean }) {
  return <header className="mb-8 flex flex-col gap-3">
    <p className="text-xs text-muted-foreground">Settings <span aria-hidden="true">/</span> {personal ? "Personal" : title === "Trust & Data" ? "Organization" : "FortCases"}</p>
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-page-title">{title}</h1><Badge variant="outline">{personal ? "Personal preferences" : "Organization settings"}</Badge></div>
    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
  </header>;
}
type FormState = { ready: boolean; dirty: boolean; persisted: boolean; message: string; error: string | null; commit: () => boolean; discard: () => void };
export function SettingsForm({ title, description, personal, state, children }: { title: string; description: string; personal?: boolean; state: FormState; children: ReactNode }) {
  return <div className="mx-auto max-w-[780px]">
    <SettingsHeading title={title} description={description} personal={personal} />
    <Alert className="mb-8"><Info /><AlertTitle>Local prototype preferences</AlertTitle><AlertDescription>{personal ? "Preferences are saved in this browser. Notification delivery is not connected." : "Save to this browser to review the configuration. Live organization changes require an administrator and a connected settings service."}</AlertDescription></Alert>
    <form onSubmit={event => { event.preventDefault(); state.commit(); }} className="flex flex-col gap-8" aria-busy={!state.ready}>
      <fieldset disabled={!state.ready} className="flex min-w-0 flex-col gap-8">{children}</fieldset>
      {state.error && <Alert variant="destructive" role="alert"><AlertTitle>Changes not saved</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert>}
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t bg-background py-4">
        <p role="status" className="max-w-md text-xs leading-5 text-muted-foreground">{state.dirty ? "Unsaved changes" : state.message || (state.persisted ? "Saved in this browser" : state.ready ? "Demo defaults · no saved configuration" : "Loading browser preferences…")}</p>
        <div className="flex gap-2"><Button variant="outline" type="button" disabled={!state.dirty} onClick={state.discard}>Discard</Button><Button type="submit" disabled={!state.ready || !state.dirty}>Save changes</Button></div>
      </div>
    </form>
  </div>;
}
export function SettingsGroup({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const id = useId();
  return <section aria-labelledby={id} className="min-w-0 overflow-hidden rounded-lg border bg-card">
    <header className="px-6 py-5"><h2 id={id} className="text-section-title">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}</header>
    <Separator />
    <FieldGroup className="gap-0 divide-y">{children}</FieldGroup>
  </section>;
}
export function SettingRow({ label, description, htmlFor, children }: { label: string; description?: string; htmlFor?: string; children: ReactNode }) {
  return <Field orientation="responsive" className="px-6 py-5">
    <FieldContent className="min-w-0"><FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>{description && <FieldDescription>{description}</FieldDescription>}</FieldContent>
    <div className="flex w-full min-w-0 items-center gap-3 @md/field-group:basis-64 @md/field-group:shrink-0 @md/field-group:justify-end">{children}</div>
  </Field>;
}

"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SemanticBadge } from "./semantic";
import { addPreviewCase } from "@/lib/preview-case-store";
import { workflowStates } from "@/lib/semantic-states";
import { cn } from "@/lib/utils";

export function NewCase({
  placement = "page",
}: {
  placement?: "page" | "sidebar";
}) {
  const [created, setCreated] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setCreated(null);
          setTitle("");
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            data-ui="new-case sidebar-new-case"
            variant="brand"
            size="lg"
            className={cn(
              "max-md:[&>_svg]:hidden",
              placement === "sidebar" &&
                "w-full justify-start gap-2.5 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 [&>span]:group-data-[collapsible=icon]:hidden",
            )}
            aria-label={placement === "sidebar" ? "Create new case" : undefined}
            title={placement === "sidebar" ? "Create new case" : undefined}
          />
        }
      >
        <Plus data-icon="inline-start" />
        <span>New case</span>
      </DialogTrigger>
      <DialogContent
        data-ui="preview workspace new-case-dialog"
        className="text-body text-foreground max-w-[min(calc(100vw-2rem),500px)] gap-6 p-6 sm:max-w-[500px]"
      >
        <DialogHeader>
          <DialogTitle>
            {created ? "Case prepared for investigation" : "New case"}
          </DialogTitle>
          <DialogDescription>
            {created
              ? "Your case is queued in this preview workspace and saved for this browser tab."
              : "Add an alert to this preview workspace for OSCAR to investigate."}
          </DialogDescription>
        </DialogHeader>
        {created ? (
          <>
            <div
              data-ui="created-case"
              className="flex flex-col gap-3.5 items-start"
            >
              <span
                data-ui="created-mark"
                className="inline-flex size-9 items-center justify-center rounded-md border border-success-border text-success-foreground"
              >
                <Check className="size-4 stroke-[1.75]" />
              </span>
              <h3 className="text-panel-title">{title}</h3>
              <code>{created}</code>
              <SemanticBadge
                definition={workflowStates.Queued}
                treatment="status"
                showIcon={false}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button />}>Done</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const context = String(
                new FormData(event.currentTarget).get("context") ?? "",
              );
              setCreated(addPreviewCase(title, context).id);
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-case-title">Case title</FieldLabel>
                <Input
                  id="new-case-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Describe the activity to investigate"
                  required
                  minLength={5}
                  maxLength={160}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-case-context">
                  Alert context
                </FieldLabel>
                <Textarea
                  name="context"
                  id="new-case-context"
                  placeholder="Include the alert details, affected entities, and what needs to be verified."
                  rows={4}
                  required
                />
                <FieldDescription>
                  Do not include passwords or API keys.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit">Create preview case</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Check, ChevronDown, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { SemanticBadge } from "@/components/fortmind/semantic";
import { outcomeStates } from "@/lib/semantic-states";
import { verdicts, type Verdict } from "@/lib/preview-data";
import type { PreviewVerdictReview } from "@/lib/case-overview-data";

export function ReviewVerdict({
  proposedVerdict,
  owner,
  reason,
  status,
}: {
  proposedVerdict: Verdict;
  owner: string | null;
  reason: string;
  status: string;
}) {
  const [open, setOpen] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>(proposedVerdict);
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState(false);
  const [review, setReview] = useState<PreviewVerdictReview | null>(null);
  const [intent, setIntent] = useState<"confirm" | "override">("confirm");
  const correcting = verdict !== proposedVerdict;

  function beginReview(nextIntent: "confirm" | "override") {
    setIntent(nextIntent);
    setVerdict(proposedVerdict);
    setRationale("");
    setError(false);
    setOpen(true);
  }

  function changeOpen(next: boolean) {
    if (next) {
      setVerdict(review?.verdict ?? proposedVerdict);
      setRationale(review?.rationale ?? "");
      setError(false);
    }
    setOpen(next);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      (intent === "override" && !correcting) ||
      (correcting && !rationale.trim())
    ) {
      setError(true);
      document
        .getElementById(
          intent === "override" && !correcting
            ? "review-verdict"
            : "review-rationale",
        )
        ?.focus();
      return;
    }
    setReview({
      verdict,
      rationale: rationale.trim(),
      originalVerdict: proposedVerdict,
    });
    setOpen(false);
  }

  return (
    <aside
      data-ui="decision"
      className="[align-self:start] pt-5 pr-5 pb-5 pl-5 border border-border rounded-md bg-muted"
      aria-labelledby="decision-heading"
    >
      <h3 id="decision-heading" className="text-base [font-weight:550]">
        Your decision
      </h3>
      <div data-ui="decision-body" className="flex flex-col gap-4 mt-3.25">
        <div>
          <p
            data-ui="decision-title"
            className="text-sm font-medium [&_+_p]:mt-1.25"
          >
            <SemanticBadge
              definition={outcomeStates["Human review required"]}
              treatment="inline"
            />
          </p>
          <p
            data-ui="secondary"
            className="text-muted-foreground text-[13px] leading-5.25"
          >
            {reason}
          </p>
        </div>
        <dl data-ui="decision-meta" className="text-xs">
          <div>
            <dt className="text-muted-foreground">Assigned to</dt>
            <dd className="flex items-center gap-1.5 mt-0.75 wrap-anywhere text-[13px]">
              <UserRound
                aria-hidden="true"
                className="w-3.5 h-3.5 text-muted-foreground"
              />
              {owner ?? "Unassigned"}
            </dd>
          </div>
        </dl>
        <div
          data-ui="review-result"
          className="flex flex-col gap-1.75 pt-3.25 border-t border-border text-[13px] [&:empty]:hidden [&>_p:first-child]:flex [&>_p:first-child]:items-center [&>_p:first-child]:gap-1.5"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {review && (
            <>
              <p>
                <Check className="size-3.5" aria-hidden="true" />
                <strong>Preview decision: {review.verdict}</strong>
              </p>
              {review.rationale && (
                <p
                  data-ui="rationale"
                  className="max-h-40 overflow-y-auto wrap-anywhere whitespace-pre-wrap"
                >
                  {review.rationale}
                </p>
              )}
              <p
                data-ui="secondary"
                className="text-muted-foreground text-[13px] leading-5.25"
              >
                Held in this page only. Case status remains Needs you.
              </p>
            </>
          )}
        </div>
        {status === "Needs you" ? (
          <div
            data-ui="decision-actions"
            className="grid grid-cols-1 gap-2 @max-[501px]/case:grid-cols-1 [&>_[data-slot='dropdown-menu-trigger']]:[justify-self:start]"
          >
            <Button
              size="lg"
              onClick={() => beginReview("confirm")}
              className="min-h-9.5 w-full"
            >
              Confirm verdict
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => beginReview("override")}
              className="min-h-9.5 w-full"
            >
              Override verdict
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="sm" />}
              >
                More actions{" "}
                <ChevronDown data-icon="inline-end" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    Unavailable in this preview
                  </DropdownMenuLabel>
                  <DropdownMenuItem disabled>Escalate case</DropdownMenuItem>
                  <DropdownMenuItem disabled>Teach OSCAR</DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    Rerun investigation
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <p
            data-ui="secondary"
            className="text-muted-foreground text-[13px] leading-5.25"
          >
            Verdict review is available when this case needs an analyst
            decision.
          </p>
        )}
        <Dialog open={open} onOpenChange={changeOpen}>
          <DialogContent
            data-ui="preview case review-dialog"
            className="text-foreground max-h-[calc(100dvh-2rem)] max-w-[min(560px,calc(100%-2rem))] gap-6 overflow-y-auto p-6 text-sm sm:max-w-[560px]"
          >
            <DialogHeader className="pr-7">
              <Badge variant="outline">Local preview</Badge>
              <DialogTitle>
                {intent === "confirm"
                  ? "Confirm OSCAR’s verdict"
                  : "Override OSCAR’s verdict"}
              </DialogTitle>
              <DialogDescription>
                Record your assessment of this case. OSCAR’s original proposal
                remains {proposedVerdict.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="flex min-w-0 flex-col gap-5">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="review-verdict">Your verdict</FieldLabel>
                  <NativeSelect
                    id="review-verdict"
                    value={verdict}
                    disabled={intent === "confirm"}
                    aria-invalid={
                      (error && intent === "override" && !correcting) ||
                      undefined
                    }
                    aria-describedby={
                      error && intent === "override" && !correcting
                        ? "review-verdict-error"
                        : undefined
                    }
                    onChange={(event) => {
                      const value = verdicts.find(
                        (item) => item === event.target.value,
                      );
                      if (value) setVerdict(value);
                      setError(false);
                    }}
                  >
                    {verdicts.map((value) => (
                      <NativeSelectOption key={value} value={value}>
                        {value}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldDescription>
                    {intent === "override"
                      ? "Choose a verdict different from OSCAR’s proposal."
                      : "This confirms OSCAR’s proposed verdict."}
                  </FieldDescription>
                  {error && intent === "override" && !correcting && (
                    <FieldError id="review-verdict-error">
                      Choose a different verdict to override OSCAR.
                    </FieldError>
                  )}
                </Field>
                <Field data-invalid={(error && correcting) || undefined}>
                  <FieldLabel htmlFor="review-rationale">
                    Rationale{" "}
                    {correcting ? "(required for a correction)" : "(optional)"}
                  </FieldLabel>
                  <Textarea
                    id="review-rationale"
                    value={rationale}
                    onChange={(event) => {
                      setRationale(event.target.value);
                      setError(false);
                    }}
                    placeholder="What evidence supports your decision?"
                    rows={3}
                    maxLength={2000}
                    aria-required={correcting}
                    aria-invalid={error || undefined}
                    aria-describedby={
                      error ? "review-rationale-error" : undefined
                    }
                  />
                  {error && (
                    <FieldError id="review-rationale-error">
                      Add a rationale for changing the verdict.
                    </FieldError>
                  )}
                </Field>
              </FieldGroup>
              <p
                data-ui="secondary"
                className="text-muted-foreground text-[13px] leading-5.25"
              >
                This preview keeps the decision in memory until you reload. It
                does not close the case, execute a response, or change OSCAR’s
                future investigations.
              </p>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button type="submit" className="min-h-9.5">
                  {intent === "override"
                    ? "Apply correction in preview"
                    : "Confirm in preview"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <p data-ui="fine-print" className="text-muted-foreground text-xs">
          Local preview · no case changes are persisted
        </p>
      </div>
    </aside>
  );
}

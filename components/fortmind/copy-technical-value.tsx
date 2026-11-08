"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function CopyTechnicalValue({
  label,
  value,
  technical = true,
}: {
  label: string;
  value: string;
  technical?: boolean;
}) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [failedValue, setFailedValue] = useState<string | null>(null);
  const copied = copiedValue === value;
  const failed = failedValue === value;
  const Value = technical ? "code" : "span";
  return (
    <span
      data-ui="copy-value"
      className="inline-flex max-w-full min-w-0 items-start gap-1"
    >
      <Value className={cn("min-w-0 self-center text-caption wrap-anywhere whitespace-normal select-all tracking-normal font-normal text-foreground", technical ? "font-mono" : "font-sans")}>
        {value}
      </Value>
      <Tooltip>
        <TooltipTrigger
          delay={500}
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Copy ${label}`}
              className="flex-none text-muted-foreground"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(value);
                  setCopiedValue(value);
                  setFailedValue(null);
                } catch {
                  setCopiedValue(null);
                  setFailedValue(value);
                }
              }}
            />
          }
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied" : `Copy ${label}`}</TooltipContent>
      </Tooltip>
      <span className="sr-only" role="status">
        {copied ? `${label} copied` : failed ? `Could not copy ${label}` : ""}
      </span>
    </span>
  );
}

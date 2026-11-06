"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyIdentifier({
  value,
  label,
  display = value,
}: {
  value: string;
  label: string;
  display?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <span
      data-ui="copy-identifier"
      className="inline-flex items-center gap-0.75 min-w-0"
    >
      <code title={value}>{display}</code>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
        onClick={async () => {
          clearTimeout(timer.current);
          try {
            await navigator.clipboard.writeText(value);
            setState("copied");
          } catch {
            setState("failed");
          }
          timer.current = setTimeout(() => setState("idle"), 2500);
        }}
        className="flex-none text-muted-foreground"
      >
        {state === "copied" ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
      </Button>
      <span className="sr-only" role="status">
        {state === "copied"
          ? `${label} copied`
          : state === "failed"
            ? `Could not copy ${label}. Select and copy the identifier instead.`
            : ""}
      </span>
    </span>
  );
}

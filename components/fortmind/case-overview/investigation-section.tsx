import type { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CaseSectionId } from "@/lib/case-sections";

export function InvestigationSection({
  id,
  title,
  description,
  count,
  metadata,
  actions,
  footer,
  className,
  children,
}: {
  id: CaseSectionId;
  title: string;
  description?: string;
  count?: number;
  metadata?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      data-ui="section"
      id={id}
      aria-labelledby={`${id}-heading`}
      tabIndex={-1}
      className={cn(
        "scroll-mt-34 outline-none [&:focus-visible]:outline-2 [&:focus-visible]:outline-ring [&:focus-visible]:outline-offset-5 [&:focus-visible]:rounded-lg",
        className,
      )}
    >
      <header
        data-ui="section-header"
        className="flex items-end justify-between flex-wrap gap-y-2 gap-x-5 mb-3.5"
      >
        <div data-ui="section-heading-copy">
          <h2
            id={`${id}-heading`}
            className="text-xl leading-7 font-semibold tracking-[-.025em]"
          >
            {title}
            {count !== undefined && (
              <span
                data-ui="section-count"
                className="ml-2.25 text-muted-foreground text-[15px] font-normal [vertical-align:1px]"
              >
                {count}
              </span>
            )}
          </h2>
          {description && (
            <p
              data-ui="section-description"
              className="mt-1 text-muted-foreground text-sm leading-5.25"
            >
              {description}
            </p>
          )}
        </div>
        {(metadata || actions) && (
          <div
            data-ui="section-actions"
            className="flex items-center min-h-7.5"
          >
            {metadata}
            {actions}
          </div>
        )}
      </header>
      <Card
        data-ui="section-card"
        className="gap-0 rounded-lg border bg-card py-0 ring-0 [--card-spacing:0px]"
      >
        <CardContent
          data-ui="section-body"
          className="px-6 py-5.5 @max-[501px]/case:px-4.25"
        >
          {children}
        </CardContent>
        {footer && (
          <CardFooter
            data-ui="section-footer"
            className="pt-4 pr-6 pb-4 pl-6 border-t border-border bg-muted @max-[501px]/case:pl-4.25 @max-[501px]/case:pr-4.25"
          >
            {footer}
          </CardFooter>
        )}
      </Card>
    </section>
  );
}

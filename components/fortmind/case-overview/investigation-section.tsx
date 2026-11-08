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
  contentClassName,
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
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      data-ui="section"
      id={id}
      aria-labelledby={`${id}-heading`}
      tabIndex={-1}
      className={cn(
        "scroll-mt-40 outline-none [&:focus-visible]:outline-2 [&:focus-visible]:outline-ring [&:focus-visible]:outline-offset-5 [&:focus-visible]:rounded-lg",
        className,
      )}
    >
      <header
        data-ui="section-header"
        className="flex items-end justify-between flex-wrap gap-y-3 gap-x-6 mb-5"
      >
        <div data-ui="section-heading-copy">
          <h2
            id={`${id}-heading`}
            className="text-section-title"
          >
            {title}
            {count !== undefined && (
              <span
                data-ui="section-count"
                className="ml-2.25 text-muted-foreground text-label font-normal align-baseline"
              >
                {count}
              </span>
            )}
          </h2>
          {description && (
            <p
              data-ui="section-description"
              className="mt-1 text-muted-foreground text-prose"
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
          className={cn("px-7 py-7 @max-[501px]/case:px-5", contentClassName)}
        >
          {children}
        </CardContent>
        {footer && (
          <CardFooter
            data-ui="section-footer"
            className="pt-5 pr-7 pb-5 pl-7 border-t border-border bg-muted @max-[501px]/case:pl-4.25 @max-[501px]/case:pr-4.25"
          >
            {footer}
          </CardFooter>
        )}
      </Card>
    </section>
  );
}

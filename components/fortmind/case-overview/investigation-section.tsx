import type { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CaseSectionId } from "@/lib/case-sections";

/**
 * One section in a case workspace. The selected top-level category is already
 * visible in the sticky tab bar; do not repeat it as an overline here.
 */
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
        "min-w-0 scroll-mt-28 outline-none focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className,
      )}
    >
      <header data-ui="section-header" className="mb-3 flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div data-ui="section-heading-copy" className="min-w-0">
          <h2 id={`${id}-heading`} className="flex flex-wrap items-baseline gap-2 text-section-title font-semibold">
            {title}
            {count !== undefined && (
              <span data-ui="section-count" className="text-label font-normal tabular-nums text-muted-foreground">
                {count}
              </span>
            )}
          </h2>
          {description && (
            <p data-ui="section-description" className="mt-1 max-w-[72ch] text-caption leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {(metadata || actions) && (
          <div data-ui="section-actions" className="flex min-h-7 items-center gap-2">
            {metadata}
            {actions}
          </div>
        )}
      </header>
      <Card data-ui="section-card" className="min-w-0 gap-0 overflow-hidden rounded-lg border bg-card py-0 shadow-none ring-0 [--card-spacing:0px]">
        <CardContent data-ui="section-body" className={cn("min-w-0 break-words px-5 py-5 @min-[760px]/case:px-6 @max-[501px]/case:px-4", contentClassName)}>
          {children}
        </CardContent>
        {footer && (
          <CardFooter data-ui="section-footer" className="min-w-0 border-t border-border bg-muted/20 px-5 py-3 @max-[501px]/case:px-4">
            {footer}
          </CardFooter>
        )}
      </Card>
    </section>
  );
}

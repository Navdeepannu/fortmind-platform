"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export default function IntegrationsError({ reset }: { error: Error; reset: () => void }) {
  return (
      <main data-ui="main integrations-main" id="preview-main" className="min-w-0 min-[1800px]:pt-9.5 max-[1360px]:pt-6.5 max-[1360px]:pb-5 max-md:pt-6 max-md:pb-4.5 pt-8.5 pb-14 max-[681px]:pt-5.5 max-[681px]:pb-10.5">
        <Empty data-ui="error" className="min-h-77.5 border border-dashed border-border bg-card">
          <EmptyHeader><CircleAlert aria-hidden="true" className="w-5.75 h-5.75 text-muted-foreground" /><EmptyTitle className="w-5.75 h-5.75 text-muted-foreground">Integrations could not load</EmptyTitle><EmptyDescription className="w-5.75 h-5.75 text-muted-foreground">Try again to reopen the preview directory.</EmptyDescription></EmptyHeader>
          <Button variant="outline" onClick={reset}>Try again</Button>
        </Empty>
      </main>
  );
}

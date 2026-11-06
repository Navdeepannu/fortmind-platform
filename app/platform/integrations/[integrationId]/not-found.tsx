import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export default function IntegrationNotFound() {
  return (
      <main data-ui="main integrations-main" id="preview-main" className="mx-auto w-full max-w-[1580px] px-8 min-[1800px]:pt-9.5 max-[1360px]:px-6.5 max-[1360px]:pt-6.5 max-[1360px]:pb-5 max-md:px-4 max-md:pt-6 max-md:pb-4.5 pt-8.5 pb-14 max-[681px]:pt-5.5 max-[681px]:pr-4.5 max-[681px]:pb-10.5 max-[681px]:pl-4.5">
        <Empty data-ui="error" className="min-h-77.5 border border-dashed border-border bg-card">
          <EmptyHeader><SearchX aria-hidden="true" className="w-5.75 h-5.75 text-muted-foreground" /><EmptyTitle className="w-5.75 h-5.75 text-muted-foreground">Integration not found</EmptyTitle><EmptyDescription className="w-5.75 h-5.75 text-muted-foreground">That tool is not in this preview directory.</EmptyDescription></EmptyHeader>
          <Button nativeButton={false} variant="outline" render={<Link href="/platform/integrations" />}>Back to integrations</Button>
        </Empty>
      </main>
  );
}

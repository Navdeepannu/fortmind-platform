import { Skeleton } from "@/components/ui/skeleton";

export default function IntegrationsLoading() {
  return (
      <main data-ui="main integrations-main" id="preview-main" className="mx-auto w-full max-w-[1580px] px-8 min-[1800px]:pt-9.5 max-[1360px]:px-6.5 max-[1360px]:pt-6.5 max-[1360px]:pb-5 max-md:px-4 max-md:pt-6 max-md:pb-4.5 pt-8.5 pb-14 max-[681px]:pt-5.5 max-[681px]:pr-4.5 max-[681px]:pb-10.5 max-[681px]:pl-4.5" aria-busy="true" aria-label="Loading integrations">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        <Skeleton className="mt-8 h-16 w-full" />
        <div data-ui="loading-grid" className="grid grid-cols-3 gap-3.5 mt-7 max-[1161px]:grid-cols-2 max-[681px]:grid-cols-1">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-56 w-full" />)}
        </div>
      </main>
  );
}

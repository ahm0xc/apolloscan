import { Search } from "lucide-react";

import { Skeleton } from "~/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Skeleton className="h-9 w-full pl-9 md:w-[300px]" />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FactCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FactCardSkeleton() {
  return (
    <div className="group relative h-full overflow-hidden rounded-xl border bg-gradient-to-br from-card to-muted/40 p-1 shadow-md">
      <div className="relative h-full overflow-hidden rounded-lg bg-card">
        <div className="relative aspect-video w-full overflow-hidden">
          <Skeleton className="h-full w-full" />
          <div className="absolute right-3 top-3">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="p-5">
          <Skeleton className="mb-3 h-5 w-full" />
          <Skeleton className="mb-3 h-5 w-3/4" />
          <Skeleton className="mb-5 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-2/3" />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

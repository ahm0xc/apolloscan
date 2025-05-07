import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <header className="p-8 w-full flex justify-center">
        <div className="w-full max-w-2xl">
          <Skeleton className="h-12 w-full" />
        </div>
      </header>
      <div className="grid lg:grid-cols-5">
        <div className="col-span-3">
          <section className="grid grid-cols-2 gap-4 p-8">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="w-full aspect-video rounded-xl" />
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <Skeleton className="w-64 h-64 rounded-full" />
            </div>
          </section>
          <section className="p-8">
            <div className="bg-white rounded-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-48" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="col-span-2">
          <div className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

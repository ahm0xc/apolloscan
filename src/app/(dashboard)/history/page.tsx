import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";
import { Search } from "lucide-react";

import { getFacts } from "~/actions/server-actions";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import HistorySearchBar from "./history-search-bar";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-sm text-muted-foreground">
            View your past fact checks
          </p>
        </div>
        <HistorySearchBar />
      </div>
      <HistorySection className="mt-8" searchQuery={q} />
    </div>
  );
}

async function HistorySection({
  className,
  searchQuery,
}: {
  className?: string;
  searchQuery?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { data: facts, error } = await getFacts(userId);

  if (error) {
    return <div>{error}</div>;
  }

  // Filter facts based on search query if provided
  const filteredFacts = searchQuery
    ? facts.filter(
        (fact) =>
          fact.videoDetails.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          fact.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : facts;

  return (
    <section className={cn("space-y-6", className)}>
      {filteredFacts.length === 0 ? (
        searchQuery ? (
          <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed bg-gradient-to-b from-muted/20 to-muted/50 py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/70 shadow-inner">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">
              No matching fact checks
            </h3>
            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
              No fact checks match your search query. Try different search
              terms.
            </p>
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFacts.map((fact) => (
            <FactCard key={fact.id} fact={fact} />
          ))}
        </div>
      )}
    </section>
  );
}

function FactCard({ fact }: { fact: any }) {
  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-yellow-500 to-yellow-600";
    if (score >= 40) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "True";
    if (score >= 60) return "Mostly True";
    if (score >= 40) return "Partly True";
    if (score >= 20) return "Mostly False";
    return "False";
  };

  return (
    <Link href={`/fact/${fact.id}`} className="block">
      <div className="group relative h-full overflow-hidden rounded-xl border bg-gradient-to-br from-card to-muted/40 p-1 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
        <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        <div className="relative h-full overflow-hidden rounded-lg bg-card">
          {fact.videoDetails.thumbnail && (
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={fact.videoDetails.thumbnail}
                alt={fact.videoDetails.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

              {/* Score badge with blur effect */}
              <div className="absolute right-3 top-3">
                <div className="flex items-center gap-1.5 overflow-hidden rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  <span
                    className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${getScoreGradient(fact.score)} shadow-inner`}
                  ></span>
                  <span>{fact.score}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-5">
            <h3 className="mb-3 line-clamp-2 font-medium leading-tight tracking-tight text-foreground">
              {fact.videoDetails.title}
            </h3>

            <p className="mb-5 line-clamp-2 text-sm text-muted-foreground">
              {fact.summary}
            </p>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${getScoreGradient(fact.score)} px-3 py-1.5 font-medium text-white shadow-sm`}
                >
                  {getScoreLabel(fact.score)}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {new Date(fact.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1.5 font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-muted-foreground"
                >
                  <path
                    d="M8 12.5H16M8 7.5H13M12 20L7 19C5.9 19 5.01 18.1 5.01 17L5 5C5 3.9 5.9 3 7 3H17C18.1 3 19 3.9 19 5V17C19 18.1 18.1 19 17 19L12 20Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{fact.claims.length} claims</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed bg-gradient-to-b from-muted/20 to-muted/50 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/70 shadow-inner">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">No fact checks found</h3>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        You haven't analyzed any videos yet. Start by checking a video's factual
        accuracy.
      </p>
      <Button asChild className="mt-6 rounded-full shadow-md hover:shadow-lg">
        <Link href="/">Check a video</Link>
      </Button>
    </div>
  );
}

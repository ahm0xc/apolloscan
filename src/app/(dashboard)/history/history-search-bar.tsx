"use client";

import { useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { SearchIcon } from "lucide-react";

import { Input } from "~/components/ui/input";

export default function HistorySearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (term: string) => {
    router.push(`?${createQueryString("q", term)}`);
  };

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search fact checks..."
        className="w-full pl-9 md:w-[300px] rounded-full bg-accent"
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}

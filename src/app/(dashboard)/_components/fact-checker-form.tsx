"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@clerk/nextjs";
import { Loader2Icon, SearchIcon } from "lucide-react";

import { checkFact } from "~/actions/server-actions";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface FactCheckerFormProps {
  className?: string;
}

export default function FactCheckerForm({ className }: FactCheckerFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { isSignedIn } = useAuth();

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!isSignedIn) {
      router.push("/sign-in?message=Please sign in to continue");
      return;
    }

    const formData = new FormData(ev.currentTarget);

    const payload = {
      url: formData.get("url") as string,
    };

    setIsLoading(true);
    const result = await checkFact(payload);
    setIsLoading(false);
    if (result?.error || !result?.data) {
      // TODO: add toast
      console.log("🚀 ~ handleSubmit ~ error:", result.error);
      return;
    }

    router.push(`/fact/${result.data.id}`);

    (ev.target as HTMLFormElement).reset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "h-12 rounded-full flex items-center gap-2 border pr-1 w-[35vw] min-w-[350px] bg-accent",
        className
      )}
    >
      <input
        type="url"
        name="url"
        placeholder="Paste a video link here"
        className="bg-transparent border-none outline-none flex-1 px-4 h-full rounded-full"
      />
      <Button
        size="icon"
        className="rounded-full bg-pink-600"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2Icon className="w-4 h-4 animate-spin" />
        ) : (
          <SearchIcon className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
}

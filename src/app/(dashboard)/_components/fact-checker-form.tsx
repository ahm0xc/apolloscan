"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@clerk/nextjs";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Loader2Icon, SearchIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Fact } from "~/lib/validations";

function getSearchParams(key: string) {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

function hasSearchParam(key: string) {
  const url = new URL(window.location.href);
  return url.searchParams.has(key);
}

function removeSearchParam(key: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState({}, "", url.toString());
}

interface RunDetails {
  id: string;
  publicAccessToken: string;
}

interface FactCheckerFormProps {
  className?: string;
}

export default function FactCheckerForm({ className }: FactCheckerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const urlInputRef = React.useRef<HTMLInputElement>(null);

  const [runDetails, setRunDetails] = React.useState<RunDetails | null>(null);

  const router = useRouter();
  const { isSignedIn } = useAuth();

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);

    const url = formData.get("url") as string;

    if (!url) {
      // TODO: add toast
      console.log("🚀 ~ handleSubmit ~ error:", "URL is required");
      alert("URL is required");
      return;
    }

    if (!isSignedIn) {
      router.push(`/sign-in?videoUrl=${url}`);
      return;
    }

    setRunDetails(null);
    try {
      setIsLoading(true);
      const response = await fetch(`/api/check-fact?url=${url}`);
      const handle = await response.json();

      setRunDetails(handle);
    } catch (error) {
      // TODO: add toast
      console.log("🚀 ~ handleSubmit ~ error:", error);
      setIsLoading(false);
    }

    (ev.target as HTMLFormElement).reset();
  }

  function handleFactComplete(fact: Fact) {
    console.log("🚀 ~ handleFactComplete ~ fact:", fact);
    setRunDetails(null);
    setIsLoading(false);
    router.push(`/fact/${fact.id}`);
  }

  function handleFactError(error: any) {
    console.log("🚀 ~ handleFactError ~ error:", error);
    setRunDetails(null);
  }

  React.useEffect(() => {
    if (hasSearchParam("videoUrl") && urlInputRef.current) {
      urlInputRef.current.value = getSearchParams("videoUrl") ?? "";
      removeSearchParam("videoUrl");
    }
    setTimeout(() => {
      if (hasSearchParam("autoCheck") && formRef.current) {
        const event = new Event("submit", { bubbles: true, cancelable: true });
        formRef.current.dispatchEvent(event);
        removeSearchParam("autoCheck");
      }
    }, 500);
  }, []);

  return (
    <React.Fragment>
      {runDetails && (
        <FactRunHandler
          runDetails={runDetails}
          onComplete={handleFactComplete}
          onError={handleFactError}
        />
      )}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className={cn(
          "h-12 rounded-full flex items-center gap-2 border pr-1 w-[35vw] min-w-[350px] bg-accent",
          className
        )}
      >
        <input
          type="url"
          name="url"
          ref={urlInputRef}
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
    </React.Fragment>
  );
}

function FactRunHandler({
  runDetails,
  onComplete,
  onError,
}: {
  runDetails: RunDetails;
  onComplete: (fact: Fact) => void;
  onError: (error: any) => void;
}) {
  const hasTriggerOnCompleted = React.useRef(false);
  const hasTriggerOnError = React.useRef(false);

  const { run, error } = useRealtimeRun(runDetails.id, {
    accessToken: runDetails.publicAccessToken,
  });

  console.log("🚀 ~ FactRunHandler ~ run:", run);
  console.log("🚀 ~ FactRunHandler ~ error:", error);

  if (run?.output && !hasTriggerOnCompleted.current) {
    onComplete(run.output as Fact);
    hasTriggerOnCompleted.current = true;
  }

  if (error && !hasTriggerOnError.current) {
    onError(error);
    hasTriggerOnError.current = true;
  }

  return null;
}

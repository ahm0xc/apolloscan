"use client";

import React from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@clerk/nextjs";
import { Loader2Icon, SearchIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";
import { factSchema } from "~/lib/validations";

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
  const [isLoading, setIsLoading] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const urlInputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { toast } = useToast();

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

    // setRunDetails(null);
    try {
      setIsLoading(true);
      const response = await fetch(`/api/check-fact?url=${url}`);
      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.error,
          isSubscriptionRequired: data.isSubscriptionRequired,
        };
      }

      const parsed = factSchema.safeParse(data);

      if (!parsed.success) throw new Error(parsed.error.message);

      router.push(`/fact/${parsed.data.id}`);
    } catch (error: any) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
      if (error.isSubscriptionRequired) {
        toast({
          title: "Subscription Required",
          description: error.message,
          variant: "destructive",
          action: (
            <Button
              variant="default"
              onClick={() => router.push("/billing")}
              className="ml-2"
            >
              Upgrade Plan
            </Button>
          ),
        });
      } else if (error.message) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }

    (ev.target as HTMLFormElement).reset();
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
    <form
      onSubmit={handleSubmit}
      ref={formRef}
      className={cn(
        "h-12 rounded-full flex items-center gap-2 border pr-1 w-[50vw] md:w-[40vw] lg:w-[35vw] xl:w-[30vw] min-w-[350px] bg-accent",
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
  );
}

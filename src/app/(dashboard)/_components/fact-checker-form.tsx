"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Loader2Icon, SearchIcon } from "lucide-react";

import { checkFact } from "~/actions/server-actions";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

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

async function getTranscript(videoId: string) {
  const { data: transcript } = await axios.get<
    {
      text: string;
      start: number;
      duration: number;
    }[]
  >(`/api/transcript?videoId=${videoId}`);
  return transcript;
}

interface FactCheckerFormProps {
  className?: string;
}

export default function FactCheckerForm({ className }: FactCheckerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const urlInputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { isSignedIn } = useAuth();

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);

    const payload = {
      url: formData.get("url") as string,
      transcript: "",
    };

    if (!payload.url) {
      // TODO: add toast
      console.log("🚀 ~ handleSubmit ~ error:", "URL is required");
      alert("URL is required");
      return;
    }

    if (!isSignedIn) {
      router.push(`/sign-in?videoUrl=${payload.url}`);
      return;
    }

    setIsLoading(true);
    const transcript = await getTranscript(payload.url);
    const plainTranscript = transcript
      .map(({ text }) => {
        return text
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, " ");
      })
      .join(" ");

    if (plainTranscript.trim().length === 0) {
      // TODO: add toast
      console.log("🚀 ~ handleSubmit ~ error:", "Transcript is empty");
      alert("Transcript is empty");
      return;
    }

    payload.transcript = plainTranscript;

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
  );
}

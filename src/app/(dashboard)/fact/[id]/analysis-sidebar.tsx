"use client";

import React from "react";

import { getFavicon } from "@ahm0xc/utils";
import { CheckIcon, CopyIcon, FileTextIcon, LinkIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Fact } from "~/lib/validations";

export default function AnalysisSidebar({ fact }: { fact: Fact }) {
  const [activeTab, setActiveTab] = React.useState<"summary" | "sources">(
    "summary"
  );
  function handleTabChange(tab: "summary" | "sources") {
    setActiveTab(tab);
  }

  return (
    <aside className="min-h-screen bg-accent/20 border rounded-2xl w-full min-w-full">
      <div className="flex flex-col gap-4">
        <div aria-label="Tabs" className="flex">
          <button
            className={cn(
              "relative flex-1 h-20 border-r last:border-r-0 border-b flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
              activeTab === "summary" &&
                "before:content-[''] before:absolute before:bottom-0 before:inset-x-0 before:h-1 before:translate-y-full before:rounded-b-sm before:bg-blue-500 bg-secondary/50 text-foreground first:rounded-tl-2xl last:rounded-tr-2xl"
            )}
            type="button"
            onClick={() => handleTabChange("summary")}
          >
            <FileTextIcon className="w-5 h-5" />
            <span>Summary</span>
          </button>
          <button
            className={cn(
              "relative flex-1 h-20 border-r last:border-r-0 border-b flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
              activeTab === "sources" &&
                "before:content-[''] before:absolute before:bottom-0 before:inset-x-0 before:h-1 before:translate-y-full before:rounded-b-sm before:bg-blue-500 bg-secondary/50 text-foreground first:rounded-tl-2xl last:rounded-tr-2xl"
            )}
            type="button"
            onClick={() => handleTabChange("sources")}
          >
            <LinkIcon className="w-5 h-5" />
            <span>Sources</span>
          </button>
        </div>
        <div className="p-4 min-h-full">
          {activeTab === "summary" && <SummaryTab fact={fact} />}
          {activeTab === "sources" && <SourcesTab fact={fact} />}
        </div>
      </div>
    </aside>
  );
}

function SummaryTab({ fact }: { fact: Fact }) {
  const [copied, setCopied] = React.useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(fact.summary);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div>
      <div className="bg-secondary/30 p-4 rounded-lg">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <FileTextIcon className="w-5 h-5 text-blue-500" />
          Summary
        </h4>
        <p className="text-sm text-foreground mt-2 leading-relaxed">
          {fact.summary}
        </p>
      </div>
      <div className="mt-4 flex gap-2 items-center">
        <button
          type="button"
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <CopyIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function SourcesTab({ fact }: { fact: Fact }) {
  const isLink = (source: string) => {
    return source.startsWith("http");
  };
  return (
    <div>
      <div className="bg-secondary/30 p-4 rounded-lg">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-blue-500" />
          Sources
        </h4>
        <p className="text-sm text-muted-foreground mt-2">
          Sources that were used to check & verify the fact
        </p>
      </div>
      <div aria-label="Sources" className="mt-4">
        <div className="flex flex-col gap-3">
          {fact.sources.map((source) => {
            const il = isLink(source);
            return (
              <div
                key={source}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
              >
                {il && (
                  <img src={getFavicon(source)} alt="" className="w-4 h-4" />
                )}
                {il ? (
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-1 text-blue-500 hover:text-blue-600 hover:underline underline-offset-2"
                  >
                    {source}
                  </a>
                ) : (
                  <span className="line-clamp-1 text-muted-foreground">
                    {source}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

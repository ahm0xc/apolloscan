"use client";

import React from "react";

import { CheckIcon, CopyIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Fact } from "~/lib/validations";

export default function AnalysisSidebar({ fact }: { fact: Fact }) {
  const [activeTab, setActiveTab] = React.useState<"summary" | "warnings">(
    "summary"
  );
  function handleTabChange(tab: "summary" | "warnings") {
    setActiveTab(tab);
  }

  return (
    <aside className="min-h-screen bg-accent/20 border rounded-2xl">
      <div className="flex flex-col gap-4">
        <div aria-label="Tabs" className="flex">
          <button
            className={cn(
              "relative flex-1 h-20 border-r last:border-r-0 border-b",
              activeTab === "summary" &&
                "before:content-[''] before:absolute before:bottom-0 before:inset-x-0 before:h-1 before:translate-y-full before:rounded-b-sm before:bg-green-500 bg-secondary first:rounded-tl-2xl last:rounded-tr-2xl"
            )}
            type="button"
            onClick={() => handleTabChange("summary")}
          >
            Summary
          </button>
          <button
            className={cn(
              "relative flex-1 h-20 border-r last:border-r-0 border-b",
              activeTab === "warnings" &&
                "before:content-[''] before:absolute before:bottom-0 before:inset-x-0 before:h-1 before:translate-y-full before:rounded-b-sm before:bg-green-500 bg-secondary first:rounded-tl-2xl last:rounded-tr-2xl"
            )}
            type="button"
            onClick={() => handleTabChange("warnings")}
          >
            Warnings
          </button>
        </div>
        <div className="p-4">
          {activeTab === "summary" && <SummaryTab fact={fact} />}
          {activeTab === "warnings" && <WarningsTab fact={fact} />}
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
      <div>
        <h4 className="text-lg font-bold">Summary</h4>
        <p className="text-sm text-foreground mt-2">{fact.summary}</p>
      </div>
      <div className="mt-4 flex gap-2 items-center">
        <button
          type="button"
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="w-4 h-4" />
          ) : (
            <CopyIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function WarningsTab({ fact }: { fact: Fact }) {
  return <div>Warnings</div>;
}

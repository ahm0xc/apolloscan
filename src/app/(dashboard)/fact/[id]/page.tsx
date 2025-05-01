import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { kv } from "~/lib/kv";
import { factSchema } from "~/lib/validations";

import FactCheckerForm from "../../_components/fact-checker-form";
import AnalysisSidebar from "./analysis-sidebar";

function getScoreCategory(score: number) {
  if (score >= 80) return "True";
  if (score >= 60) return "Mostly True";
  if (score >= 40) return "Partly True";
  if (score >= 20) return "Mostly False";
  return "False";
}

function getScoreColor(score: number) {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 60) return "#22c55e"; // green
  if (score >= 40) return "#eab308"; // yellow
  if (score >= 20) return "#f97316"; // orange
  return "#ef4444"; // red
}

function CircularProgress({
  score,
  size = "large",
  showLabel = true,
}: {
  score: number;
  size?: "small" | "large";
  showLabel?: boolean;
}) {
  const color = getScoreColor(score);
  const category = getScoreCategory(score);

  const config = {
    small: {
      width: "w-10 h-10",
      strokeWidth: 8,
      radius: 46,
      fontSize: "text-sm",
    },
    large: {
      width: "w-64 h-64",
      strokeWidth: 6,
      radius: 42,
      fontSize: "text-4xl",
    },
  }[size];

  if (size === "large") {
    return (
      <div className={`relative ${config.width}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="stroke-gray-100 fill-none"
            strokeWidth={config.strokeWidth}
            cx="50"
            cy="50"
            r={config.radius}
          />
          {/* Progress circle */}
          <circle
            className="fill-none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            cx="50"
            cy="50"
            r={config.radius}
            style={{
              strokeDasharray: `${2 * Math.PI * config.radius}`,
              strokeDashoffset: `${2 * Math.PI * config.radius * (1 - score / 100)}`,
            }}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div
              className="inline-block px-3 py-0.5 rounded-full text-xs mb-3"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {category}
            </div>
            <span
              className={`${config.fontSize} font-bold mb-1`}
              style={{ color: color }}
            >
              {score}
            </span>
            <span className="text-base font-medium mb-2">Fact Score</span>
            <span className="text-[10px] text-muted-foreground text-balance max-w-[180px] leading-tight">
              as on{" "}
              {new Date(new Date().toISOString()).toLocaleString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className={`relative ${config.width} flex-shrink-0`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            className="stroke-gray-100 fill-none"
            strokeWidth={config.strokeWidth}
            cx="50"
            cy="50"
            r={config.radius}
          />
          <circle
            className="fill-none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            cx="50"
            cy="50"
            r={config.radius}
            style={{
              strokeDasharray: `${2 * Math.PI * config.radius}`,
              strokeDashoffset: `${2 * Math.PI * config.radius * (1 - score / 100)}`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`${config.fontSize} font-medium`}
            style={{ color: color }}
          >
            {score}
          </span>
        </div>
      </div>
      {showLabel && <span className="text-sm text-gray-600">{category}</span>}
    </div>
  );
}

export default async function FactIDPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const dbFact = (await kv.get(`fact:${userId}:${id}`)) as string | null;

  if (!dbFact) {
    redirect("/");
  }

  const fact = factSchema.parse(dbFact);

  return (
    <div>
      <header className="p-8 w-full flex justify-center">
        <FactCheckerForm />
      </header>
      <div className="grid lg:grid-cols-5">
        <div className="col-span-3">
          <section className="grid grid-cols-2 gap-4 p-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-sm font-medium">
                TITLE: {fact.videoDetails.title}
              </h1>
              <img
                src={fact.videoDetails.thumbnail}
                alt={fact.videoDetails.title}
                className="w-full h-auto rounded-xl"
              />
              <a
                href={fact.videoDetails.url}
                target="_blank"
                className="text-xs text-muted-foreground line-clamp-1"
              >
                {fact.videoDetails.url}
              </a>
            </div>
            <div className="flex flex-col items-center justify-center">
              <CircularProgress score={fact.score} />
              {/* <div className="flex gap-2">
                <Button variant="default">Download Fact Analysis</Button>
              </div> */}
            </div>
          </section>
          <section className="p-8">
            <div className="bg-white rounded-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-medium">Claim Analysis</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search claims..."
                    className="px-3 py-1 text-sm border rounded-md w-48 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground border border-gray-200">
                      <div className="flex items-center gap-1">Claim</div>
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground w-24 border border-gray-200">
                      <div className="flex items-center gap-1">Score</div>
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground w-24 text-right border border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fact.claims.map((claim, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm border border-gray-200">
                        {claim.claim}
                      </td>
                      <td className="px-6 py-4 border border-gray-200">
                        <CircularProgress
                          score={claim.score}
                          size="small"
                          showLabel={true}
                        />
                      </td>
                      <td className="px-6 py-4 text-right border border-gray-200">
                        <button className="text-muted-foreground hover:text-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="col-span-2 p-4 w-full">
          <AnalysisSidebar fact={fact} />
        </div>
      </div>
    </div>
  );
}

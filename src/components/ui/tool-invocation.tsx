"use client";

import { useState } from "react";
import type { ToolInvocation as ToolInvocationType } from "ai";
import { cn } from "@/lib/utils";

interface ToolInvocationProps {
  toolInvocation: ToolInvocationType;
}

/**
 * Generates a human-readable summary for a completed tool call.
 */
function getToolSummary(toolName: string, result: unknown): string {
  try {
    if (typeof result === "string") {
      // readServerLogs returns a plain string
      const lineCount = result.split("\n").length;
      return `Retrieved ${lineCount} log lines`;
    }

    const data = result as Record<string, unknown>;

    switch (toolName) {
      case "fetchGitHubCommits": {
        const commits = data.commits as Array<unknown>;
        return `Fetched ${commits?.length ?? 0} recent commits from \`${data.repo}\``;
      }
      case "queryDatabaseStatus": {
        return `Database \`${data.databaseId}\` — status: ${data.status}, ${data.activeConnections}/${data.maxConnections} connections active`;
      }
      case "readServerLogs": {
        return `Fetched server logs`;
      }
      default:
        return `Tool ${toolName} completed`;
    }
  } catch {
    return `Tool ${toolName} completed`;
  }
}

export function ToolInvocationCard({ toolInvocation }: ToolInvocationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLoading = toolInvocation.state !== "result";
  const toolName = toolInvocation.toolName;

  return (
    <div
      className={cn(
        "my-2 rounded-md border font-mono text-xs transition-all duration-300",
        "bg-zinc-950/80 backdrop-blur-sm",
        isLoading
          ? "border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          : "border-zinc-800 hover:border-zinc-700"
      )}
    >
      {/* Header / Trigger */}
      <button
        onClick={() => !isLoading && setIsExpanded((prev) => !prev)}
        disabled={isLoading}
        className={cn(
          "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
          !isLoading && "hover:bg-zinc-900/50 cursor-pointer"
        )}
      >
        {/* Status indicator */}
        {isLoading ? (
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          </span>
        ) : (
          <span className="flex h-2.5 w-2.5 shrink-0">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
        )}

        {/* Tool name & status */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <span className="text-amber-400 animate-pulse">
              Executing {toolName}...
            </span>
          ) : (
            <span className="text-zinc-300">
              {getToolSummary(
                toolName,
                (toolInvocation as ToolInvocationType & { state: "result" }).result
              )}
            </span>
          )}
        </div>

        {/* Expand chevron (only when not loading) */}
        {!isLoading && (
          <svg
            className={cn(
              "w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 shrink-0",
              isExpanded && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {/* Collapsible raw JSON output */}
      {isExpanded && !isLoading && (
        <div className="border-t border-zinc-800/60">
          {/* Args section */}
          <div className="px-3 py-2 border-b border-zinc-800/40">
            <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
              Arguments
            </span>
            <pre className="mt-1 text-zinc-500 whitespace-pre-wrap break-all leading-relaxed">
              {JSON.stringify(toolInvocation.args, null, 2)}
            </pre>
          </div>

          {/* Result section */}
          <div className="px-3 py-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
              Result
            </span>
            <pre className="mt-1 text-emerald-400/80 whitespace-pre-wrap break-all leading-relaxed max-h-60 overflow-y-auto">
              {typeof (toolInvocation as ToolInvocationType & { state: "result" }).result === "string"
                ? (toolInvocation as ToolInvocationType & { state: "result" }).result
                : JSON.stringify(
                    (toolInvocation as ToolInvocationType & { state: "result" }).result,
                    null,
                    2
                  )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

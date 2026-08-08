"use client";

import { useEffect, useState } from "react";
import { useAppStore, type PostMortem } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Renders a syntax-highlighted code block using shiki.
 * Loads the highlighter lazily on the client to avoid SSR issues.
 */
function SyntaxHighlightedCode({ code, lang = "typescript" }: { code: string; lang?: string }) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki");
        const result = await codeToHtml(code, {
          lang,
          theme: "tokyo-night",
        });
        if (!cancelled) setHtml(result);
      } catch {
        // Fallback to raw code if shiki fails
        if (!cancelled) setHtml("");
      }
    }
    highlight();
    return () => { cancelled = true; };
  }, [code, lang]);

  if (html) {
    return (
      <div
        className="rounded-lg overflow-hidden text-sm [&_pre]:!bg-transparent [&_pre]:!p-4 [&_pre]:!m-0 [&_code]:!text-xs [&_code]:!leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Fallback while loading or if shiki fails
  return (
    <pre className="p-4 text-xs leading-relaxed text-emerald-400/80 font-mono whitespace-pre-wrap">
      <code>{code}</code>
    </pre>
  );
}

/**
 * Skeleton shimmer card for loading states.
 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border border-white/5 bg-white/[0.02] p-5",
      className
    )}>
      <div className="space-y-3 animate-pulse">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-4 w-3/4 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function IncidentDashboard() {
  const { postMortem, isGeneratingPostMortem } = useAppStore();

  // --- EMPTY STATE ---
  if (!postMortem && !isGeneratingPostMortem) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Radial glow */}
        <div className="absolute inset-0 bg-gradient-radial from-emerald-500/5 via-transparent to-transparent" />

        <div className="relative flex flex-col items-center gap-5 text-center px-8">
          {/* Icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl" />
            <div className="relative w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-zinc-400 font-mono">
              Incident Dashboard
            </h3>
            <p className="text-xs text-zinc-600 mt-1.5 max-w-[240px] leading-relaxed">
              Investigate an incident in the chat, then generate a post-mortem report to populate this panel.
            </p>
          </div>

          {/* Status pills */}
          <div className="flex gap-2">
            <span className="px-2.5 py-1 text-[10px] font-mono rounded-full border border-zinc-800 text-zinc-600 bg-zinc-900/50">
              NO ACTIVE INCIDENT
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- GENERATING STATE ---
  if (isGeneratingPostMortem && !postMortem) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-mono text-emerald-400 animate-pulse">
              Generating Post-Mortem Report...
            </span>
          </div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard className="h-40" />
        </div>
      </div>
    );
  }

  // --- POPULATED STATE ---
  if (!postMortem) return null;

  return (
    <div className="h-full overflow-y-auto">
      {/* Header bar */}
      <div className="sticky top-0 z-10 px-6 py-3 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Post-Mortem Report
            </span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            RESOLVED
          </span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Incident Title */}
        <div>
          <h2 className="text-xl font-bold text-zinc-100 font-mono leading-tight tracking-tight">
            {postMortem.incidentTitle}
          </h2>
          <div className="mt-2 h-px bg-gradient-to-r from-emerald-500/40 via-emerald-500/10 to-transparent" />
        </div>

        {/* Root Cause Card — Glassmorphism */}
        <div className="relative group">
          {/* Glow effect behind card */}
          <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

          <div className="relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Root Cause
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {postMortem.rootCause}
            </p>
          </div>
        </div>

        {/* Affected Systems — Warning Banner */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] backdrop-blur-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
              Affected Systems
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {postMortem.affectedSystems.map((system, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-amber-500/20 bg-amber-500/[0.06] text-amber-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {system}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested Fix — Syntax Highlighted Code */}
        <div className="relative group">
          <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-cyan-500/15 via-transparent to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

          <div className="relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                  Suggested Fix
                </span>
              </div>
              {/* Copy button */}
              <button
                onClick={() => navigator.clipboard.writeText(postMortem.suggestedFixCodeSnippet)}
                className="px-2 py-1 rounded text-[10px] font-mono text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
              >
                COPY
              </button>
            </div>
            <div className="bg-zinc-950/50">
              <SyntaxHighlightedCode code={postMortem.suggestedFixCodeSnippet} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

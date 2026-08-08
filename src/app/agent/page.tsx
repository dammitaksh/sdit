"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useCallback } from "react";
import { TerminalInput } from "@/components/ui/terminal-input";
import { ToolInvocationCard } from "@/components/ui/tool-invocation";
import { IncidentDashboard } from "@/components/ui/incident-dashboard";
import { trimContextWindow } from "@/lib/ai/context-manager";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export default function AgentPage() {
  const { messages, sendMessage, setMessages, status } = useChat({
    api: "/api/chat",
    maxSteps: 5,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const {
    postMortem,
    isGeneratingPostMortem,
    setPostMortem,
    setIsGeneratingPostMortem,
  } = useAppStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(
    (message: string, files?: FileList | null) => {
      if (!message.trim() && !files?.length) return;

      // Apply context window trimming before sending
      const trimmedMessages = trimContextWindow(messages);
      setMessages(trimmedMessages);

      sendMessage({
        text: message,
        files: files ?? undefined,
      });
    },
    [messages, setMessages, sendMessage]
  );

  const handleGeneratePostMortem = useCallback(async () => {
    if (isGeneratingPostMortem || messages.length === 0) return;

    setIsGeneratingPostMortem(true);
    setPostMortem(null);

    try {
      const response = await fetch("/api/postmortem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error("Failed to generate post-mortem");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });

        // Try to parse progressive JSON
        try {
          const parsed = JSON.parse(accumulated);
          setPostMortem(parsed);
        } catch {
          // Partial JSON, continue accumulating
        }
      }

      // Final parse
      try {
        const finalParsed = JSON.parse(accumulated);
        setPostMortem(finalParsed);
      } catch {
        // Handled
      }
    } catch (error) {
      console.error("Post-mortem generation error:", error);
    } finally {
      setIsGeneratingPostMortem(false);
    }
  }, [messages, isGeneratingPostMortem, setIsGeneratingPostMortem, setPostMortem]);

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <ResizablePanelGroup direction="horizontal">
        {/* ===== LEFT PANEL: Chat (40%) ===== */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="flex flex-col h-full">
            {/* Chat messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-4">
                {/* Empty state */}
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800">
                      <svg
                        className="w-7 h-7 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-zinc-200 font-mono">
                        SRE Agent Ready
                      </h2>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[260px]">
                        Describe an incident to investigate. The agent will use
                        tools to query databases, check commits, and read logs.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 justify-center">
                      {[
                        "High CPU on prod database",
                        "API latency spike",
                        "Check recent deploys",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSubmit(suggestion)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded-md border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2.5",
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    {/* Avatar for assistant */}
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center mt-0.5">
                        <span className="text-emerald-500 text-[10px] font-mono font-bold">
                          AI
                        </span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[88%] rounded-lg px-3 py-2.5 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-zinc-800 text-zinc-100 font-mono text-xs"
                          : "bg-transparent text-zinc-300 text-[13px]"
                      )}
                    >
                      {/* Text content — extract from parts */}
                      {message.parts?.filter(p => p.type === "text").map((part, i) => (
                        <div key={i} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      ))}

                      {/* Tool invocations from parts */}
                      {message.parts?.filter(p => p.type === "tool-invocation").map((part) => (
                        <ToolInvocationCard
                          key={part.toolInvocation.toolCallId}
                          toolInvocation={part.toolInvocation}
                        />
                      ))}
                    </div>

                    {/* Avatar for user */}
                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center mt-0.5">
                        <span className="text-zinc-400 text-[10px] font-mono font-bold">
                          ▸
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading &&
                  messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <span className="text-emerald-500 text-[10px] font-mono font-bold animate-pulse">
                          AI
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Input area + Post-Mortem button */}
            <div className="border-t border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md px-4 py-3 space-y-2.5">
              {/* Generate Post-Mortem button */}
              {messages.length > 0 && (
                <button
                  onClick={handleGeneratePostMortem}
                  disabled={isGeneratingPostMortem || isLoading}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all",
                    "border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400",
                    "hover:bg-emerald-500/10 hover:border-emerald-500/30",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  {isGeneratingPostMortem ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Generate Post-Mortem →
                    </>
                  )}
                </button>
              )}

              <TerminalInput onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>
        </ResizablePanel>

        {/* ===== HANDLE ===== */}
        <ResizableHandle withHandle />

        {/* ===== RIGHT PANEL: Dashboard (60%) ===== */}
        <ResizablePanel defaultSize={60} minSize={35}>
          <div className="h-full bg-zinc-950/50 border-l border-white/5">
            <IncidentDashboard />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

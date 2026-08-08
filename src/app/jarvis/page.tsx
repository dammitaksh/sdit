"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
    ActivityIcon,
    BrainIcon,
    FileTextIcon,
    RadioIcon,
} from "lucide-react";

import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
    Message,
    MessageContent,
    MessageResponse,
} from "@/components/ai-elements/message";
import {
    PromptInput,
    PromptInputBody,
    type PromptInputMessage,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
    Source,
    Sources,
    SourcesContent,
    SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
    Tool,
    ToolContent,
    ToolHeader,
    ToolInput,
    ToolOutput,
} from "@/components/ai-elements/tool";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Badge } from "@/components/ui/badge";
import type { JarvisMessage } from "@/lib/jarvis/types";

const SUGGESTIONS = [
    "What's the difference between generateText and streamText?",
    "Show me what I can learn in this course",
    "How does RAG actually work?",
    "Run a full system diagnostic",
    "Give me a recipe for tomato rice for two",
];

export default function JarvisPage() {
    const { messages, sendMessage, status, stop } = useChat<JarvisMessage>({
        transport: new DefaultChatTransport({ api: "/api/jarvis" }),
    });

    const isBusy = status === "submitted" || status === "streaming";

    // PromptInput manages its own textarea state and hands us the text on
    // submit, so we deliberately don't mirror it into React state here.
    const submit = (text: string) => {
        if (!text.trim() || isBusy) return;
        sendMessage({ text });
    };

    const handleSubmit = (message: PromptInputMessage) => {
        submit(message.text);
    };

    return (
        <div className="flex h-dvh flex-col bg-background">
            {/* ── Header ─────────────────────────────────────────────── */}
            <header className="flex items-center gap-3 border-b px-6 py-4">
                <div className="relative flex size-9 items-center justify-center rounded-full border border-primary/40 bg-primary/5">
                    <RadioIcon
                        className={`size-4 text-primary ${isBusy ? "animate-pulse" : ""}`}
                    />
                </div>
                <div className="min-w-0">
                    <h1 className="font-semibold text-sm tracking-wide">JARVIS</h1>
                    <p className="truncate text-muted-foreground text-xs">
                        Just A Rather Very Intelligent SDK tutor
                    </p>
                </div>
                <Badge variant="outline" className="ml-auto shrink-0 font-mono text-[10px]">
                    {isBusy ? "PROCESSING" : "STANDBY"}
                </Badge>
            </header>

            {/* ── Conversation ───────────────────────────────────────── */}
            <Conversation className="flex-1">
                <ConversationContent className="mx-auto w-full max-w-3xl">
                    {messages.length === 0 && (
                        <ConversationEmptyState
                            icon={<RadioIcon className="size-8 text-primary" />}
                            title="JARVIS online"
                            description="Ask about any example in the course, or give me something to do."
                        />
                    )}

                    {messages.map((message) => {
                        // `flatMap` with a ternary narrows the part type properly,
                        // so `.data` below is fully typed — no casting.
                        const sources = message.parts.flatMap((p) =>
                            p.type === "data-sources" ? [p.data] : []
                        );
                        const triage = message.parts.flatMap((p) =>
                            p.type === "data-triage" ? [p.data] : []
                        );
                        const stage = message.parts.flatMap((p) =>
                            p.type === "data-stage" ? [p.data] : []
                        );

                        const docs = sources.at(-1)?.docs ?? [];
                        const currentTriage = triage.at(-1);
                        const currentStage = stage.at(-1);

                        return (
                        <div key={message.id}>
                            {/* RAG citations — rendered above the answer, like a
                                research assistant showing its reading list. */}
                            {docs.length > 0 && (
                                <Sources>
                                    <SourcesTrigger count={docs.length} />
                                    <SourcesContent>
                                        {docs.map((doc) => (
                                            <Source
                                                key={doc.id}
                                                href={`#${doc.id}`}
                                                title={doc.title}
                                            >
                                                <FileTextIcon className="size-3.5 shrink-0" />
                                                <span className="font-medium">
                                                    {doc.title}
                                                </span>
                                                <span className="font-mono text-muted-foreground text-[10px]">
                                                    {doc.path}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-auto font-mono text-[10px]"
                                                >
                                                    {doc.score}
                                                </Badge>
                                            </Source>
                                        ))}
                                    </SourcesContent>
                                </Sources>
                            )}

                            {/* Triage result — example 9's classifier, visible. */}
                            {currentTriage && (
                                <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
                                    <BrainIcon className="size-3.5 text-muted-foreground" />
                                    <Badge variant="outline" className="font-mono text-[10px]">
                                        {currentTriage.intent}
                                    </Badge>
                                    <Badge variant="outline" className="font-mono text-[10px]">
                                        {currentTriage.complexity}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                        {currentTriage.topic}
                                    </span>
                                </div>
                            )}

                            {/* Live pipeline stage. */}
                            {currentStage &&
                                !(currentStage.state === "done" && !isBusy) && (
                                    <div className="mb-3 flex items-center gap-2 text-muted-foreground text-xs">
                                        <ActivityIcon className="size-3.5 animate-pulse" />
                                        {currentStage.label}
                                    </div>
                                )}

                            <Message from={message.role}>
                                <MessageContent>
                                    {message.parts.map((part, i) => {
                                        if (part.type === "text") {
                                            return (
                                                <MessageResponse key={i}>
                                                    {part.text}
                                                </MessageResponse>
                                            );
                                        }

                                        // Example 12: every tool call, rendered.
                                        if (part.type.startsWith("tool-")) {
                                            const toolPart = part as unknown as {
                                                type: `tool-${string}`;
                                                state:
                                                    | "input-streaming"
                                                    | "input-available"
                                                    | "output-available"
                                                    | "output-error";
                                                input?: unknown;
                                                output?: unknown;
                                                errorText?: string;
                                            };

                                            return (
                                                <Tool key={i}>
                                                    <ToolHeader
                                                        type={toolPart.type}
                                                        state={toolPart.state}
                                                    />
                                                    <ToolContent>
                                                        <ToolInput input={toolPart.input} />
                                                        <ToolOutput
                                                            output={
                                                                toolPart.output ? (
                                                                    <pre className="overflow-x-auto text-xs">
                                                                        {JSON.stringify(
                                                                            toolPart.output,
                                                                            null,
                                                                            2
                                                                        )}
                                                                    </pre>
                                                                ) : undefined
                                                            }
                                                            errorText={toolPart.errorText}
                                                        />
                                                    </ToolContent>
                                                </Tool>
                                            );
                                        }

                                        return null;
                                    })}
                                </MessageContent>
                            </Message>
                        </div>
                        );
                    })}

                    {messages.length === 0 && (
                        <Suggestions className="mt-4">
                            {SUGGESTIONS.map((s) => (
                                <Suggestion key={s} suggestion={s} onClick={submit} />
                            ))}
                        </Suggestions>
                    )}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            {/* ── Input ──────────────────────────────────────────────── */}
            <div className="border-t px-4 py-4">
                <PromptInput onSubmit={handleSubmit} className="mx-auto max-w-3xl">
                    <PromptInputBody>
                        <PromptInputTextarea placeholder="Ask JARVIS about any example…" />
                    </PromptInputBody>
                    <PromptInputTools>
                        <PromptInputSubmit
                            className="ml-auto"
                            status={status}
                            onStop={stop}
                        />
                    </PromptInputTools>
                </PromptInput>
            </div>
        </div>
    );
}

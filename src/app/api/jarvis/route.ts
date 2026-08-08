/**
 * JARVIS — the agent that combines every example in this course.
 *
 * One request flows through the whole curriculum:
 *
 *   ex 9  triage      classify the question with generateObject + z.enum
 *   ex 3  routing     pick a model based on that classification
 *   RAG   retrieve    embed the question, cosine-similarity the corpus
 *   ex 4  system      inject persona + retrieved context
 *   ex 5  history     the full message array comes from useChat
 *   ex 12 tools       the model can call tools and loop
 *   ex 2  streaming   everything streams to the UI as it happens
 */

import { openai } from "@ai-sdk/openai";
import {
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    generateObject,
    stepCountIs,
    streamText,
    type UIMessage,
} from "ai";
import { z } from "zod";
import { buildContext, retrieve } from "@/lib/jarvis/retrieval";
import { jarvisTools } from "@/lib/jarvis/tools";
import type { JarvisMessage } from "@/lib/jarvis/types";

export const maxDuration = 60;

/** Pull the plain text out of a UIMessage's parts array. */
function textOf(message: UIMessage | undefined): string {
    if (!message) return "";
    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => (part as { text: string }).text)
        .join("\n");
}

const triageSchema = z.object({
    intent: z
        .enum(["course-question", "task", "smalltalk", "off-topic"])
        .describe(
            "course-question: about the AI SDK or these examples. task: asking JARVIS to do something with a tool. smalltalk: greetings and chatter. off-topic: anything else."
        ),
    complexity: z
        .enum(["simple", "complex"])
        .describe("simple: one-step factual answer. complex: needs reasoning or multiple steps."),
    topic: z.string().describe("Three words or fewer naming the subject"),
});

export async function POST(req: Request) {
    const { messages }: { messages: JarvisMessage[] } = await req.json();
    const question = textOf(messages.at(-1));

    const stream = createUIMessageStream<JarvisMessage>({
        execute: async ({ writer }) => {
            // ── Example 9: classify before you answer ────────────────────
            writer.write({
                type: "data-stage",
                id: "stage",
                data: { label: "Triaging request", state: "active" },
            });

            const { object: triage } = await generateObject({
                model: openai("gpt-4o-mini"),
                schema: triageSchema,
                system:
                    "You triage incoming requests for an AI assistant. Classify accurately and briefly.",
                prompt: question,
            });

            writer.write({ type: "data-triage", id: "triage", data: triage });

            // ── Example 3: let the triage pick the model ─────────────────
            // Simple questions don't need the expensive model. This is the
            // single easiest cost saving in a production LLM app.
            const model =
                triage.complexity === "complex"
                    ? openai("gpt-4o")
                    : openai("gpt-4o-mini");

            // ── RAG: retrieve, then augment ──────────────────────────────
            writer.write({
                type: "data-stage",
                id: "stage",
                data: { label: "Searching knowledge base", state: "active" },
            });

            const docs = await retrieve(question);

            writer.write({
                type: "data-sources",
                id: "sources",
                data: {
                    docs: docs.map((d) => ({
                        id: d.id,
                        title: d.title,
                        path: d.path,
                        section: d.section,
                        score: Number(d.score.toFixed(3)),
                    })),
                },
            });

            writer.write({
                type: "data-stage",
                id: "stage",
                data: {
                    label: `Responding via ${triage.complexity === "complex" ? "gpt-4o" : "gpt-4o-mini"}`,
                    state: "done",
                },
            });

            // ── Examples 4 + 12 + 2: persona, tools, streaming ───────────
            const result = streamText({
                model,
                messages: await convertToModelMessages(messages),
                system: `You are JARVIS, the assistant for an AI SDK course.

Voice: precise, dry, quietly amused. Address the user as "sir" occasionally, never every line. Confident and brief. Never sycophantic.

Rules:
- Answer from the retrieved context below when it is relevant, and cite the example by name, e.g. "example 2 covers this".
- If the context does not cover the question, say so plainly and answer from general knowledge, flagging that you are doing so.
- Never invent file paths or API names. If unsure, say you are unsure.
- Use tools when they genuinely help. Do not narrate that you are about to use one; just use it.
- Format code as fenced TypeScript blocks. Keep prose tight.

Retrieved context:
${buildContext(docs)}`,
                tools: jarvisTools,
                // Bound the agent loop. Without this the model can call tools
                // until your bill becomes a conversation piece.
                stopWhen: stepCountIs(5),
            });

            writer.merge(result.toUIMessageStream({ sendStart: false }));
        },
        onError: (error) =>
            error instanceof Error ? error.message : "JARVIS encountered a fault.",
    });

    return createUIMessageStreamResponse({ stream });
}

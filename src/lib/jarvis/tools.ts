/**
 * JARVIS's tools — example 12, for real.
 *
 * Note `inputSchema`, NOT `parameters`. `parameters` was the AI SDK v4 name and
 * silently gives your tool no schema on v5+. This project is on ai@7.
 *
 * Two of these tools call a model *inside* execute(). That's deliberate: it
 * shows students that the techniques from examples 7 and 9 don't stop being
 * useful once you have an agent — they become the agent's capabilities.
 */

import { openai } from "@ai-sdk/openai";
import { generateObject, tool } from "ai";
import { z } from "zod";
import { knowledgeBase } from "./knowledge-base";

/** Example 3: one small model, reused for every sub-task. */
const helperModel = openai("gpt-4o-mini");

/**
 * Plain data lookup — no LLM involved.
 * The cheapest, fastest, most reliable kind of tool. Prefer these.
 */
export const listCurriculum = tool({
    description:
        "List the AI SDK examples available in this course. Use when the user asks what they can learn, what examples exist, or what to study next.",
    inputSchema: z.object({
        section: z
            .string()
            .optional()
            .describe(
                'Optional filter, e.g. "Basics", "Structured data", "Multimodal", "Agents", "Local models", "Concepts"'
            ),
    }),
    execute: async ({ section }) => {
        const docs = section
            ? knowledgeBase.filter(
                  (d) => d.section.toLowerCase() === section.toLowerCase()
              )
            : knowledgeBase;

        return {
            count: docs.length,
            examples: docs.map((d) => ({
                title: d.title,
                section: d.section,
                path: d.path,
            })),
        };
    },
});

/**
 * Example 9, wrapped as a tool: generateObject + z.enum = a classifier.
 * The model can now classify sentiment on demand, mid-conversation.
 */
export const analyzeSentiment = tool({
    description:
        "Classify the sentiment of a piece of text as positive, negative or neutral. Use when the user asks how something sounds, or wants feedback text analysed.",
    inputSchema: z.object({
        text: z.string().describe("The text to classify"),
    }),
    execute: async ({ text }) => {
        const { object } = await generateObject({
            model: helperModel,
            schema: z.object({
                label: z.enum(["positive", "negative", "neutral"]),
                confidence: z
                    .number()
                    .min(0)
                    .max(1)
                    .describe("How certain you are, 0 to 1"),
                reason: z.string().describe("One short sentence explaining why"),
            }),
            system:
                "You are a sentiment classifier. Classify the sentiment of the text as positive, negative or neutral.",
            prompt: text,
        });

        return object;
    },
});

/**
 * Example 7, wrapped as a tool: generateObject + a nested schema.
 * Proof that structured output composes into agent capabilities.
 */
export const generateRecipe = tool({
    description:
        "Create a structured recipe from a description. Use when the user asks for a recipe or how to cook something.",
    inputSchema: z.object({
        request: z
            .string()
            .describe('What to cook, e.g. "tomato rice for two people"'),
    }),
    execute: async ({ request }) => {
        const { object } = await generateObject({
            model: helperModel,
            schema: z.object({
                name: z.string().describe("The title of the recipe"),
                servings: z.number().describe("How many people it serves"),
                ingredients: z
                    .array(
                        z.object({
                            name: z.string(),
                            amount: z.string(),
                        })
                    )
                    .describe("The ingredients of the recipe"),
                steps: z.array(z.string()).describe("The steps to make it"),
            }),
            system:
                "You are helping a user create a recipe. Use Indian English variants of names, like coriander over cilantro.",
            prompt: request,
        });

        return object;
    },
});

/**
 * Pure JARVIS flavour: fake telemetry, instantly. Costs nothing, always works,
 * and gives the agent something to "check" so the tool UI has something fun to
 * render during a demo.
 */
export const systemDiagnostics = tool({
    description:
        "Run a diagnostic sweep and report system status. Use when the user asks about system health, status, or diagnostics.",
    inputSchema: z.object({
        subsystem: z
            .enum(["power", "network", "storage", "all"])
            .describe("Which subsystem to scan"),
    }),
    execute: async ({ subsystem }) => {
        const readings = {
            power: { level: "94%", draw: "1.2 kW", status: "nominal" },
            network: { latency: "12ms", throughput: "940 Mbps", status: "nominal" },
            storage: { used: "2.1 TB", free: "5.9 TB", status: "nominal" },
        };

        return {
            subsystem,
            scannedAt: new Date().toISOString(),
            readings:
                subsystem === "all"
                    ? readings
                    : { [subsystem]: readings[subsystem] },
            summary:
                subsystem === "all"
                    ? "All subsystems nominal."
                    : `${subsystem} subsystem nominal.`,
        };
    },
});

export const jarvisTools = {
    listCurriculum,
    analyzeSentiment,
    generateRecipe,
    systemDiagnostics,
};

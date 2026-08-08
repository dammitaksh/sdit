import { streamText, generateObject, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { fetchGitHubCommits, queryDatabaseStatus, readServerLogs } from "@/lib/tools";
import { getIncidentContext } from "@/lib/ai/context";

/**
 * Extract the text content from a UIMessage (parts-based format from useChat).
 */
function getTextFromUIMessage(msg: Record<string, unknown>): string {
  if (Array.isArray(msg.parts)) {
    const textParts = msg.parts.filter(
      (p: Record<string, unknown>) => p.type === "text"
    );
    if (textParts.length > 0) {
      return textParts.map((p: Record<string, unknown>) => p.text).join("\n");
    }
  }
  if (typeof msg.content === "string") {
    return msg.content;
  }
  return JSON.stringify(msg);
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Grab the latest user message text for classification
  const latestMessage = messages[messages.length - 1];
  const messageContent = getTextFromUIMessage(latestMessage);

  // Convert UIMessages from useChat to ModelMessages for streamText
  const modelMessages = await convertToModelMessages(messages);

  // 1. Classification step
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      severity: z.enum(["LOW", "HIGH"]).describe(
        "Determine if the incident/issue described is LOW or HIGH severity."
      ),
    }),
    prompt: `Analyze the following user message and classify its severity:\n\n${messageContent}`,
  });

  console.log(`[ROUTING] Message classified as ${object.severity} severity.`);

  // 2. All routing uses gpt-4o-mini
  console.log(`[ROUTING] Using OpenAI gpt-4o-mini.`);

  // 3. RAG Simulation
  const context = getIncidentContext(messageContent);

  // 4. Main streamText execution
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: modelMessages,
    system: `Observe the context, use tools to investigate, and reason step-by-step.\n\nContext:\n${context}`,
    tools: {
      fetchGitHubCommits,
      queryDatabaseStatus,
      readServerLogs,
    },
  });

  return result.toUIMessageStreamResponse();
}
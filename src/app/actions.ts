"use server";

import { streamText, generateObject, streamObject, CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { fetchGitHubCommits, queryDatabaseStatus, readServerLogs } from "@/lib/tools";
import { getIncidentContext } from "@/lib/ai/context";

export async function continueConversation(messages: CoreMessage[]) {
  const latestMessage = messages[messages.length - 1];
  const messageContent = typeof latestMessage.content === 'string' 
    ? latestMessage.content 
    : JSON.stringify(latestMessage.content);

  // 1. Classification step
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      severity: z.enum(["LOW", "HIGH"]).describe("Determine if the incident/issue described is LOW or HIGH severity."),
    }),
    prompt: `Analyze the following user message and classify its severity:\n\n${messageContent}`,
  });

  console.log(`[ROUTING] Message classified as ${object.severity} severity.`);
  console.log(`[ROUTING] Using OpenAI gpt-4o-mini.`);

  // 2. RAG Simulation
  const context = getIncidentContext(messageContent);

  // 3. Main streamText execution
  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages,
    system: `Observe the context, use tools to investigate, and reason step-by-step.\n\nContext:\n${context}`,
    tools: {
      fetchGitHubCommits,
      queryDatabaseStatus,
      readServerLogs,
    },
  });

  return result.toDataStreamResponse();
}

export async function generatePostMortem(messages: CoreMessage[]) {
  const result = await streamObject({
    model: openai("gpt-4o-mini"),
    messages,
    schema: z.object({
      incidentTitle: z.string().describe("A concise title for the incident"),
      rootCause: z.string().describe("Detailed explanation of the root cause"),
      affectedSystems: z.array(z.string()).describe("List of systems affected by the incident"),
      suggestedFixCodeSnippet: z.string().describe("A code snippet or patch that fixes the issue"),
    }),
  });

  return result.toTextStreamResponse();
}

import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamObject({
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

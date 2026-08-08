import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";

// Ollama exposes an OpenAI-compatible API at /v1, so the AI SDK can talk to it
// with the generic openai-compatible provider. No API key: it's your machine.
const ollama = createOpenAICompatible({
    name: "ollama",
    baseURL: "http://localhost:11434/v1",
});

// Must be a model you have already pulled: `ollama pull llama3.2`
const model = ollama("llama3.2");

export async function askLocalModel(prompt: string) {
    // maxRetries: 0 — if a server on your own machine refuses the connection,
    // retrying won't help. Fail fast with a readable error instead.
    const result = streamText({ model, prompt, maxRetries: 0 });

    // Print each piece as it arrives instead of waiting for the full answer.
    for await (const chunk of result.textStream) {
        process.stdout.write(chunk);
    }

    // Resolves once the stream is finished.
    const usage = await result.usage;
    console.log(`\n\n[${usage.totalTokens} tokens]`);
}

await askLocalModel("Explain what a large language model is, in two sentences.");

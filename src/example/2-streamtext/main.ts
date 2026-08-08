import { streamText } from "ai";

export async function getMyAnswer(prompt: string) {
    const result = streamText({
        model: "openai/gpt-4o-mini",
        prompt,
    });

    for await (const chunk of result.textStream) {
        process.stdout.write(chunk);
    }
}

await getMyAnswer("What is the capital of iNDIA and tell me about?");

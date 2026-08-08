// import { streamText } from "ai";

// export async function getMyAnswer(prompt: string) {
//     const result = streamText({
//         model: "openai/gpt-4o-mini",
//         prompt,
//     });

//     for await (const chunk of result.textStream) {
//         process.stdout.write(chunk);
//     }
// }

// await getMyAnswer("What is the capital of France?");

// // Output: "The capital of France is Paris."
import { type ModelMessage } from "ai";
import { startServer } from "./server";

const messagesToSend: ModelMessage[] = [
    {
        role: "user",
        content: "whats the capital of India?"
    }
]

await startServer();

const response = await fetch("http://localhost:4371/api/get-completions", {
    method: "POST",
    body: JSON.stringify(messagesToSend),
    headers: {
        "Content-Type": "application/json",
    },
})

const newMessages: ModelMessage[] = await response.json() as ModelMessage[];

const allMessages = [...messagesToSend, ...newMessages];

console.dir(allMessages, { depth: null });
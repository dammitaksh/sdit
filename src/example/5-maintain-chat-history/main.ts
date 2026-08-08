// Preserving the Chat history and context
import { type ModelMessage } from "ai";
import { startServer } from "./server";

const messagesToSend: ModelMessage[] = [
    {
        role: "user",
        content: "whats the capital of India?"
    },

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
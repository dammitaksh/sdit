import { generateText } from "ai";

export async function getMyAnswer(prompt: string) {
    const { text } = await generateText({
        model: "google/gemini-omni-flash-preview",
        prompt,
    });

    return text
}


const answer = await getMyAnswer("Who is WALL-E??");

console.log(answer);
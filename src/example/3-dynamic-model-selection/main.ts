// Dynamic model Selection

import { generateText, type LanguageModel } from "ai";

export const ask = async (prompt: string, model: LanguageModel) => {
    const { text } = await generateText({
        model: model,
        prompt,
    })

    return text;
}

// example:

const prompt = "Definition of Language Models?";

const model = "openai/gpt-4o-mini";


const answer = await ask(prompt, model);

// Output
console.log(answer);
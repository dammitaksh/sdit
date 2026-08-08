import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getLocalHost } from "@/example/6-running-local-models/utils";
import { generateText, ModelMessage } from "ai";

const lmstudio = createOpenAICompatible({
    name: "lmstudio",
    baseURL: `http://${getLocalHost()}:1234/v1`,

})

const model = lmstudio("")

export const askLocalLLMQuestion = async (input: string) => {
    const { text } = await generateText({
        model,
        prompt: input,
        maxRetries: 0,
    })
    return text
}

const input = "A story about your grandmother"

const result = askLocalLLMQuestion(input)

console.log(result);
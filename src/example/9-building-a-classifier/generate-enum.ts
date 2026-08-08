import { openai } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateObject } from 'ai';
import { z } from 'zod';

const schema = z.object({
    label: z.enum(['positive', 'negative', 'neutral']),
})


export const classifySentiment = async (text: string) => {
    const { object } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema,
        prompt: text,
        system: 'You are a sentiment classifier. Classify the sentiment of the text as positive, negative or neutral.',
    });

    return object.label;
};
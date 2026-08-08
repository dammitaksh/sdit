import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const model = 'openai/gpt-4o-mini';

const schema = z.object({
    recipe: z.object({
        name: z.string().describe('the title of the recipe'),
        ingredients: z.array(
            z.object({
                name: z.string().describe('name of the ingredient'),
                amount: z.string(),
            }),
        ).describe('the ingredients of the recipe'),
        steps: z.array(z.string()).describe('the steps to make the recipe'),
    }),
});

export const streamRecipe = async (prompt: string) => {
    const result = streamObject({
        model,
        schema,
        prompt,
        system: 'You are helping a user create a recipe. Use Indian English variants of names like coriander over cilantro.',
    });

    for await (const partialObject of result.partialObjectStream) {
        console.log('Partial recipe update:');
        console.log(JSON.stringify(partialObject, null, 2));
    }

    const finalObject = await result.object;

    return finalObject.recipe;
};
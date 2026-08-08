import { generateObject } from 'ai';
import { z } from 'zod';

const model = "openai/gpt-4o-mini";

const schema = z.object({
    recipe: z.object({
        name: z.string().describe(' the title of recipie'),
        ingredients: z.array(
            z.object({
                name: z.string().describe('name of the ingredient'),
                amount: z.string()
            })
        ).describe('the ingredients of the recipe'),
        steps: z.array(z.string()).describe('the steps to make the recipe')
    }),

})

export const createRecipe = async (prompt: string) => {
    const { object } = await generateObject({
        model,
        schema,
        prompt,
        system: 'You are helping a user create a recipe. Use Indian English variants of names like coriander over cilantro.',
    });

    return object.recipe;
}
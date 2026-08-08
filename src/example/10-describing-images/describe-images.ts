import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { readFileSync } from "fs";
import path from "path";

const systemPrompt =
    'You will receive an image. ' +
    'Please create an alt text for the image. ' +
    'Be concise. ' +
    'Use adjectives only when necessary. ' +
    'Do not pass 160 characters. ' +
    'Use simple language. ';



export const describeImage = async (imageName: string) => {
    // 1. Build the correct path to the public folder
    const imagePath = path.join(process.cwd(), 'public', imageName);
    const model = openai('gpt-4o-mini');
    // 2. Read the file
    const imageAsUint8Array = readFileSync(imagePath);

    const { text } = await generateText({

        model: model,
        system: systemPrompt,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: "image",
                        image: imageAsUint8Array,
                    }
                ]
            }
        ]
    })

    return text;
};

const description = await describeImage('orange.jpg');




console.log(description);
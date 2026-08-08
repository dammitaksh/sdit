import { NextResponse } from 'next/server'
import { getMyAnswer } from '@/example/1-generate-text/main';
import { createRecipe } from '@/example/7-structured-outputs/structured-output';
import { classifySentiment } from '@/example/9-building-a-classifier/generate-enum';

export async function POST(req: Request) {
    const { mode, input } = await req.json();

    try {
        if (mode === 'text') {
            const text = await getMyAnswer(input);
            return NextResponse.json({ type: 'text', text });
        }

        if (mode === 'recipe') {
            const recipe = await createRecipe(input);
            return NextResponse.json({ type: 'recipe', recipe });
        }

        if (mode === 'classify') {
            const label = await classifySentiment(input);
            return NextResponse.json({ type: 'classify', label });
        }

        return NextResponse.json({ error: 'unknown mode' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
    }
}

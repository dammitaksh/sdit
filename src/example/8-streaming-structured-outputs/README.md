# 8 — Streaming structured outputs: watch JSON build itself

Example 7, but you get to watch. This is example 2's streaming trick applied to
example 7's schema trick. The AI SDK is very into combining its own ideas.

## What's in here

| File                   | Its job in life                                |
| ---------------------- | ---------------------------------------------- |
| `structured-output.ts` | Same schema as example 7, but `streamObject`   |
| `main.ts`              | Prints every half-built version, then the final |
| `example.json`         | The finished shape                              |

## How it works

`streamObject` hands you the object repeatedly as it grows. Watching it is
weirdly satisfying, like a house being built by a very fast, very confident crab:

```
  t=0.1s   { }

  t=0.3s   { recipe: { name: "Tom" } }
                              ^ half a word. it's fine. keep going.

  t=0.6s   { recipe: { name: "Tomato Rice", ingredients: [ ] } }

  t=0.9s   { recipe: { name: "Tomato Rice",
                       ingredients: [ { name: "rice" } ] } }
                                            ^ amount not here yet!

  t=1.4s   { recipe: { name: "Tomato Rice",
                       ingredients: [ { name: "rice", amount: "1 cup" },
                                      { name: "tomato", amount: "2" } ],
                       steps: [ "Rinse the rice" ] } }

  t=2.0s   ...complete. the crab is done. the house is up.
```

## The one thing that trips everybody up

**Partial objects are partial.** Fields you expect may not exist yet.

```ts
for await (const partialObject of result.partialObjectStream) {
    partialObject.recipe.steps.length  // 💥 steps might be undefined!
    partialObject?.recipe?.steps?.length ?? 0  // ✅ paranoid, correct
}
```

TypeScript types everything here as *deeply optional* and it is not being
dramatic — it is being accurate. Optional-chain everything inside the loop.

When you need the guaranteed-complete version, `await result.object` at the end.
That one is fully typed and fully there.

## Why bother?

For a recipe in a terminal, honestly, you don't. But in a UI where a form is
filling itself in field by field, or a table populating row by row, this is the
difference between "wow" and "is it frozen?".

## Run it

```bash
bun run src/example/8-streaming-structured-outputs/main.ts
```

Your terminal will scroll a *lot* — that's the whole point, each print is one
frame of the animation.

## Spot the difference 👀

Example 7 uses the gateway string, this one imports the provider directly:

```ts
// example 7
const model = "openai/gpt-4o-mini";

// example 8
import { openai } from '@ai-sdk/openai';
const model = openai('gpt-4o-mini');
```

Both work. The first goes through the AI Gateway, the second talks to OpenAI
directly. Good moment to explain the difference to your students.

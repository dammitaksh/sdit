# 7 — Structured outputs: JSON, guaranteed, no begging

Asking a model for JSON in the prompt gives you JSON *most* of the time. The
other times you get JSON wrapped in ```` ```json ```` fences, or a cheerful
"Sure! Here's your JSON:" glued to the front, and your `JSON.parse` explodes at
2am.

`generateObject` ends that entire genre of suffering.

## What's in here

| File                  | Its job in life                              |
| --------------------- | -------------------------------------------- |
| `structured-output.ts`| The Zod schema + the `generateObject` call   |
| `main.ts`             | Asks for tomato rice, prints the object      |
| `example.json`        | A sample of the shape you get back           |

## How it works

**The old way — vibes-based parsing:**

```
   "give me JSON please"
            |
            v
   "Certainly! Here's your JSON:
    ```json
    { "name": "Tomato Rice" }
    ```
    Let me know if you need anything else!"
            |
            v
     JSON.parse(...)
            |
            v
     💥 SyntaxError: Unexpected token 'C'
```

**The new way — the schema is the law:**

```
   ┌─────────────────┐
   │   ZOD SCHEMA    │   "recipe MUST have: name (string),
   │   (the bouncer) │    ingredients (array), steps (array)"
   └────────┬────────┘
            │ handed to the model as rules
            v
     ┌─────────────┐
     │    MODEL    │  tries to leave with a stray string
     └──────┬──────┘
            │
       ┌────┴────┐
       │ BOUNCER │  "absolutely not. try again."
       └────┬────┘
            │
            v
   a real, typed, parsed JS object.
   no fences. no "certainly!". no tears.
```

## The `.describe()` trick

```ts
name: z.string().describe('the title of the recipe'),
```

Those `.describe()` calls aren't comments for you — they're **sent to the model**
as field documentation. Vague schema, vague results. Describing your fields well
is genuinely half of getting good output.

## Bonus: free TypeScript types

Because Zod knows the shape, so does TypeScript. `recipe.` and watch autocomplete
work. No `any`. No casting. It just knows.

## Run it

```bash
bun run src/example/7-structured-outputs/main.ts
```

## Fun detail

The system prompt says:

> `Use Indian English variants of names like coriander over cilantro.`

Because the model will absolutely say "cilantro" to an Indian audience otherwise.
Small prompt, big cultural correction.

Next up: example **8**, which does this exact thing but streams it.

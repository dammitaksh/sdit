# 3 — Dynamic model selection: stop hardcoding, you animal

In examples 1 and 2 the model name was welded into the function. Here it becomes
a **parameter**. That's the entire lesson. It is a very short lesson.

## What's in here

| File      | Its job in life                                  |
| --------- | ------------------------------------------------ |
| `main.ts` | Takes a model as an argument like a civilized dev |

## How it works

**Before — one function per model, forever:**

```
        askGpt4()  ─┐
       askClaude()  ─┤
       askGemini()  ─┼──> 400 lines of copy-paste
       askLlama()   ─┤    and a maintenance nightmare
     askThatNewOne() ┘
```

**After — one function, model rides in as luggage:**

```
                    ┌─────────────────────┐
   "gpt-4o-mini" ──>│                     │
      "claude"   ──>│   ask(prompt,       │──> text
      "gemini"   ──>│        model)       │
     literally   ──>│                     │
     whatever      └─────────────────────┘
                       one function.
                       one. function.
```

## The important bit

```ts
export const ask = async (prompt: string, model: LanguageModel) => { ... }
//                                               ^^^^^^^^^^^^^
//                        the type that means "any model, I'm not picky"
```

`LanguageModel` is the AI SDK's "I accept all currencies" type. Import it with
`import { type LanguageModel } from "ai"`.

## Why you actually want this

Real reasons, not just tidiness:

- **Cheap model for easy jobs, expensive model for hard ones.** Classifying
  "is this spam?" does not need the flagship model.
- **Fallbacks.** Primary provider is down at 3am? Swap the argument.
- **Testing.** Point it at a fake model in tests and stop paying for CI runs.

## Run it

```bash
bun run src/example/3-dynamic-model-selection/main.ts
```

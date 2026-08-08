# 4 — System prompts: giving the AI a job description

`prompt` is what the user says. `system` is who the AI *is*. Mix them up and
you'll spend an afternoon confused.

## What's in here

| File      | Its job in life                                              |
| --------- | ------------------------------------------------------------ |
| `main.ts` | Bullies a model into summarizing text in exactly 2 sentences |

## How it works

Under the hood, `system` is just a message that gets shoved in **before** the
user ever speaks:

```
   ┌──────────────────────────────────────────────┐
   │ SYSTEM (whispered before the user arrives):  │
   │                                              │
   │  "You are a summarizer. Two sentences.       │
   │   No preamble. Don't you dare say            │
   │   'Here is your summary'. I will know."      │
   └──────────────────────────────────────────────┘
                        │
                        v
   ┌──────────────────────────────────────────────┐
   │ USER (blissfully unaware of the above):      │
   │  "<a big wall of marketing copy>"            │
   └──────────────────────────────────────────────┘
                        │
                        v
              two tidy sentences.
              no fluff. no "certainly!".
```

The commented-out block at the bottom of `main.ts` shows this literal message
array. Read it — it demystifies the whole thing.

## Why the prompt is so aggressively specific

Look at what it has to say out loud:

> `Do not use the phrase "Here is your summary" or any similar phrase`

That line exists because models **love** preamble. They want to chat. They want
to say "Certainly! Here's a concise summary for you!" before doing the job.
Every oddly specific instruction in a system prompt is a scar from a previous
annoying output.

This is the real lesson: **system prompts grow by accumulating grudges.**

## The classic bug

```ts
// WRONG - the instructions become part of the thing being summarized
prompt: "You are a summarizer. " + userText

// RIGHT - instructions and content live in separate rooms
system: "You are a summarizer.",
prompt: userText
```

## Run it

```bash
bun run src/example/4-system-prompt/main.ts
```

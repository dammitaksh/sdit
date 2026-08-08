# 12 — Tool calling: 🚧 not built yet 🚧

**Status: `main.ts` is empty. Zero bytes. A blank canvas.**

Not a bug in your setup, not a missing dependency — the file is genuinely empty.
Either finish it before class, or use it as the live-coding slot. (Honestly, the
live-coding slot is the better move. This is the most fun one to build in front
of people.)

## The concept, so you can pitch it before you build it

Everything so far: the model produces **words**. Tool calling: the model
produces **actions**.

The key mental shift — the model doesn't run anything. It can't. It has no
hands. It just *asks you* to run something, and you decide whether to.

```
   YOU: "what's the weather in Bengaluru?"
            |
            v
   ┌────────────────────────────────────────┐
   │ MODEL: "I don't know. I'm a text       │
   │  predictor from a frozen snapshot of   │
   │  the past. But I notice you gave me a  │
   │  tool called getWeather, so:           │
   │                                        │
   │  >> please call getWeather('Bengaluru')│
   │     and get back to me. I'll wait."    │
   └────────────────┬───────────────────────┘
                    |
                    v
   YOUR CODE: actually calls the weather API
              (this part is just... normal code)
                    |
                    v
              { temp: 28, condition: "humid" }
                    |
                    v
   ┌────────────────────────────────────────┐
   │ MODEL: "ah, excellent. 28°C and humid  │
   │  in Bengaluru. As I definitely knew."  │
   └────────────────┬───────────────────────┘
                    v
   YOU: a real answer about the actual present day
```

The model is a very smart manager who can only send emails. **Your code does all
the actual work.** Say that line in class, it lands.

## Why it matters

This is the doorway from "chatbot" to "agent". A model that can call tools can
search, query your database, send email, book things, run code. Every AI agent
you've heard of is this loop, repeated.

It's also where safety gets real: the model *asks*, and your code decides. Never
wire a model straight into `deleteAllUsers()`. Good discussion to have while the
concept is fresh.

## What it'll look like

Roughly — check the current AI SDK docs before teaching, this API moves:

```ts
const result = await generateText({
    model: "openai/gpt-4o-mini",
    prompt: "What's the weather in Bengaluru?",
    tools: {
        getWeather: tool({
            description: 'Get the current weather for a city',
            inputSchema: z.object({
                city: z.string().describe('the city name'),
            }),
            execute: async ({ city }) => {
                return { temp: 28, condition: 'humid' };
            },
        }),
    },
    stopWhen: stepCountIs(5),
});
```

Two things to flag when you write it:

- **`description`** is not a comment — it's how the model decides *whether* to
  use the tool. A vague description means a tool that never gets called, or one
  that gets called constantly for no reason.
- **`stopWhen`** stops the model calling tools in an infinite loop. Multi-step
  tool calling won't continue without something like it.

## Suggested build order for class

1. One tool, hardcoded fake data (no API key, no network, nothing to go wrong)
2. Print the tool call so everyone sees the model *asking* rather than doing
3. Swap the fake data for a real `fetch`
4. Add a second tool and let the model choose between them ← the "whoa" moment

## Run it

```bash
bun run src/example/12-tool-call/main.ts
```

Right now this prints nothing at all, because the file is empty. Which is,
technically, correct behavior.

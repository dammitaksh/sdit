# 13 — Local LLMs with Ollama: unplug the internet, keep the AI

Your laptop, doing the whole thing. No API key, no network, no per-token bill,
no company logging your prompts. Just you and a very warm CPU.

> Example `6-running-local-models` does the same idea with **LM Studio** and
> `generateText`. This one uses **Ollama** and `streamText`.

```
   THE CLOUD WAY              THE OLLAMA WAY
   -------------              --------------
   your prompt                your prompt
        |                          |
        v                          v
   [ the internet ]           [ localhost ]
        |                          |
        v                          v
   [ someone's datacenter ]   [ your laptop, 3pm ]
   [ in another country   ]   [ fans: MAXIMUM     ]
   [ $0.0001 per token    ]   [ battery: 4%       ]
   [ they keep your logs  ]   [ nobody knows      ]
   [                      ]   [ nobody will ever  ]
   [                      ]   [ know              ]
        |                          |
        v                          v
     an answer                  an answer
                                (slower, free,
                                 gloriously private)
```

## How the connection works

Ollama serves two APIs at once on port `11434`:

| Endpoint          | Shape                  |
| ----------------- | ---------------------- |
| `/api/...`        | Ollama's own format    |
| `/v1/...`         | OpenAI-compatible      |

Because of that `/v1` endpoint, we don't need an Ollama-specific package. The
generic `@ai-sdk/openai-compatible` provider already speaks that dialect — we
just point its `baseURL` at Ollama instead of at OpenAI.

```
streamText()  →  @ai-sdk/openai-compatible  →  http://localhost:11434/v1  →  Ollama  →  your GPU/CPU
```

## Steps

**1. Install Ollama** — download from [ollama.com/download](https://ollama.com/download).

**2. Pull a model.** Small ones are fine to start with (~2 GB):

```bash
ollama pull llama3.2
```

**3. Make sure the server is running.** The desktop app starts it for you; otherwise:

```bash
ollama serve
```

Confirm it's up — this should return JSON listing your models:

```bash
curl http://localhost:11434/api/tags
```

**4. Point the AI SDK at it.** This is the only part that differs from any other
provider — see `main.ts`:

```ts
const ollama = createOpenAICompatible({
    name: "ollama",
    baseURL: "http://localhost:11434/v1",
});

const model = ollama("llama3.2"); // must match a model you pulled
```

There is no `apiKey`. Ollama doesn't authenticate local callers.

**5. Run it:**

```bash
bun run src/example/13-local-llm-ollama/main.ts
```

You should see the answer appear word by word, then a token count.

## Troubleshooting

**`Cannot connect to API: Unable to connect.`**
Ollama isn't running. Start it with `ollama serve` and check step 3.

**`model "llama3.2" not found, try pulling it first`**
The string passed to `ollama(...)` must exactly match a pulled model. List what
you actually have with `ollama list` and use one of those names.

**It's very slow.**
The first request after starting loads the model into memory — later ones are
faster. If it's still slow, the model is too big for your hardware; try a
smaller one like `llama3.2:1b`.

## Swapping models

Anything from `ollama list` works. Only the model string changes:

```ts
const model = ollama("mistral");
const model = ollama("qwen2.5-coder");
const model = ollama("llama3.2:1b");
```

Because everything goes through the AI SDK, the rest of your code — `streamText`,
tools, structured outputs — stays identical to the cloud-model examples.

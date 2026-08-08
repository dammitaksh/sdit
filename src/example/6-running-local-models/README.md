# 6 — Local models with LM Studio: your laptop is the datacenter now

Stop paying per token. Start paying with battery life and fan noise.

> Want the same idea with **Ollama** and streaming instead? That's example **13**.

## What's in here

| File       | Its job in life                                        |
| ---------- | ------------------------------------------------------ |
| `main.ts`  | Points the AI SDK at LM Studio instead of the cloud    |
| `utils.ts` | Digs through your network interfaces to find your IP   |

## How it works

The trick: LM Studio pretends to be OpenAI. Same request shape, different
address. The AI SDK genuinely cannot tell the difference and nobody tells it.

```
   BEFORE                          AFTER
   ------                          -----
   your code                       your code
       |                               |
       v                               v
   api.openai.com                  localhost:1234
       |                               |
       v                               v
   [ someone else's ]              [ YOUR laptop ]
   [ enormous GPU   ]              [ 4 fans screaming ]
   [ $$$ per token  ]              [ free, but warm ]
       |                               |
       └────────> same JSON <──────────┘
                  shape!
```

`createOpenAICompatible` is the adapter that makes this possible. It speaks
OpenAI-dialect to whatever you point it at.

## The two gotchas

**1. The empty model string:**

```ts
const model = lmstudio("")
//                     ^^ yes, empty. LM Studio serves whatever
//                        model you loaded in its GUI. Passing ""
//                        means "you know, that one. the one that's open."
```

Slightly cursed, works fine.

**2. `maxRetries: 0`:**

```ts
maxRetries: 0,
```

If a server on *your own machine* refuses the connection, retrying 3 times with
exponential backoff helps precisely nobody. Fail fast, read the error, go start
LM Studio.

## What `utils.ts` is for

It hunts for your machine's real LAN IP (like `192.168.1.7`) instead of just
using `localhost`, falling back to `localhost` if it finds nothing. Useful when
the server and the code aren't on the same machine — e.g. running from WSL, a
container, or a phone on the same wifi.

For plain local dev, `localhost` would honestly do. But now you know how to find
your IP in Node, which is a genuinely useful party trick.

## Before you run it

1. Install **LM Studio**
2. Download a model *inside the app*
3. Go to the **Developer / Local Server** tab and hit **Start Server**
4. Confirm it says port `1234`

Skip step 3 and you get a connection error. Everyone skips step 3.

## Run it

```bash
bun run src/example/6-running-local-models/main.ts
```

## Spot the bug 👀

Look closely at the last lines of `main.ts`:

```ts
const result = askLocalLLMQuestion(input);  // <- no await!
console.log(result);                        // <- prints Promise { <pending> }
```

Leave this in and make your students find it. It's the single most common async
mistake in JavaScript and it's sitting right there. The fix is `await`.

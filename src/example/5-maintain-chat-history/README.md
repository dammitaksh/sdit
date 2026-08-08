# 5 — Chat history: the model has no memory. None. Zero.

Biggest shock for beginners: **the AI does not remember your last message.**
Every single request starts from total amnesia. ChatGPT only *seems* to remember
because it re-sends the entire conversation every time. Every. Single. Time.

## What's in here

| File        | Its job in life                                             |
| ----------- | ----------------------------------------------------------- |
| `server.ts` | A tiny Hono server on port 4371 that talks to the model     |
| `main.ts`   | Starts that server, sends a message, glues the replies back |

## How it works

**What students think is happening:**

```
   ┌──────────────────────────┐
   │   the AI, remembering    │
   │   your whole friendship  │  <- fiction. a lie. does not exist.
   └──────────────────────────┘
```

**What is actually happening:**

```
  Turn 1
  YOU send:  [ "capital of India?" ]
  AI sees:   [ "capital of India?" ]
  AI says:   "New Delhi"
  AI then:   *immediately forgets everything, forever*

  Turn 2  (you must carry the past yourself)
  YOU send:  [ "capital of India?", "New Delhi", "what's it famous for?" ]
             └──────── you glued this together ────────┘
  AI sees:   the whole thing, fresh, for the "first" time
  AI says:   "Red Fort, India Gate..."
  AI then:   *forgets again. it is Groundhog Day in there.*
```

The model is a goldfish with a PhD. **You** are its notebook.

## The line that does the gluing

```ts
const allMessages = [...messagesToSend, ...newMessages];
//                   ^^^ old stuff        ^^^ what the AI just said
```

That's the entire "memory" system. An array. You were expecting something
fancier and I'm sorry.

## Why a whole server for this?

Because that's how it works in real life: the browser holds the conversation,
the server holds the API key. This example is a tiny rehearsal of that split.

Note `server.ts` returns `result.responseMessages` — not just the text. Those
come back already shaped as proper messages, ready to append. Convenient.

## The bill grows quadratically

Message 50 means re-sending messages 1–49 as input. Long chats get expensive
*fast*. Real apps eventually trim old messages or summarize them. Just so you
know why your token bill looks like that.

## Run it

```bash
bun run src/example/5-maintain-chat-history/main.ts
```

If it hangs, something else is squatting on port **4371**.

# 2 — streamText: the illusion of speed

Same model. Same question. Same total wait time. But now words appear one by one
and it *feels* fast. This is a psychological trick and it works on everyone,
including you, forever.

## What's in here

| File      | Its job in life                                          |
| --------- | -------------------------------------------------------- |
| `main.ts` | Asks about the capital of India and types it out at you. |

## How it works

**Example 1 (`generateText`) — the awkward dinner party:**

```
you: "tell me about India"
                                    [ ................... ]
                                    [ ...still nothing... ]
                                    [ ..did it crash?.... ]
                                    [ ...................]
model: "HERE IS EVERYTHING AT ONCE"
```

**Example 2 (`streamText`) — a friend who thinks out loud:**

```
you: "tell me about India"
model: "The"
model: "The capital"
model: "The capital of"
model: "The capital of India"
model: "The capital of India is New Delhi"
                    ^
        you started reading here and felt
        great about your life choices
```

Both finish at the same time. One of them feels twice as fast. Ship the second one.

## The magic line

```ts
for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
}
```

Note **`process.stdout.write`**, not `console.log`. `console.log` adds a newline
after every single chunk, so your beautiful stream turns into:

```
The
capital
of
India
```

A ransom note. Don't ship a ransom note.

Also note there's **no `await`** on `streamText(...)` itself — you await the
*chunks*, not the call. Slap an `await` in front and TypeScript will get very
confused about what you want from it.

## Run it

```bash
bun run src/example/2-streamtext/main.ts
```

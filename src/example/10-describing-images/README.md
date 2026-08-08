# 10 — Describing images: the model has eyes now

Turns out you can just... hand it a PNG. It looks at it. Genuinely unsettling the
first time.

## What's in here

| File                 | Its job in life                                  |
| -------------------- | ------------------------------------------------ |
| `describe-images.ts` | Reads `public/background.png` and writes alt text |

> Heads up: the file is `describe-images.ts`, **not** `main.ts` like the others.
> Don't let your students copy-paste the wrong run command.

## How it works

The big idea: `content` stops being a string and becomes an **array of parts**.

```
   BEFORE (examples 1-9)          NOW (multimodal)
   ---------------------          ----------------
   content: "some text"           content: [
                                    { type: "image",
                                      image: <raw bytes> }
                                  ]
```

And the pipeline:

```
   background.png
        |
        | readFileSync  ("slurp the whole file into memory")
        v
   <a big pile of bytes>
        |
        | AI SDK base64-encodes it for you (thanks, AI SDK)
        v
   ┌──────────────────────────────┐
   │  MODEL, squinting            │
   │  "hmm. yes. I perceive       │
   │   a background. it is        │
   │   quite background-y."       │
   └──────────────────────────────┘
        |
        v
   "Abstract blue gradient with soft geometric shapes."
        ^ under 160 chars, because the system prompt said so
```

## Why alt text is the perfect demo

It's not a toy. Every image on the web is supposed to have alt text, nobody
writes it, and screen reader users pay the price. This example is 30 lines and
does something genuinely good. Lead with that when you teach it.

Note the constraints in the system prompt — `Be concise`, `Do not pass 160
characters`, `Use simple language`. Those are real alt-text best practices, not
arbitrary limits.

## The path gotcha

```ts
const imagePath = path.join(process.cwd(), 'public', imageName);
//                          ^^^^^^^^^^^^^ "where you ran the command from"
```

`process.cwd()` means **you must run this from the project root**. `cd` into the
example folder first and it'll fail to find the file. (Example 11 uses
`import.meta.dirname` instead, which doesn't care where you are — worth
comparing the two in class.)

## Swap in your own image

Drop any image into `public/` and change the last line:

```ts
const description = await describeImage('your-photo.jpg');
```

Try a photo of the classroom. Try a screenshot of a bug. Try a meme — the model
usually gets the joke, which reliably gets a reaction.

## Run it

```bash
bun run src/example/10-describing-images/describe-images.ts
```

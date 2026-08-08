# 1 — generateText: "Hello World", but it bills you

The simplest thing you can possibly do with an LLM. You ask a question, you wait,
you get a wall of text. That's it. That's the example.

## What's in here

| File      | Its job in life                                        |
| --------- | ------------------------------------------------------ |
| `main.ts` | Asks the capital of Karnataka. Spoiler: it's Bengaluru. |

## How it works

```
   YOU                    THE INTERNET                  A VERY EXPENSIVE
    |                                                    MATRIX MULTIPLY
    |  "capital of Karnataka?"                                 |
    |----------------------------->  [ OpenAI ]  ------------->|
    |                                                          |
    |                                              *thinking noises*
    |                                              *GPU fans spin up*
    |                                              *a tree somewhere sighs*
    |                                                          |
    |  <-------------------  "Bengaluru"  <--------------------|
    |
  (2 seconds of your life, gone)
```

The key word is **`await`**. Nothing appears until the model has finished the
*entire* answer. Ask for a 900-word essay and you will stare at a blank terminal
wondering if you broke it. You did not break it. It's just thinking.

That awkward silence is exactly the problem example **2** solves.

## Run it

```bash
bun run src/example/1-generate-text/main.ts
```

## The one thing to remember

`generateText` returns an object, and the text is hiding inside it:

```ts
const { text } = await generateText({ ... });
//      ^^^^ destructuring. Forget this and you'll console.log
//           a whole object and wonder where your answer went.
```

# 9 — Classifiers: multiple choice, and it can't cheat

Sometimes you don't want prose. You want **one word from a list you approve of**.
`z.enum()` turns a chatty philosopher into a scantron sheet.

## What's in here

| File               | Its job in life                                   |
| ------------------ | ------------------------------------------------- |
| `generate-enum.ts` | The enum schema + classifier function             |
| `main.ts`          | Feeds it "I am not sure how i feel"               |

## How it works

**Without an enum — the model waxes lyrical:**

```
   "I am not sure how i feel"
              |
              v
   "That's a really interesting and nuanced emotional
    state! It sounds like you might be experiencing
    some ambivalence, which is completely normal.
    I'd say this leans slightly neutral-to-negative,
    though context matters a great deal here..."
              |
              v
   your code: "...cool. how do I put THAT in a database column"
```

**With `z.enum(['positive','negative','neutral'])` — three doors, pick one:**

```
   "I am not sure how i feel"
              |
              v
      ┌───────────────────────┐
      │  🚪 positive          │
      │  🚪 negative          │
      │  🚪 neutral   <── ✅  │
      └───────────────────────┘
       no door #4. no essay.
       no "well, actually".
              |
              v
          "neutral"
```

One word. Every time. Straight into your database.

## Why the type is beautiful

```ts
const result = await classifySentiment("...");
//    ^? "positive" | "negative" | "neutral"
```

Not `string`. The **literal union**. So this is a compile error:

```ts
if (result === "positve") { }  // 💥 typo caught at build time
```

Your typos die before they reach production. Zod + TS is doing real work here.

## The test input is sneaky on purpose

`'I am not sure how i feel'` is deliberately wishy-washy — it's the case that
*should* land on `neutral`. Try swapping it for a few others in class:

```ts
'this is the best day of my life'      // easy positive
'my flight got cancelled again'        // easy negative
'the meeting is at 3pm'                // neutral, no emotion at all
'wow, great, another Monday'           // sarcasm. watch it struggle. 😈
```

That last one is the fun one. Sarcasm is genuinely hard and it makes a great
discussion about model limits.

## Where you'd really use this

Support ticket routing, spam detection, content moderation, "is this a refund
request or a complaint" — anything where the answer must be one of N known
buckets. This is one of the most *practically useful* examples in the whole repo.

## Run it

```bash
bun run src/example/9-building-a-classifier/main.ts
```

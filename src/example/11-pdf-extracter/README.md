# 11 — PDF extraction: the final boss

This is the one that makes people go "oh, *that's* what this is for."

Take examples 7 (schemas) and 10 (files), smash them together, and you've
automated a job that entire departments do by hand.

## What's in here

| File             | Its job in life                                |
| ---------------- | ---------------------------------------------- |
| `main.ts`        | Turns a PDF invoice into a typed object        |
| `invoice-1.pdf`  | A sacrificial invoice                          |

## How it works

```
   ┌───────────────────────────┐
   │  invoice-1.pdf            │
   │                           │
   │   ACME CORP        [logo] │
   │   ─────────────────────── │
   │   Invoice #: 2024-0042    │
   │   Bill to: Some Person    │
   │                           │
   │   Widgets ......  $400.00 │
   │   Tax ..........   $72.00 │
   │   TOTAL ........  $472.00 │
   └───────────┬───────────────┘
               │
               │  a human would squint at this
               │  for 90 seconds and typo the total
               v
      ┌─────────────────┐
      │  MODEL + SCHEMA │  "find me exactly these 6 fields"
      └────────┬────────┘
               v
   {
     total: 472,              <- a NUMBER. not "  $472.00 ". a number.
     currency: "USD",
     invoiceNumber: "2024-0042",
     companyName: "ACME CORP",
     companyAddress: "...",
     invoiceeAddress: "..."
   }
               |
               v
        straight into your database.
        no regex. no PDF parsing library.
        no crying.
```

## Why this is a big deal

Before LLMs, "extract the total from a PDF invoice" meant a PDF text-extraction
library, then regex, then special-casing every vendor's layout, then re-doing it
all when one vendor changed their template. It was a genuinely miserable, and
surprisingly common, engineering job.

Now it's a Zod schema and about 40 lines. That's the pitch. That's the whole
pitch.

## The detail worth pausing on

```ts
total: z.number().describe("The total amount of the invoice."),
//     ^^^^^^^^^ number, not string
```

The model reads `$472.00` off the page and hands you `472`. It does the parsing,
the currency-symbol stripping, and the type conversion — because the schema told
it what shape the answer had to be. The currency goes in its own field, where it
belongs.

## `type: 'file'`, not `type: 'image'`

```ts
{ type: 'file', data: readFileSync(invoicePath), mediaType: 'application/pdf' }
```

Different part type from example 10, and you must state the `mediaType`. Get it
wrong and the model receives gibberish.

## The path is done properly here

```ts
path.join(import.meta.dirname, './invoice-1.pdf')
```

Unlike example 10's `process.cwd()`, `import.meta.dirname` means "the folder this
file lives in" — so it works no matter where you run it from. This is the better
habit. Point that out.

## Run it

```bash
bun run src/example/11-pdf-extracter/main.ts
```

## Homework that actually lands

Have students drop in a *real* receipt or invoice of their own and watch it work
on a document nobody prepared in advance. Then ask: what happens with a
handwritten receipt? A blurry photo? A bill in Kannada? Two pages?

That's where the good discussion is — this stuff is powerful, but it is not
magic, and finding the edges is the lesson.

/**
 * JARVIS knowledge base.
 *
 * This is the "R" in RAG — the corpus we retrieve from. In a production app
 * these would live in a vector database (pgvector, Pinecone, Turbopuffer...).
 * Here they're a plain array, because the retrieval concept is identical and
 * an array is much easier to read in a classroom.
 *
 * The corpus is the course itself: JARVIS knows every example in `src/example`.
 * Ask it "how do I stream?" and it retrieves example 2 and answers from it.
 */

export type KnowledgeDoc = {
    id: string;
    title: string;
    /** Where the student can go read the real thing. */
    path: string;
    /** Short tag shown on the source chip in the UI. */
    section: string;
    text: string;
};

export const knowledgeBase: KnowledgeDoc[] = [
    {
        id: "ex-1",
        title: "Generating text",
        path: "src/example/1-generate-text/main.ts",
        section: "Basics",
        text: `generateText is the simplest AI SDK call. You pass a model and a prompt, you await it, and you get the complete text back in one piece. It returns an object, so you destructure the text out of it: const { text } = await generateText({ model, prompt }). Because it waits for the entire response before returning, the user stares at a blank screen while the model works. That latency problem is what streaming solves. Use generateText when you need the whole answer before doing anything with it, such as in a background job or a server-side transform.`,
    },
    {
        id: "ex-2",
        title: "Streaming text",
        path: "src/example/2-streamtext/main.ts",
        section: "Basics",
        text: `streamText returns immediately with a result object containing a textStream async iterable. You loop with "for await (const chunk of result.textStream)" and write each chunk to the output. Do not await streamText itself; you await the chunks. Use process.stdout.write rather than console.log, because console.log appends a newline after every chunk and shreds the output. The total time to finish is the same as generateText, but the perceived latency is dramatically lower because the user starts reading immediately. This is the single highest-impact UX change in any LLM app.`,
    },
    {
        id: "ex-3",
        title: "Dynamic model selection",
        path: "src/example/3-dynamic-model-selection/main.ts",
        section: "Architecture",
        text: `Rather than hardcoding a model inside a function, accept it as a parameter typed as LanguageModel, imported from the ai package. This lets one function serve every model. The practical wins are routing cheap models to easy tasks and expensive models to hard ones, falling back to a second provider when the primary is down, and injecting a fake model during tests so CI does not cost money. Model routing is the foundation of cost control in production LLM apps.`,
    },
    {
        id: "ex-4",
        title: "System prompts",
        path: "src/example/4-system-prompt/main.ts",
        section: "Prompting",
        text: `The system parameter sets the model's persona, rules and constraints. It is separate from prompt, which carries the user's actual content. Internally the system prompt becomes a message with role "system" placed before the user message. Never concatenate instructions onto the user's text, because the model then cannot tell rules from content. System prompts tend to grow oddly specific over time, with lines like "do not say Here is your summary", because each line is a fix for a previous annoying output. Keeping instructions and content in separate fields is what makes the behaviour reliable.`,
    },
    {
        id: "ex-5",
        title: "Chat history and memory",
        path: "src/example/5-maintain-chat-history/main.ts",
        section: "Architecture",
        text: `Language models are stateless and have no memory between requests. Every call starts from nothing. Conversation memory is an illusion created by resending the entire message array on every request. You append the assistant's reply to your array and send the whole thing again next turn. The AI SDK returns result.responseMessages already shaped as messages, ready to append. Because every turn resends all prior turns, token cost grows quadratically with conversation length, which is why production apps eventually truncate old messages or summarise them into a compact digest.`,
    },
    {
        id: "ex-6",
        title: "Local models with LM Studio",
        path: "src/example/6-running-local-models/main.ts",
        section: "Local models",
        text: `LM Studio exposes an OpenAI-compatible HTTP server, by default on port 1234. You connect with createOpenAICompatible from @ai-sdk/openai-compatible, setting baseURL to http://localhost:1234/v1. No API key is required because the server is on your own machine. Pass an empty string as the model id, since LM Studio serves whichever model you loaded in its GUI. Set maxRetries to 0, because retrying a connection-refused error against your own machine never helps and only delays the real error message. You must start the server from LM Studio's Developer tab first.`,
    },
    {
        id: "ex-7",
        title: "Structured outputs with Zod",
        path: "src/example/7-structured-outputs/structured-output.ts",
        section: "Structured data",
        text: `generateObject forces the model to return data matching a Zod schema, instead of prose you have to parse. It eliminates the entire class of bugs where the model wraps JSON in markdown fences or prefixes it with "Certainly! Here is your JSON". Chaining .describe() onto each schema field is important: those descriptions are sent to the model as field documentation, so vague descriptions produce vague results. Because Zod knows the shape, TypeScript infers the return type automatically, giving you full autocomplete and no casting.`,
    },
    {
        id: "ex-8",
        title: "Streaming structured outputs",
        path: "src/example/8-streaming-structured-outputs/structured-output.ts",
        section: "Structured data",
        text: `streamObject combines schemas with streaming. It exposes partialObjectStream, which yields the object repeatedly as it is progressively built. The critical caveat is that partial objects are genuinely partial: fields may be missing or half-written, so you must use optional chaining on everything inside the loop. TypeScript types these partials as deeply optional, which is accurate rather than pessimistic. Await result.object at the end for the guaranteed-complete, fully typed value. This is what powers UIs where a form or table fills itself in field by field.`,
    },
    {
        id: "ex-9",
        title: "Classification with enums",
        path: "src/example/9-building-a-classifier/generate-enum.ts",
        section: "Structured data",
        text: `Using z.enum(["positive","negative","neutral"]) inside generateObject turns the model into a classifier that can only answer with one of your approved labels. It cannot write an essay, hedge, or invent a fourth category. The return type is a literal union rather than string, so a typo in a comparison becomes a compile-time error. This is one of the most practically useful patterns in the whole SDK, powering support ticket routing, spam detection, content moderation and intent detection. Sarcasm remains genuinely difficult for classifiers and makes a good demonstration of model limits.`,
    },
    {
        id: "ex-10",
        title: "Describing images",
        path: "src/example/10-describing-images/describe-images.ts",
        section: "Multimodal",
        text: `To send an image, the message content stops being a string and becomes an array of parts. You include a part of type "image" whose image field holds the raw file bytes from readFileSync. The AI SDK base64-encodes it for you. A great practical use is generating alt text for accessibility, constrained by a system prompt to stay under 160 characters and use simple language. Note this example builds its path with process.cwd(), which means it must be run from the project root or it will not find the file.`,
    },
    {
        id: "ex-11",
        title: "Extracting data from PDFs",
        path: "src/example/11-pdf-extracter/main.ts",
        section: "Multimodal",
        text: `Combining generateObject with a file part extracts structured data from documents. The content part uses type "file", with data holding the bytes and mediaType set to application/pdf. A Zod schema names the fields you want from an invoice, such as total, currency, invoiceNumber and company addresses. Typing total as z.number() makes the model strip the currency symbol and return a real number. This replaces the traditional misery of PDF text extraction plus regex plus per-vendor special cases. This example builds its path with import.meta.dirname, which works regardless of the current working directory and is the better habit.`,
    },
    {
        id: "ex-12",
        title: "Tool calling",
        path: "src/example/12-tool-call/main.ts",
        section: "Agents",
        text: `Tool calling lets a model request actions instead of only producing words. You define tools with the tool() helper, giving each a description, an inputSchema written in Zod, and an execute function. The model never runs anything itself; it emits a request to call a tool, your code executes it, and the result is fed back so the model can continue. The description field is how the model decides whether a tool is relevant, so vague descriptions cause tools to be ignored or misused. Use stopWhen with stepCountIs to bound multi-step loops. In AI SDK version 5 and later the schema key is inputSchema; the older name parameters is from version 4 and no longer works.`,
    },
    {
        id: "ex-13",
        title: "Local models with Ollama",
        path: "src/example/13-local-llm-ollama/main.ts",
        section: "Local models",
        text: `Ollama serves an OpenAI-compatible API at http://localhost:11434/v1 alongside its own native API, so no Ollama-specific package is needed. You connect with createOpenAICompatible and pass the name of a model you have pulled, such as llama3.2. Install with winget install Ollama.Ollama, pull a model with "ollama pull llama3.2", and verify the server with "ollama list". Running locally means no API key, no per-token cost and no prompts leaving your machine, at the price of speed. The most common error, "Cannot connect to API", simply means the Ollama server is not running.`,
    },
    {
        id: "concept-rag",
        title: "How RAG works",
        path: "src/lib/jarvis/retrieval.ts",
        section: "Concepts",
        text: `Retrieval Augmented Generation fixes the fact that a model only knows its training data and will confidently invent answers about anything else. Instead of fine-tuning, you retrieve relevant documents at question time and paste them into the prompt as context. The pipeline is: embed every document once into vectors, embed the incoming question, compare with cosine similarity, take the top matches, and inject them into the system prompt with an instruction to answer only from that context and to cite sources. The AI SDK provides embedMany, embed and cosineSimilarity, so no external vector database is required for small corpora.`,
    },
    {
        id: "concept-agent",
        title: "What makes something an agent",
        path: "src/app/api/jarvis/route.ts",
        section: "Concepts",
        text: `An agent is a model in a loop with tools and a goal. The difference from a chatbot is that an agent can take actions, observe the results, and decide what to do next, repeating until the task is done. The loop is: model receives context, model requests a tool, your code executes it, the result returns to the model, and the model either requests another tool or answers. Guardrails matter, because the model decides and your code executes. Bound the loop with a step limit, and never wire a model directly to a destructive operation without an approval step.`,
    },
];


import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { once } from "node:events";
import { generateText, ModelMessage } from "ai";

const model = "openai/gpt-4o-mini";

export const startServer = async () => {
    const app = new Hono();

    app.post("/api/get-completions", async (ctx) => {
        const messages: ModelMessage[] = await ctx.req.json();

        const result = await generateText({
            model,
            messages
        })

        return ctx.json(result.responseMessages);
    });

    const server = serve({
        fetch: app.fetch,
        port: 4371,
        hostname: "0.0.0.0",
    });

    await once(server, "listening");
    return server;
};
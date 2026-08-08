import { generateText } from "ai";

export const summarizeText = async (input: string) => {
    const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: input,
        system:
            `You are a helpful assistant that summarizes text.` +
            `Summarize the text you receive` +
            `Return only the summary, do not include any other text in your response.` +
            `Do not use the phrase "Here is your summary" or any similar phrase in your response.` +
            `The summary needs to be just two sentences long, and it should be concise and to the point.`
    });

    return text
}

// System prompt is used to set the behavior of the model. In this case, we are telling the model that it is a helpful assistant that summarizes text. We are also telling the model to return only the summary, and not to include any other text in its response. We are also telling the model to make the summary just two sentences long, and to be concise and to the point.const answer = await ask(prompt, model);
const answer = await summarizeText(`AI SDK for Python is now in beta. Learn more.

Universal AI layer for building frameworks and agents
A unified TypeScript SDK for building AI apps with modern streaming, fallbacks, and multi-model support—powered by Vercel

For humans
For agents
$
npm install ai

Text Generation
Image Generation
Speech
Transcription
Video Generation



Run it with

AI Gateway

import { generateText } from 'ai';

const { text } = await generateText({
  model: "mistral/mistral-large-3",
  prompt: 'Explain the concept of quantum entanglement.',
});

console.log(text);
Explain quantum entanglement in simple terms.
When two particles are entangled, they share a quantum state. A measurement on one particle instantaneously constrains the possible outcomes for the other, regardless of separation distance.
See all supported LLM models

20.3M
Weekly downloads
26K
GitHub stars
685+
Contributors
100+
Models supported
The Framework Agnostic AI Toolkit
The open-source AI toolkit designed to help developers build AI-powered applications and agents with React, Next.js, Vue, Svelte, Node.js, and more.

Multi-provider support. Switch providers with one line of code.
Streaming that just works. Real-time responses without custom parsing.
Built-in fallbacks.
Reliable production behavior by default.
generate-text.ts
Run it with

AI Gateway

import { generateText } from 'ai';

const { text } = await generateText({
  model: "openai/gpt-5.5",
  prompt: 'Explain the concept of quantum entanglement.',
});

console.log(text);
Text Generation
Speech
Transcription
Image Generation
Video Generation
Tool Calling
Error Handling
DevTools

AI SDK Core

A unified API for generating text, structured objects, tool calls, and building agents with LLMs.


AI SDK UI

A set of framework-agnostic hooks for quickly building chat and generative user interface.

Supports





+ 16 providers
Scale with confidence
Plug the AI SDK into an entire ecosystem designed for the way modern AI applications that scale.

Vercel AI Gateway

Access 100+ models with no markup or having to manage multiple API keys.

npm i ai
Vercel Sandbox

Run agent generated code securely and at scale.

npm i @vercel/sandbox
Workflows
NEW

Build long running AI agents and apps that can suspend, resume, and survive function timeouts.

npm i workflow
AI Elements

A UI component library and custom registry built to build AI-native applications faster.

npx ai-elements
We built a full AI agent with 40+ tools, resumable streams, and multi-step reasoning on AI SDK. Every hard problem we'd solved with duct tape before, streaming, tool call repair, message management, tool based UI, they already had a clean API for. It feels like their team hit every wall we did, just before us.
Adir Duchan
Senior AI Engineer
OpenCode uses AI SDK.
Dax Raad
CEO & Founder
Build with ourAiSdktoday
Get started with the AI SDK by using our recipes or templates.

npm i ai
Chatbot Starter Template

Learn how to build a full-featured AI chatbot with persistence, multi-modal chat, and more.

Copy install prompt
Build a Slackbot Agent

Learn how to build a Slackbot that responds to direct messages and mentions in channels.

Copy install prompt
Build a SQL Agent

Learn how to build an app that interacts with a PostgreSQL database using natural language.

Copy install prompt
Get Started
Templates
Supported frameworks
Marketplace
Domains
Build
Next.js on Vercel
Turborepo
v0
Scale
Content delivery network
Fluid compute
CI/CD
Observability
AI Gateway
New
Vercel Agent
New
Secure
Platform security
Web Application Firewall
Bot management
BotID
Sandbox
New
Resources
Pricing
Customers
Enterprise
Articles
Startups
Solution partners
Learn
Docs
Blog
Changelog
Knowledge Base
Academy
Community
Frameworks
Next.js
Nuxt
Svelte
Nitro
Turbo
eve
SDKs
AI SDK
Workflow DevKit
New
Flags SDK
Chat SDK
Streamdown AI
New
Use Cases
Composable commerce
Multi-tenant platforms
Web apps
Marketing sites
Platform engineers
Design engineers
Company
About
Careers
Help
Press
Legal
Privacy Policy
Community
Open source program
Events
Shipped `);

// Output
console.log(answer);


// const input:string = "Hey there"


// [{
//     role:"system",
//     content:'You are a helpful assistant that summarizes text. Summarize the text you receive. Return only the summary, do not include any other text in your response. Do not use the phrase "Here is your summary" or any similar phrase in your response. The summary needs to be just two sentences long, and it should be concise and to the point.'
// },
// {
//     role:"user"
//     content: input,
// }]
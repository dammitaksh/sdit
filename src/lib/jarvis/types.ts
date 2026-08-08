/**
 * The contract between the JARVIS route and the JARVIS UI.
 *
 * Beyond text and tool calls, the agent streams its own custom "data parts" so
 * the UI can show what it's thinking: the triage result, the retrieved sources,
 * and the current pipeline stage.
 *
 * Declaring them here once means `writer.write(...)` on the server and
 * `part.data` on the client are checked against the same types. Typo a field
 * and the build fails instead of the UI silently rendering nothing.
 */

import type { UIMessage } from "ai";
import type { InferUITools } from "ai";
import type { jarvisTools } from "./tools";

/** Example 9's classifier, applied to the incoming question. */
export type TriageData = {
    intent: "course-question" | "task" | "smalltalk" | "off-topic";
    complexity: "simple" | "complex";
    topic: string;
};

/** What RAG retrieved, with similarity scores, for citation in the UI. */
export type SourcesData = {
    docs: {
        id: string;
        title: string;
        path: string;
        section: string;
        score: number;
    }[];
};

/** Which step of the pipeline is currently running. */
export type StageData = {
    label: string;
    state: "active" | "done";
};

export type JarvisDataParts = {
    triage: TriageData;
    sources: SourcesData;
    stage: StageData;
};

/**
 * The fully-typed message. `InferUITools` derives the tool part types straight
 * from the tool definitions, so `tool-analyzeSentiment` knows its own
 * input and output shapes with no manual typing.
 */
export type JarvisMessage = UIMessage<
    unknown,
    JarvisDataParts,
    InferUITools<typeof jarvisTools>
>;

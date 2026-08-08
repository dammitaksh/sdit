/**
 * The retrieval half of RAG — real embeddings, no vector database.
 *
 * Pipeline:
 *   1. Embed every knowledge-base doc once, then cache it (embedMany).
 *   2. Embed the user's question (embed).
 *   3. Score every doc by cosine similarity against the question.
 *   4. Return the best few.
 *
 * This is genuinely how RAG works. A production system swaps step 1 for a
 * vector database so the vectors survive a restart and scale past a few
 * hundred documents — but the shape of the algorithm is exactly this.
 */

import { openai } from "@ai-sdk/openai";
import { cosineSimilarity, embed, embedMany } from "ai";
import { knowledgeBase, type KnowledgeDoc } from "./knowledge-base";

const embeddingModel = openai.textEmbeddingModel("text-embedding-3-small");

export type RetrievedDoc = KnowledgeDoc & { score: number };

/**
 * Embedding the whole corpus costs one API call, so we do it once and keep the
 * vectors in module scope. In dev this survives between requests but not
 * between server restarts — which is exactly the limitation a real vector
 * database exists to solve.
 */
let cachedVectors: number[][] | null = null;
let inFlight: Promise<number[][]> | null = null;

async function getCorpusVectors(): Promise<number[][]> {
    if (cachedVectors) return cachedVectors;

    // If two requests arrive together, only embed once and let both await it.
    if (!inFlight) {
        inFlight = embedMany({
            model: embeddingModel,
            values: knowledgeBase.map((doc) => `${doc.title}\n\n${doc.text}`),
        }).then(({ embeddings }) => {
            cachedVectors = embeddings;
            return embeddings;
        });
    }

    return inFlight;
}

/**
 * Find the documents most relevant to a question.
 *
 * `minScore` filters out weak matches so an off-topic question retrieves
 * nothing rather than dragging in the least-irrelevant doc. Cosine similarity
 * on this embedding model puts genuinely related text around 0.3+.
 */
export async function retrieve(
    query: string,
    { topK = 3, minScore = 0.25 }: { topK?: number; minScore?: number } = {}
): Promise<RetrievedDoc[]> {
    if (!query.trim()) return [];

    const [corpusVectors, { embedding: queryVector }] = await Promise.all([
        getCorpusVectors(),
        embed({ model: embeddingModel, value: query }),
    ]);

    return knowledgeBase
        .map((doc, i) => ({
            ...doc,
            score: cosineSimilarity(queryVector, corpusVectors[i]),
        }))
        .filter((doc) => doc.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}

/** Format retrieved docs for injection into the system prompt. */
export function buildContext(docs: RetrievedDoc[]): string {
    if (docs.length === 0) {
        return "No relevant documents were retrieved for this question.";
    }

    return docs
        .map(
            (doc) =>
                `<document id="${doc.id}" title="${doc.title}" path="${doc.path}">\n${doc.text}\n</document>`
        )
        .join("\n\n");
}

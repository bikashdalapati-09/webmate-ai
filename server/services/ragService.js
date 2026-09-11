import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION_NAME = "webmate_documents";

// Initialize Qdrant Client for index operations
const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY || "",
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'gemini-embedding-2',
  apiKey: process.env.GEMINI_API_KEY,
});

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.3,
});

export async function askRagAssistant({ message, userId, businessName, tone = "professional" }) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // 1. Connect to Qdrant VectorStore
    let vectorStore;
    try {
      // Ensure the userId payload index exists before performing filtered search
      try {
        await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
          field_name: "userId",
          field_schema: "keyword",
        });
      } catch (e) {
        // Safe to ignore if index already exists
      }

      vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY || "",
        collectionName: COLLECTION_NAME,
      });
    } catch (qdrantError) {
      console.warn("Qdrant unavailable, falling back to standard AI response", qdrantError.message);
      const systemPrompt = `You are ${businessName}'s assistant. Tone: ${tone}. Keep responses under 25 words.`;
      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(message),
      ]);
      return response.content;
    }

    // 2. Retrieve relevant chunks (filtered by userId)
    const retriever = vectorStore.asRetriever({
      k: 3,
      filter: {
        must: [{ key: "userId", match: { value: userId } }],
      },
    });

    const docs = await retriever.invoke(message);
    const context = docs.map((d) => d.pageContent).join("\n\n") || "No context found.";

    // 3. Prompt execution pipeline
    const promptTemplate = PromptTemplate.fromTemplate(`You represent {businessName}. Tone: {tone}.
Answer using ONLY this context. Keep under 25 words.

[CONTEXT]
{context}

[QUESTION]
{message}`);

    const chain = RunnableSequence.from([promptTemplate, llm, new StringOutputParser()]);

    return await chain.invoke({
      businessName: businessName || "the business",
      tone,
      context,
      message,
    });
  } catch (error) {
    console.error("RAG Assistant Error:", error);
    throw error;
  }
}
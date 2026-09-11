import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { DynamicTool } from "@langchain/core/tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION_NAME = "webmate_documents";

const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY || "",
});

const State = Annotation.Root({
  query: Annotation(),
  apiKey: Annotation(),
  user: Annotation(),
  response: Annotation(),
});

async function ensurePayloadIndex() {
  try {
    // Ensure index on both possible metadata key paths
    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: "userId",
      field_schema: "keyword",
    });
    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: "metadata.userId",
      field_schema: "keyword",
    });
  } catch (err) {
    // Indexes already exist or handled automatically
  }
}

const aiNode = async (state) => {
  const { user, apiKey: inputApiKey, query } = state;

  try {
    const resolvedApiKey = String(
      (inputApiKey && String(inputApiKey).trim()) ||
      (user?.geminiApiKey && String(user.geminiApiKey).trim()) ||
      (process.env.GEMINI_API_KEY && String(process.env.GEMINI_API_KEY).trim()) ||
      ""
    ).trim();

    console.log(`\n=================== [AI QUERY START] ===================`);
    console.log(`🔑 [AI NODE DEBUG] API Key Present: ${Boolean(resolvedApiKey)} | Length: ${resolvedApiKey.length}`);
    console.log(`💬 [USER QUERY]: "${query}"`);

    if (!resolvedApiKey) {
      throw new Error("Gemini API Key is completely missing or empty.");
    }

    process.env.GEMINI_API_KEY = resolvedApiKey;
    process.env.GOOGLE_API_KEY = resolvedApiKey;

    // 1. DYNAMIC RAG TOOL
    const pdfSearchTool = new DynamicTool({
      name: "search_uploaded_pdf_documents",
      description: "MANDATORY: You MUST call this tool to search internal business documents, FAQs, policies, uploaded files, and company details before attempting to answer any user query.",
      func: async (searchQuery) => {
        console.log(`\n---------------- [TOOL EXECUTION STARTED] ----------------`);
        console.log(`🛠️ [RAG TOOL] Execution started for search term: "${searchQuery}"`);

        try {
          await ensurePayloadIndex();

          console.log(`🧠 [EMBEDDINGS DEBUG] Initializing embeddings model: gemini-embedding-2`);
          const embeddings = new GoogleGenerativeAIEmbeddings({
            modelName: "gemini-embedding-2",
            apiKey: resolvedApiKey,
          });

          const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY || "",
            collectionName: COLLECTION_NAME,
          });

          const userIdStr = String(user?._id || user?.id || "");
          console.log(`🔍 [RAG SEARCH] Querying Qdrant Collection: "${COLLECTION_NAME}" | userId: "${userIdStr}"`);

          // FIX: Query both key paths to handle flat or nested metadata schema
          const retriever = vectorStore.asRetriever({
            k: 4,
            filter: {
              should: [
                { key: "userId", match: { value: userIdStr } },
                { key: "metadata.userId", match: { value: userIdStr } }
              ],
            },
          });

          const retrievedDocs = await retriever.invoke(searchQuery);
          console.log(`📄 [RAG SEARCH RESULT] Found ${retrievedDocs?.length || 0} chunk(s) in Qdrant.`);

          if (!retrievedDocs || retrievedDocs.length === 0) {
            console.log(`⚠️ [RAG SEARCH RESULT] No matching document chunks found.`);
            console.log(`---------------- [TOOL EXECUTION FINISHED] ----------------\n`);
            return "NO MATCHING DOCUMENTS FOUND IN VECTOR STORE.";
          }

          const contextText = retrievedDocs.map((doc, idx) => `[Chunk ${idx + 1}]:\n${doc.pageContent}`).join("\n\n");

          console.log(`📊 [RAG RETRIEVAL SUMMARY] Total context size: ${contextText.length} characters.`);
          console.log(`📖 [RAG CONTEXT SAMPLE]:\n"${contextText.substring(0, 150)}..."`);
          console.log(`---------------- [TOOL EXECUTION FINISHED] ----------------\n`);

          return contextText;
        } catch (qdrantError) {
          console.error("❌ [RAG TOOL ERROR] Failed during vector search:", qdrantError?.message || qdrantError);
          console.log(`---------------- [TOOL EXECUTION FAILED] ----------------\n`);
          return "ERROR QUERYING VECTOR DATABASE.";
        }
      },
    });

    console.log(`🤖 [LLM INIT] Instantiating ChatGoogleGenerativeAI (gemini-3.5-flash-lite) with RAG tool bound...`);

    const llm = new ChatGoogleGenerativeAI({
      apiKey: resolvedApiKey,
      model: "gemini-3.5-flash-lite",
      modelName: "gemini-3.5-flash-lite",
      temperature: 0.1,
    }).bindTools([pdfSearchTool]);

    const systemPrompt = `
You are an AI Assistant named "${user?.assistantName || "Assistant"}".
Business Name: "${user?.businessName || "N/A"}"
Business Type: "${user?.businessType || "N/A"}"
Business Description: "${user?.businessDescription || "N/A"}"
Assistant Tone: "${user?.tone || "Friendly"}"

CRITICAL INSTRUCTIONS:
1. You MUST ALWAYS call the 'search_uploaded_pdf_documents' tool BEFORE answering the user's question to retrieve knowledge from their uploaded PDF files.
2. DO NOT answer from your prior training memory or general knowledge if the question can be answered using business documents.
3. Base your final response strictly on the retrieved document context.
`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(query),
    ];

    console.log(`🚀 [LLM CALL] Invoking model to decide tool execution...`);
    const initialAiResponse = await llm.invoke(messages);

    if (initialAiResponse?.tool_calls && initialAiResponse.tool_calls.length > 0) {
      const targetToolCall = initialAiResponse.tool_calls[0];

      console.log(`\n🎯 [TOOL CALL DECISION] SUCCESS! Gemini decided to call tool:`);
      console.log(`   └─ Tool Name: "${targetToolCall.name}"`);
      console.log(`   └─ Tool Arguments:`, JSON.stringify(targetToolCall.args));

      const rawArgs = targetToolCall.args?.input || targetToolCall.args?.query || query;
      const retrievedContext = await pdfSearchTool.invoke(rawArgs);

      const synthesisMessages = [
        ...messages,
        initialAiResponse,
        new HumanMessage(
          `DOCUMENT SEARCH RESULTS:\n${retrievedContext}\n\nINSTRUCTION: Synthesize a direct, friendly answer for the user based strictly on the search results above. If the document states no information, mention that politely.`
        ),
      ];

      console.log(`🔄 [LLM RESUBMISSION] Sending retrieved context back to Gemini for final response synthesis...`);
      const finalAiResponse = await llm.invoke(synthesisMessages);

      console.log(`=================== [AI QUERY END] ===================\n`);
      return {
        response: finalAiResponse?.content || null,
      };
    }

    console.log(`\n❌ [TOOL CALL DECISION] NO TOOL CALLED BY GEMINI!`);
    console.log(`⚠️ Gemini attempted to answer using internal knowledge. Executing fallback tool search...`);

    const fallbackContext = await pdfSearchTool.invoke(query);
    if (fallbackContext && !fallbackContext.includes("NO MATCHING DOCUMENTS FOUND")) {
      console.log(`🔄 [FALLBACK EXECUTION] Forcing Gemini to use retrieved fallback context...`);
      const fallbackMessages = [
        ...messages,
        new HumanMessage(
          `RETRIEVED KNOWLEDGE CONTEXT:\n${fallbackContext}\n\nAnswer the user query: "${query}" using only the retrieved context above.`
        ),
      ];
      const forcedAiResponse = await llm.invoke(fallbackMessages);

      console.log(`=================== [AI QUERY END] ===================\n`);
      return { response: forcedAiResponse?.content || null };
    }

    console.log(`=================== [AI QUERY END] ===================\n`);
    return {
      response: initialAiResponse?.content || null,
    };

  } catch (nodeError) {
    console.error("❌ [AI NODE ERROR]:", nodeError?.stack || nodeError?.message || nodeError);
    throw nodeError;
  }
};

const graph = new StateGraph(State)
  .addNode("ai", aiNode)
  .addEdge(START, "ai")
  .addEdge("ai", END)
  .compile();

export const aiService = async ({ query, user, apiKey }) => {
  const resolvedApiKey = String(
    (apiKey && String(apiKey).trim()) ||
    (user?.geminiApiKey && String(user.geminiApiKey).trim()) ||
    (process.env.GEMINI_API_KEY && String(process.env.GEMINI_API_KEY).trim()) ||
    ""
  ).trim();

  if (!resolvedApiKey) {
    if (user && typeof user.save === "function") {
      user.geminiStatus = "invalid";
      await user.save().catch((err) => console.error("Error saving user status:", err));
    }

    return {
      success: false,
      status: 401,
      error: "Gemini API key is required.",
    };
  }

  try {
    const result = await graph.invoke({
      query,
      apiKey: resolvedApiKey,
      user,
    });

    if (!result?.response) {
      if (user && typeof user.save === "function") {
        user.geminiStatus = "invalid";
        await user.save().catch((err) => console.error("Error saving user status:", err));
      }

      return {
        success: false,
        status: 400,
        error: "Invalid API key or Gemini did not return a response.",
      };
    }

    if (user && typeof user.save === "function") {
      user.geminiStatus = "active";
      await user.save().catch((err) => console.error("Error saving user status:", err));
    }

    return {
      success: true,
      status: 200,
      response: result.response,
    };
  } catch (error) {
    console.error("❌ [SERVICE ERROR] Gemini Service Error:", error?.message || error);

    let status = 500;
    let errorMessage = "Gemini request failed.";

    if (error?.message?.includes("API key") || 
        error?.message?.includes("authentication") ||
        error?.message?.includes("401") ||
        error?.message?.includes("403")) {
      status = 401;
      errorMessage = "Invalid Gemini API key. Please check your key and try again.";
      if (user && typeof user.save === "function") user.geminiStatus = "invalid";
    } 
    else if (error?.message?.includes("429") || error?.message?.includes("quota")) {
      status = 429;
      errorMessage = "Gemini quota exceeded. Please try again later.";
      if (user && typeof user.save === "function") user.geminiStatus = "quota_exceed";
    }
    else {
      status = error?.status || error?.statusCode || 500;
      if (status === 401 || status === 403) {
        errorMessage = "Invalid Gemini API key. Please check your key and try again.";
        if (user && typeof user.save === "function") user.geminiStatus = "invalid";
      }
    }

    if (user && typeof user.save === "function") {
      await user.save().catch((saveError) => console.error("Error saving user status:", saveError));
    }

    return {
      success: false,
      status,
      error: errorMessage,
    };
  }
};
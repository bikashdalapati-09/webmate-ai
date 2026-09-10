import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const State = Annotation.Root({
  query: Annotation(),
  apiKey: Annotation(),
  user: Annotation(),
  response: Annotation(),
});

const aiNode = async (state) => {
  const { user, apiKey, query } = state;
  console.log(apiKey)

  const llm = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: "gemini-3.5-flash-lite", // Retained original model name
    temperature: 0.3,
  });

  const systemPrompt = `
You are ${user.assistantName || "Assistant"}.

Business Name: ${user.businessName || "N/A"}
Business Type: ${user.businessType || "N/A"}
Business Description: ${user.businessDescription || "N/A"}
Assistant Tone: ${user.tone || "Friendly"}

Rules:
- Keep replies under 15 words
- Give fast, direct responses
- Talk naturally
- Behave like a smart voice assistant
- Avoid long explanations
- Keep responses short for quick voice playback
`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(query),
  ];

  const response = await llm.invoke(messages);

  return {
    response: response?.content || null,
  };
};

const graph = new StateGraph(State)
  .addNode("ai", aiNode)
  .addEdge(START, "ai")
  .addEdge("ai", END)
  .compile();

export const aiService = async ({ query, user, apiKey }) => {
  if (!apiKey) {
    user.geminiStatus = "invalid";
    await user.save();

    return {
      success: false,
      status: 401,
      error: "Gemini API key is required.",
    };
  }

  try {
    const result = await graph.invoke({
      query,
      apiKey,
      user,
    });

    if (!result?.response) {
      return {
        success: false,
        status: 500,
        error: "Gemini did not return a response.",
      };
    }

    user.geminiStatus = "active";
    await user.save();

    return {
      success: true,
      status: 200,
      response: result.response,
    };
  } catch (error) {
    console.error("Gemini Service Error:", error);

    const status =
      error?.status ||
      error?.statusCode ||
      error?.response?.status ||
      500;

    if (status === 429) {
      user.geminiStatus = "quota_exceed";
      await user.save();

      return {
        success: false,
        status: 429,
        error: "Gemini quota exceeded.",
      };
    }

    if (status === 401 || status === 403) {
      user.geminiStatus = "invalid";
      await user.save();

      return {
        success: false,
        status,
        error: "Invalid Gemini API key.",
      };
    }

    return {
      success: false,
      status,
      error: "Gemini request failed.",
    };
  }
};
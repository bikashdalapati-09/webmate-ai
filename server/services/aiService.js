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
  
  try {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Invalid API key provided");
    }

    const llm = new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: "gemini-3.5-flash-lite",
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
  } catch (nodeError) {
    console.error("AI Node Error:", nodeError);
    throw nodeError;
  }
};

const graph = new StateGraph(State)
  .addNode("ai", aiNode)
  .addEdge(START, "ai")
  .addEdge("ai", END)
  .compile();

export const aiService = async ({ query, user, apiKey }) => {
  if (!apiKey || apiKey.trim() === '') {
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
      user.geminiStatus = "invalid";
      await user.save();
      
      return {
        success: false,
        status: 400,
        error: "Invalid API key or Gemini did not return a response.",
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
    console.error("Gemini Service Error:", error?.message || error);

    // Handle various error types
    let status = 500;
    let errorMessage = "Gemini request failed.";

    // Check for API key errors
    if (error?.message?.includes("API key") || 
        error?.message?.includes("authentication") ||
        error?.message?.includes("401") ||
        error?.message?.includes("403")) {
      status = 401;
      errorMessage = "Invalid Gemini API key. Please check your key and try again.";
      user.geminiStatus = "invalid";
    } 
    // Check for quota errors
    else if (error?.message?.includes("429") || 
             error?.message?.includes("quota")) {
      status = 429;
      errorMessage = "Gemini quota exceeded. Please try again later.";
      user.geminiStatus = "quota_exceed";
    }
    // Check for rate limit errors
    else if (error?.message?.includes("rate limit")) {
      status = 429;
      errorMessage = "Too many requests. Please try again in a moment.";
      user.geminiStatus = "quota_exceed";
    }
    // Default invalid key error
    else {
      status = error?.status || error?.statusCode || error?.response?.status || 500;
      
      if (status === 401 || status === 403) {
        errorMessage = "Invalid Gemini API key. Please check your key and try again.";
        user.geminiStatus = "invalid";
      }
    }

    try {
      await user.save();
    } catch (saveError) {
      console.error("Error saving user status:", saveError);
    }

    return {
      success: false,
      status,
      error: errorMessage,
    };
  }
};
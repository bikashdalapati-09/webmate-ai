import "dotenv/config";

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.7,
});

export const aiProjectResponse = async (query) => {

    if (!query || typeof query !== "string" || !query.trim()) {
        throw new Error("query is empty");
    }

    const messages = [
        new SystemMessage("You are a helpful AI assistant."),
        new HumanMessage(query),
    ];

    const response = await llm.invoke(messages);

    return response.content;
};
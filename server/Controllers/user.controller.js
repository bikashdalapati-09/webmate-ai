import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../Models/user.model.js";
import { aiProjectResponse } from "../services/aiProject.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Failed to get current user",
      });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to retrieve user",
    });
  }
};

export const saveAssistant = async (req, res) => {
  try {
    const {
      assistantName,
      businessName,
      businessType,
      businessDescription,
      tone,
      theme,
      geminiApiKey,
      pages,
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Failed to get current user",
      });
    }

    user.assistantName = assistantName;
    user.businessName = businessName;
    user.businessType = businessType;
    user.businessDescription = businessDescription;
    user.tone = tone;
    user.theme = theme;
    user.pages = pages || [];
    user.isSetupCompleted = true;

    // Validate API Key safely without crashing server
    if (geminiApiKey && typeof geminiApiKey === "string" && geminiApiKey.trim() !== "") {
      const trimmedKey = geminiApiKey.trim();

      // Basic structure check before calling external network
      if (trimmedKey.length < 20) {
        user.geminiApiKey = trimmedKey;
        user.geminiStatus = "invalid";
      } else {
        try {
          // Attempt a lightweight test ping to Gemini API
          const genAI = new GoogleGenerativeAI(trimmedKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          await model.generateContent("hello");

          user.geminiApiKey = trimmedKey;
          user.geminiStatus = "active";
        } catch (apiError) {
          console.error("Gemini API Verification Warning:", apiError?.message || apiError);

          const errString = String(apiError?.message || "").toLowerCase();

          // Check if it's a rate/quota issue vs explicitly invalid key
          if (errString.includes("429") || errString.includes("quota") || errString.includes("resource_exhausted")) {
            user.geminiApiKey = trimmedKey;
            user.geminiStatus = "quota_exceed";
          } else if (errString.includes("api_key_invalid") || errString.includes("400") || errString.includes("unauthorized")) {
            user.geminiApiKey = trimmedKey;
            user.geminiStatus = "invalid";
          } else {
            // If it's a network glitch/timeout, accept key as active to prevent locking user out
            user.geminiApiKey = trimmedKey;
            user.geminiStatus = "active";
          }
        }
      }
    } else {
      user.geminiApiKey = "";
      user.geminiStatus = "invalid";
    }

    await user.save();

    return res.status(200).json({
      message: "Assistant saved successfully",
      user: user,
      success: true,
    });
  } catch (error) {
    console.error("Problem in saveAssistant in user controller:", error);
    return res.status(500).json({
      message: "Failed to save assistant configuration",
      success: false,
      error: error?.message,
    });
  }
};

export const projectAiResponse = async (req, res) => {
  try {
    const { query } = req.body;

    const result = await aiProjectResponse(query);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error in projectAiResponse:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to process request",
    });
  }
};
import User from "../Models/user.model.js";
import { aiProjectResponse } from "../services/aiProject.js";
import { aiService } from "../services/aiService.js";

export const getAssistantConfig = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-geminiApiKey");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Failed to get User",
      });
    }
    return res.status(200).json({
      message: "Assistant Config Data",
      user,
    });
  } catch (error) {
    console.error("Assistant Config Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching config",
    });
  }
};

export const askAssistant = async (req, res) => {
  try {
    const { message, userId, currentPath } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        message: "message and userId are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.geminiApiKey) {
      return res.status(400).json({
        success: false,
        message: "Gemini API key not found",
      });
    }

    // Plan & Limit Checks
    if (user.plan === "free" && user.totalMessages >= user.requestLimit) {
      return res.status(403).json({
        success: false,
        message: "Free limit reached",
      });
    }

    // Double check spelling with your Mongoose schema (e.g. proExipireAt vs proExpiresAt)
    if (
      user.plan === "pro" &&
      user.proExipireAt &&
      new Date(user.proExipireAt) < new Date()
    ) {
      user.plan = "free";
      await user.save();
      return res.status(403).json({
        success: false,
        message: "Plan Expired",
      });
    }

    const cleanMessage = message.toLowerCase().trim();

    // Intent Navigation
    if (user.enableNavigation) {
      const navigationWords = [
        "open",
        "go",
        "start",
        "show",
        "navigate",
        "take me",
      ];

      const wantsNavigation = navigationWords.some((word) =>
        cleanMessage.startsWith(word),
      );

      if (wantsNavigation) {
        const matchedPage = user.pages?.find((page) =>
          page.keywords.some((keyword) =>
            cleanMessage.includes(keyword.toLowerCase()),
          ),
        );

        if (matchedPage) {
          const normalizePath = (p) =>
            p ? p.replace(/\/+$/, "").toLowerCase() || "/" : "";

          if (
            currentPath &&
            normalizePath(currentPath) === normalizePath(matchedPage.path)
          ) {
            return res.json({
              success: true,
              response: `${matchedPage.name} is already opened`,
            });
          }

          return res.json({
            success: true,
            action: "navigate",
            path: matchedPage.path,
            response: `Opening ${matchedPage.name}`,
          });
        }
      }
    }

    // Call LangGraph Service (Pass object payload)
    let aiResult;
    try {
      aiResult = await aiService({
        query: message,
        user,
        apiKey: user.geminiApiKey,
      });
    } catch (aiError) {
      console.error("AI Service Error:", aiError);
      return res.status(500).json({
        success: false,
        message: "Failed to process AI request. Please check your API key.",
      });
    }

    if (!aiResult.success) {
      return res.status(aiResult.status || 500).json({
        success: false,
        message: aiResult.error || "AI processing failed",
      });
    }

    // Increment Usage Count on Success
    if (user.plan === "free") {
      user.totalMessages += 1;
      await user.save();
    }

    return res.json({
      success: true,
      response: aiResult.response,
    });
  } catch (error) {
    console.error("Ask Assistant Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "AI assistant error. Please try again.",
    });
  }
};



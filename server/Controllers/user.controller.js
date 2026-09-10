import User from "../Models/user.model.js";
import { aiProjectResponse } from "../services/aiProject.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if(!user){
        return res.status(400).json({
            message: "Failed to get currrent user"
        })
    }
    return res.status(200).json(user)
  } catch (error) {
    console.log(error)
  }
};


export const saveAssistant = async(req, res) => {
  try {
    const {
      assistantName,
      businessName,
      businessType,
      businessDescription,
      tone,
      theme,
      geminiApiKey,
      pages
    } = req.body;

    const user = await User.findById(req.userId)
    if(!user){
        return res.status(400).json({
            message: "Failed to get current user"
        })
    }

    user.assistantName = assistantName;
    user.businessName = businessName;
    user.businessType = businessType;
    user.businessDescription = businessDescription;
    user.tone = tone;
    user.theme = theme;

    if(geminiApiKey && geminiApiKey.trim() !== ''){
      // Basic validation - API key should start with specific patterns
      if (!geminiApiKey.startsWith('AIzaSy')) {
        return res.status(400).json({
          message: "Invalid Gemini API key format. API keys should start with 'AIzaSy'",
          success: false
        })
      }
      user.geminiApiKey = geminiApiKey
      user.geminiStatus = "pending" // Will be verified on first use
    }

    user.pages = pages || []
    user.isSetupCompleted = true

    await user.save()

    return res.status(200).json({
      message: "Assistant saved successfully",
      user: user,
      success: true
    })

  } catch (error) {
    console.log(`Problem in saveAssistant in user controller`)
    console.log(error)
    return res.status(500).json({
      message: "Failed to save assistant configuration",
      success: false,
      error: error?.message
    })
  }
}

export const projectAiResponse = async (req, res) => {
  try {
    const { query } = req.body;

    const result = await aiProjectResponse(query);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
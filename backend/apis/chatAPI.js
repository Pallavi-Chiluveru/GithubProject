import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatApp = exp.Router();

chatApp.post("/prompt", verifyToken, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is missing in server configuration." });
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build the instruction
    const sysInstruction = "You are a helpful coding assistant within a GitHub-like platform. Be concise and provide code blocks if requested.";
    
    // Generate content
    const result = await model.generateContent(sysInstruction + "\n\nUser: " + prompt);
    const responseText = result.response.text();

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ message: "Failed to fetch response from AI.", error: error.message });
  }
});

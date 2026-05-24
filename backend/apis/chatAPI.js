import exp from "express";
import fs from "fs";
import Groq from "groq-sdk";
import { verifyToken } from "../middleware/verifyToken.js";

export const chatApp = exp.Router();

// Initialise Groq client once at module load
// Model: llama-3.1-8b-instant — fast, free-tier, great for coding assistance
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT =
  "You are a helpful coding assistant within RepoSphere, a collaborative Git platform. " +
  "Be concise and provide code blocks where relevant. " +
  "Format code in markdown fenced blocks with the correct language tag.";

chatApp.post("/prompt", verifyToken, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res
        .status(500)
        .json({ message: "GROQ_API_KEY is missing in server configuration." });
    }

    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content ?? "";
    return res.status(200).json({ response: responseText });

  } catch (error) {
    console.error("Chat API Error:", error?.message ?? error);
    try {
      const log =
        `[${new Date().toISOString()}] Chat API Error: ${error.message}\n` +
        `Stack: ${error.stack}\n\n`;
      fs.appendFileSync("backend.err.log", log);
    } catch (_) {}
    return res
      .status(500)
      .json({ message: "Failed to fetch response from AI.", error: error.message });
  }
});

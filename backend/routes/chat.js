const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

router.post("/", async (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ message: "message is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      reply: "Gemini API key not configured. I'm running in offline mode.",
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are FoodieAI 🍔, a smart food delivery assistant for ZestyGo. Keep replies short, helpful, and friendly. Use emojis.",
    });

    const result = await model.generateContent(message);
    const response = await result.response;

    res.json({ reply: response.text() });
  } catch (error) {
    console.error("❌ Gemini API error:", error.message);
    res.json({
      reply: "Server is a bit busy 🤖, try again!",
    });
  }
});

module.exports = router;

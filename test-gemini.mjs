import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const response = await ai.models.generateContent({
  model: "gemini-3.8-flash",
  contents: "Jawab singkat: apa itu MabaFlow?",
});

console.log(response.text);

import { GoogleGenAI } from "@google/genai";

// The API key should be passed to the GoogleGenAI constructor
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
      parts: [{
        text: "Explain how AI works in a few words"
      }]
    }]
  });
  console.log(response.text);
}

main();
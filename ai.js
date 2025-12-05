import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const API_KEY = process.env.GEMINI_API_KEY;

if(!API_KEY){
    throw new Error("Gemini_API_KEY environment variable not set");
}
const ai = new GoogleGenAI({apiKey: API_KEY});
async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();
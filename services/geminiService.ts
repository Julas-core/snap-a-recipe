import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

// The API key is injected by the environment and should not be hardcoded.
// Throw an error if the API key is not available, which will be caught by the UI.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. This application cannot function without it.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates a recipe from an image by calling the Gemini API directly.
 * @param {string} imageData - The base64 encoded data URL of the image.
 * @param {string} language - The language for the recipe to be generated in.
 * @returns {Promise<Recipe>} A promise that resolves to the generated recipe.
 */
export const generateRecipeFromImage = async (
  imageData: string,
  language: string = 'English'
): Promise<Recipe> => {
  try {
    // Extract mime type and base64 data from the data URL
    const imageParts = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!imageParts || imageParts.length !== 3) {
      throw new Error("Invalid image data format. Expected a data URL.");
    }
    const mimeType = imageParts[1];
    const base64ImageData = imageParts[2];
    
    // Call the Gemini API with the image, prompt, and a defined JSON schema for the response.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze the food in this image and generate a detailed recipe in ${language}. The recipe should include a creative name, a short description, a list of ingredients with measurements, and step-by-step instructions. Ensure the response is in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING, description: "The name of the recipe." },
            description: { type: Type.STRING, description: "A brief description of the dish." },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of ingredients with quantities."
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step cooking instructions."
            },
          },
          required: ["recipeName", "description", "ingredients", "instructions"],
        },
      },
    });

    // The response text is expected to be a JSON string that matches the schema.
    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);

    return recipeData;

  } catch (error: any) {
    console.error("Error generating recipe from Gemini:", error);
    // Create more user-friendly error messages
    let userMessage = "An unexpected error occurred while generating the recipe. Please try again.";
    if (error.message.includes('API key not valid')) {
        userMessage = "The Gemini API key is invalid. Please ensure it is configured correctly.";
    } else if (error.message.includes('quota')) {
        userMessage = "API quota exceeded. Please check your Gemini account status.";
    }
    throw new Error(userMessage);
  }
};
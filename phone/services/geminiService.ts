import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";
import Constants from 'expo-constants';

// The API key is injected by the environment and should not be hardcoded.
// Try multiple sources in order of preference
let API_KEY: string | undefined;

// 1. Try Constants.expoConfig.extra (from app.config.js)
if (Constants.expoConfig?.extra?.GEMINI_API_KEY) {
  API_KEY = Constants.expoConfig.extra.GEMINI_API_KEY as string;
}

// 2. Try Constants.manifest.extra (fallback for older Expo versions)
if (!API_KEY && Constants.manifest && 'extra' in Constants.manifest) {
  const manifestExtra = Constants.manifest.extra as Record<string, any>;
  if (manifestExtra?.GEMINI_API_KEY) {
    API_KEY = manifestExtra.GEMINI_API_KEY as string;
  }
}

// 3. Try EXPO_PUBLIC_ prefix (recommended for Expo)
if (!API_KEY && process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
  API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
}

// Debug logging in development
if (__DEV__) {
  console.log('Gemini API Key Debug:', {
    hasExpoConfigExtra: !!Constants.expoConfig?.extra?.GEMINI_API_KEY,
    hasManifestExtra: !!(Constants.manifest && 'extra' in Constants.manifest && (Constants.manifest.extra as any)?.GEMINI_API_KEY),
    hasExpoPublic: !!process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    keyFound: !!API_KEY,
    keyLength: API_KEY?.length || 0,
    keyPreview: API_KEY ? `${API_KEY.substring(0, 15)}...` : 'NOT FOUND',
    allExtraKeys: Object.keys(Constants.expoConfig?.extra || {}),
  });
}

// Trim whitespace from API key
if (API_KEY) {
  API_KEY = API_KEY.trim();
}

// Validate the API key
if (!API_KEY || API_KEY === '' || API_KEY === 'your_gemini_api_key_here') {
  const errorMsg = `GEMINI_API_KEY not found. Please ensure:
1. Your .env file in the phone directory contains: GEMINI_API_KEY=your_actual_key
2. Or use EXPO_PUBLIC_GEMINI_API_KEY in your .env file
3. Restart the Expo server after adding the key`;
  console.error('❌', errorMsg);
  throw new Error(errorMsg);
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
  // Normalize and validate language
  const normalizedLanguage = language?.trim() || 'English';
  
  // Debug logging
  if (__DEV__) {
    console.log('🌍 Generating recipe in language:', {
      original: language,
      normalized: normalizedLanguage,
      length: normalizedLanguage.length
    });
  }
  
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
            text: `Analyze the food in this image and generate a detailed recipe. 

CRITICAL INSTRUCTION: You MUST generate the ENTIRE recipe in ${normalizedLanguage} language. This includes:
- Recipe name: Must be in ${normalizedLanguage}
- Description: Must be in ${normalizedLanguage}
- All ingredients: Must be in ${normalizedLanguage}
- All instructions: Must be in ${normalizedLanguage}

The recipe should include a creative name, a short description, a list of ingredients with measurements, and step-by-step instructions. EVERY SINGLE WORD of the recipe must be written in ${normalizedLanguage}, not English or any other language.

Return the response as JSON with all text content in ${normalizedLanguage} language.`,
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
    if (!response.text) {
      throw new Error("No response text received from the API. Please try again.");
    }
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


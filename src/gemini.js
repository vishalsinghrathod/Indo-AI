const api = import.meta.env.VITE_GEMINI_API_KEY;

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { RiMoneyEuroBoxLine } from "react-icons/ri";


const genAI = api ? new GoogleGenerativeAI(api) : null;

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run(prompt, image = null) {
  if (!api || api.trim() === "" || api.includes("YOUR_GEMINI_API_KEY")) {
    throw new Error("Gemini API key is not configured. Please create a .env file in the root directory, add VITE_GEMINI_API_KEY=your_actual_key, and restart the Vite development server (npm run dev).");
  }

  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
  let lastError = null;

  for (const modelName of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
        });

        if (image) {
          const imagePart = {
            inlineData: {
              data: image.data,
              mimeType: image.mimeType
            }
          };
          const result = await model.generateContent([prompt, imagePart]);
          return result.response.text();
        } else {
          const chatSession = model.startChat({
            generationConfig,
            history: [],
          });
          const result = await chatSession.sendMessage(prompt);
          return result.response.text();
        }
      } catch (error) {
        lastError = error;
        console.warn(`Model ${modelName} (attempt ${attempt}/2) failed: ${error.message}`);

        // If it's a fatal error that won't resolve by retrying or falling back, throw immediately
        if (error.message.includes("API key expired") || error.message.includes("not found")) {
          throw error;
        }

        // If it is a transient 503 error, wait 1 second and retry once
        if (attempt === 1 && (error.message.includes("503") || error.message.includes("demand"))) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        // Otherwise, break the attempt loop to try the fallback model
        break;
      }
    }
  }

  // If all retries and fallback models fail, throw the last error
  throw lastError;
}

export default run;
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

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
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
      history: [
      ],
    });
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  }
}

export default run;
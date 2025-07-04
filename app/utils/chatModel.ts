import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

let model: ChatGoogleGenerativeAI | null = null;
export async function getChatModel() {
  if (model === null) {
    model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      model: "gemini-2.5-flash",
    });
  }

  return model;
}

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";

// For demos, you can also use an in-memory store:
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { generateSessionId } from "utils/sessionManager";

// Store memory per session (in production, use Redis or database)
const sessionMemories = new Map();

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
  model: "gemini-2.5-flash-lite-preview-06-17",
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a technical interviewer for {company}.

INTERVIEW OBJECTIVES:
- Evaluate problem-solving skills
- Assess code quality and optimization
- Test understanding of algorithms and data structures
- Check communication and explanation abilities

INTERVIEW STYLE:
- Be professional but encouraging
- Ask one question at a time
- Provide hints when stuck, not full solutions
- Inquire about time/space complexity
- Ask about edge cases and testing

Remember: This is a {company} interview, so tailor your questions to their typical interview style. Additionally, keep your responses brief. Ensure the response is in plain text without any Markdown or special formatting. Avoid bullet points, asterisks, or any symbols that indicate structured text.`,
  ],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      company,
      codeContext,
      sessionId,
    } = await request.json();

    // If no sessionId provided, create one
    const finalSessionId = sessionId?.trim() || generateSessionId();

    // Get or create memory for this session
    if (!sessionMemories.has(finalSessionId)) {
      sessionMemories.set(
        finalSessionId,
        new ChatMessageHistory(),
      );
    }

    // Create conversation chain
    const chain = promptTemplate.pipe(model);
    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (sessionId) => {
        const sessionMemory = sessionMemories.get(sessionId);
        return sessionMemory;
      },
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    // Execute with context
    const response = await chainWithHistory.invoke({
      company: company,
      input: `${message}\n\nHere is the code so far:\n${codeContext}`,
    }, { configurable: { sessionId: finalSessionId } });

    return NextResponse.json({
      reply: response.content,
      sessionId: finalSessionId, // Send back to frontend
    });
  } catch (error) {
    console.error("LangChain Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 },
    );
  }
}

import { ChatOpenAI } from "@langchain/openai";
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

const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are conducting a technical interview for {company}.

INTERVIEWEE'S CODE:
{codeContext}

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

Remember: This is a {company} interview, so tailor your questions to their typical interview style.`,
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
      sessionId
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

        console.log("Retrieving message history for session:", sessionId);
        const sessionMemory = sessionMemories.get(sessionId);
        console.log(sessionMemory);
        
        return sessionMemory;
      },
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });
    console.log(codeContext);

    // Execute with context
    const response = await chainWithHistory.invoke({
      company: company,
      codeContext: codeContext || "No code written yet",
      input: message,
    }, { configurable: { sessionId: finalSessionId } });

    return NextResponse.json({
      reply: response.content,
      sessionId: finalSessionId // Send back to frontend
    });
  } catch (error) {
    console.error("LangChain Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 },
    );
  }
}

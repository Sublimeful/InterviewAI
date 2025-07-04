import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";

// For demos, you can also use an in-memory store:
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { generateSessionId } from "utils/sessionManager";
import { getRedisClient } from "utils/redis";
import { getChatModel } from "utils/chatModel";

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
    // Get chat model
    const model = await getChatModel();

    // Get redisClient
    const redisClient = await getRedisClient();

    // If no sessionId provided, create one
    const finalSessionId = sessionId?.trim() || generateSessionId();

    // Track history instance for this request
    let currentSessionHistory: ChatMessageHistory | null = null;

    // Create helper function to handle Redis storage
    const getMessageHistory = async (sessionId: string) => {
      if (currentSessionHistory) return currentSessionHistory;

      const history = new ChatMessageHistory();
      const storedData = await redisClient.get(sessionId);

      if (storedData) {
        // Handle Buffer conversion if needed
        const historyString = storedData.toString();

        try {
          const parsedHistory = JSON.parse(historyString);
          for (const msg of parsedHistory) {
            if (msg.type === "human") {
              await history.addUserMessage(msg.content);
            } else if (msg.type === "ai") {
              await history.addAIMessage(msg.content);
            }
          }
        } catch (error) {
          console.error("Error parsing chat history:", error);
        }
      }

      currentSessionHistory = history;
      return history;
    };

    // Create conversation chain
    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: promptTemplate.pipe(model),
      getMessageHistory,
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    // Execute with context
    const response = await chainWithHistory.invoke({
      company: company,
      input: `${message}\n\nHere is the code so far:\n${codeContext}`,
    }, { configurable: { sessionId: finalSessionId } });

    // Save updated history to Redis after interaction
    const currentHistory = await getMessageHistory(finalSessionId);
    const messages = await currentHistory.getMessages();

    // Expire the key after 1 hour
    const keyExists = await redisClient.exists(finalSessionId);

    // Store the messages in Redis
    await redisClient.set(
      finalSessionId,
      JSON.stringify(messages.map((m) => ({
        type: m.getType(),
        content: m.content,
      }))),
    );

    // If the key did not exist before, set an expiration time
    if (!keyExists) {
      await redisClient.expire(finalSessionId, 86400); // 24 hours
    }

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

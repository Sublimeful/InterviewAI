import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "utils/redis";
import { getChatModel } from "utils/chatModel";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Message } from "api/types";

// Create feedback prompt
const feedbackPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a technical interviewer providing feedback on a coding interview. Analyze the conversation history and provide constructive feedback focusing on:

        EVALUATION CRITERIA:
        1. Problem-solving approach and logical reasoning
        2. Code quality and efficiency
        3. Algorithmic complexity awareness
        4. Communication clarity and explanation
        5. Handling of edge cases and testing
        
        FORMAT REQUIREMENTS:
        - Start with overall rating (1-10)
        - List 3 key strengths with ✅
        - List 3 areas for improvement with ⚠️
        - Provide specific examples from the conversation
        - End with actionable advice for next steps
        - Use plain text only (no markdown or special formatting)`,
  ],
  [
    "user",
    `   Conversation History:
        {conversation}`,
  ],
]);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session ID" },
      { status: 400 },
    );
  }

  try {
    const redisClient = await getRedisClient();
    const model = await getChatModel();

    // Check if session exists in Redis
    const exists = await redisClient.exists(sessionId);
    if (!exists) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 410 },
      );
    }

    // Retrieve conversation history from Redis
    const storedData = await redisClient.get(sessionId);
    if (!storedData) {
      return NextResponse.json(
        { error: "No conversation history found" },
        { status: 404 },
      );
    }

    // Parse conversation history
    const historyString = storedData.toString();
    const parsedHistory = JSON.parse(historyString);

    // Format conversation for feedback prompt
    // Omit the first message, as that's the initial problem statement request message
    const conversation = parsedHistory.slice(1).map((msg: Message) => {
      return `${
        msg.type === "human" ? "Candidate" : "Interviewer"
      }: "${msg.content}"`;
    }).join("\n\n");

    // Generate feedback
    const chain = feedbackPrompt.pipe(model);
    const response = await chain.invoke({
      conversation: conversation,
    });
    const feedback = response.content;

    // Delete session from Redis after generating feedback
    await redisClient.del(sessionId);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Feedback generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 },
    );
  }
}

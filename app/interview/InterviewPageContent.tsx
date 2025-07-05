"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Code, MessageCircle, Send } from "lucide-react";
import { Mic, MicOff } from "lucide-react";
import {
  formatTimeHHMM,
  formatTimeMMSS,
  formatTimeMMSSExplicit,
} from "utils/timeFormatters";

import CodeEditor from "@/components/CodeEditor";

interface Message {
  id: number;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function InterviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = searchParams.get("company") || "Unknown Company";
  const difficulty = searchParams.get("difficulty") || "Medium";
  const initialTimeLimit = parseInt(searchParams.get("timeLimit") || "30", 10);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(initialTimeLimit * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech recognition state
  const [listening, setListening] = useState(false);
  const [
    browserSupportsSpeechRecognition,
    setBrowserSupportsSpeechRecognition,
  ] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [interimMessage, setInterimMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getChatResponse = useCallback(
    async (message: string): Promise<Message> => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: company,
            message: message,
            timeContext: formatTimeMMSSExplicit(timeLeft),
            codeContext: `\`\`\`${selectedLanguage}\n${code}\n\`\`\``,
            sessionId,
          }),
        });

        if (!response.ok) throw new Error("Failed to get response");

        const data = await response.json();

        // If we do not have a session ID yet, set it to the one returned from the API
        if (!sessionId) {
          setSessionId(data.sessionId);
        }

        const aiMessage: Message = {
          id: Date.now() + 1,
          sender: "ai",
          content: data.reply,
          timestamp: new Date(),
        };
        return aiMessage;
      } catch (error) {
        console.error("Error fetching AI response:", error);
        return {
          id: Date.now() + 1,
          sender: "ai",
          content:
            "Sorry, I encountered an error while processing your request.",
          timestamp: new Date(),
        };
      }
    },
    [company, timeLeft, code, sessionId, selectedLanguage],
  );

  const sendChatMessage = async (message: string) => {
    if (isTyping) return; // Prevent sending while AI is typing

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const aiMessage = await getChatResponse(message);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      // Error handling...
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await sendChatMessage(message.trim());
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert(
        "Your browser doesn't support speech recognition. Please use a supported browser like Chrome or Edge.",
      );
      return;
    }

    if (listening) {
      speechRecognitionRef.current.stop();
    } else {
      speechRecognitionRef.current.start();
      setListening(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndInterview = () => {
    if (!sessionId) {
      alert("Please wait until the interview starts before ending.");
      return;
    }

    if (
      confirm(
        "Are you sure you want to end the interview? You'll receive feedback based on your progress.",
      )
    ) {
      router.push(`/interview/feedback?sessionId=${sessionId}`);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition and events
  useLayoutEffect(() => {
    function recognitionOnEnd() {
      setMessage((prevMessage) => prevMessage + interimMessage);
      setInterimMessage("");
      setListening(false);
    }

    function recognitionOnResult(event: SpeechRecognitionEvent) {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setInterimMessage(finalTranscript + interimTranscript);
    }

    function recognitionOnError(event: SpeechRecognitionErrorEvent) {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    }

    // Initialize Speech recognition
    const SpeechRecognition = window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    setBrowserSupportsSpeechRecognition(true);

    if (!speechRecognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      speechRecognitionRef.current = recognition;
    }

    speechRecognitionRef.current.onresult = recognitionOnResult;
    speechRecognitionRef.current.onend = recognitionOnEnd;
    speechRecognitionRef.current.onerror = recognitionOnError;
  }, [message, interimMessage]);

  // Get the problem statement and initial instructions
  useEffect(() => {
    // Skip if already initialized
    if (isInitializedRef.current) return;
    isInitializedRef.current = true; // Mark as initialized

    setIsTyping(true);
    getChatResponse(
      `Hello mock interviewer, introduce yourself to me and give me a ${difficulty} level coding problem for a mock interview at ${company}. Include any specific requirements or constraints that are typical for their interviews.`,
    ).then((initialResponse) => {
      setMessages((prev) => [...prev, initialResponse]);
      setIsTyping(false);
    });
  }, [getChatResponse, company, difficulty]);

  useEffect(() => {
    // Start timer when component mounts
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Redirect when time runs out
  useEffect(() => {
    if (timeLeft === 0 && sessionId) {
      router.push(`/interview/feedback?sessionId=${sessionId}`);
    }
  }, [timeLeft, sessionId, router]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-semibold text-gray-900">
                Mock Interview
              </h1>
              <p className="text-sm text-gray-600">{company}</p>
            </div>
          </div>
          <div className="flex md:gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Interview in progress
            </div>

            {/* End Interview Button */}
            <button
              type="button"
              onClick={handleEndInterview}
              className="md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              End Interview
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden">
        {/* Chat Interface - Top on mobile, Right on desktop */}
        <div className="w-full md:w-1/2 bg-white flex flex-col order-2 md:order-2 h-1/2 md:h-full">
          {/* Chat Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-row gap-2">
                <MessageCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Interview Chat
                </span>
              </div>

              {/* Timer display */}
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700">
                  Time Remaining:
                </div>
                <div
                  className={`px-3 py-1 rounded-lg font-mono ${
                    timeLeft < 300
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {formatTimeMMSS(timeLeft)}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTimeHHMM(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce">
                    </div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    >
                    </div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    >
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <textarea
                name="messageInput"
                ref={messageInputRef}
                value={message + interimMessage}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or explain your approach..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{
                  minHeight: "40px",
                  maxHeight: "120px",
                  scrollbarColor: "darkgrey transparent",
                }}
              />
              {/* Voice Input Button */}
              <button
                type="button"
                title={listening ? "Stop Voice Input" : "Start Voice Input"}
                onClick={toggleListening}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  listening
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {listening
                  ? <MicOff className="w-4 h-4" />
                  : <Mic className="w-4 h-4" />}
              </button>
              {/* Send Message Button */}
              <button
                type="button"
                title="Send Message"
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {/* Voice input status indicator */}
            {listening && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse">
                </div>
                <span>Listening... Speak now</span>
              </div>
            )}
          </div>
        </div>
        {/* Code Editor - Bottom on mobile, Left on desktop */}
        <div className="w-full md:w-1/2 order-1 md:order-1 h-1/2 md:h-full">
          {/* Code Editor - Left Side */}
          <CodeEditor
            onCodeChange={(newCode: string) => {
              setCode(newCode);
            }}
            onLanguageChange={(newLanguage: string) => {
              setSelectedLanguage(newLanguage);
            }}
          />
        </div>
      </div>
    </div>
  );
}

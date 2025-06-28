"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Code, MessageCircle, Send } from "lucide-react";

export default function Page() {
  const searchParams = useSearchParams();
  const company = searchParams.get("company") || "Unknown Company";

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your solution here\n\n");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      content:
        `Welcome to your mock interview for ${company}! I'm your AI interviewer. Let's start with a coding question. Please solve the following problem in the language of your choice.`,
      timestamp: new Date(),
    },
    {
      id: 2,
      sender: "ai",
      content:
        `**Problem: Two Sum**\n\nGiven an array of integers and a target sum, return the indices of two numbers that add up to the target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1] (because nums[0] + nums[1] = 2 + 7 = 9)`,
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "typescript", label: "TypeScript" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "That's a good approach! Can you walk me through your thought process?",
        "I see you're considering that solution. What would be the time complexity?",
        "Interesting! How would you handle edge cases like an empty array?",
        "Good progress! Can you optimize this further?",
        "Great question! Let me give you a hint: think about using a hash map.",
      ];

      const aiMessage = {
        id: messages.length + 2,
        sender: "ai",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getLanguageComment = (lang) => {
    const comments = {
      javascript: "// Write your solution here\n\n",
      python: "# Write your solution here\n\n",
      java: "// Write your solution here\n\n",
      cpp: "// Write your solution here\n\n",
      typescript: "// Write your solution here\n\n",
      go: "// Write your solution here\n\n",
      rust: "// Write your solution here\n\n",
    };
    return comments[lang] || "// Write your solution here\n\n";
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    setCode(getLanguageComment(newLang));
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Mock Interview
              </h1>
              <p className="text-sm text-gray-600">{company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Interview in progress
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor - Left Side */}
        <div className="w-1/2 bg-gray-900 flex flex-col">
          {/* Language Selector */}
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Language:</span>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-gray-700 text-white text-sm rounded px-3 py-1 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 p-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-gray-100 font-mono text-sm resize-none focus:outline-none"
              placeholder="Write your code here..."
              spellCheck={false}
              style={{
                lineHeight: "1.5",
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* Chat Interface - Right Side */}
        <div className="w-1/2 bg-white flex flex-col">
          {/* Chat Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Interview Chat
              </span>
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
                    {formatTime(message.timestamp)}
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
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question or explain your approach..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";

export default function Page() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    "Medium",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleStartInterview = () => {
    if (!company.trim()) return;

    setIsLoading(true);

    // In a real Next.js app, you'd use router.push()
    // For demo purposes, we'll show what the URL would be
    const interviewUrl = `/interview?company=${
      encodeURIComponent(company.trim())
    }&difficulty=${encodeURIComponent(difficulty)}`;

    setTimeout(() => {
      router.push(interviewUrl);
    }, 1000);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && company.trim()) {
      handleStartInterview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI Mock Interview
            </h1>
            <p className="text-gray-600">
              Let&apos;s prepare you for your upcoming interview
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              {/* Company Selection */}
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Which company are you interviewing for?
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
              {/* Difficulty Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={isLoading}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={!company.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading
                ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin">
                    </div>
                    Starting Interview...
                  </>
                )
                : (
                  <>
                    Start Mock Interview
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Be specific with the company name</li>
              <li>• We&apos;ll tailor questions to the company&apos;s style</li>
              <li>• Practice in a quiet environment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

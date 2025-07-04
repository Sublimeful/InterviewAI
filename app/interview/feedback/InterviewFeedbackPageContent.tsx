"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function InterviewFeedbackPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`/api/feedback?sessionId=${sessionId}`);
        const data = await response.json();

        if (response.status === 410) { // Session expired
          setIsExpired(true);
        } else if (response.ok) {
          setFeedback(data.feedback);
        }
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Skip if already initialized
    if (isInitializedRef.current) return;
    isInitializedRef.current = true; // Mark as initialized

    if (sessionId) {
      fetchFeedback();
    } else {
      setIsExpired(true);
      setIsLoading(false);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto">
          </div>
          <p className="mt-4 text-gray-600">Generating your feedback...</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Session Expired
          </h1>
          <p className="text-gray-600 mb-6">
            This interview session has expired. Feedback is only available for
            24 hours after completion.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Interview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Completed!
          </h1>
          <p className="text-gray-600">
            Here&apos;s your personalized feedback
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Feedback Summary
          </h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {feedback || "No feedback available."}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Start New Interview
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer"
          >
            Print Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

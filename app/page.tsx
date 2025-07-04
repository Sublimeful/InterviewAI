"use client";

import { ArrowRight, Brain, Play, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-sky-600" />,
      title: "AI-Powered Feedback",
      description:
        "Get instant, detailed feedback on your responses with personalized improvement suggestions.",
    },
    {
      icon: <Users className="w-6 h-6 text-sky-600" />,
      title: "Industry-Specific Practice",
      description:
        "Practice with questions tailored to your target role and industry requirements.",
    },
    {
      icon: <Zap className="w-6 h-6 text-sky-600" />,
      title: "Real-time Simulation",
      description:
        "Experience realistic interview conditions with voice recording and time pressure.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-sky-300 to-blue-400 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              InterviewAI
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-sky-100 border border-sky-200 rounded-full px-4 py-2 text-sky-600">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    AI-Powered Interview Prep
                  </span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-slate-800 leading-tight">
                  Ace Your Next
                  <br />
                  <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                    Interview
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Practice with our AI interviewer, get instant feedback, and
                  build confidence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/setup"
                  className="group bg-gradient-to-r from-sky-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-sky-600 hover:to-blue-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Practicing Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl border border-sky-100 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                    <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                    <div className="w-3 h-3 bg-emerald-300 rounded-full"></div>
                  </div>
                  <span className="text-slate-500 text-sm">
                    Mock Interview Session
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-800 font-medium mb-2">
                      AI Interviewer:
                    </p>
                    <p className="text-slate-600">
                      &quot;Implement a function to find the longest substring
                      without repeating characters.&quot;
                    </p>
                  </div>

                  <div className="bg-sky-50 border border-sky-100 rounded-lg p-4">
                    <p className="text-sky-600 font-medium mb-2">
                      Your Solution:
                    </p>
                    <div className="flex items-center space-x-2 text-slate-500">
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse">
                      </div>
                      <span>Recording...</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                    <p className="text-emerald-600 font-medium mb-2">
                      Technical Feedback:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-slate-700">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">
                          Consider using a sliding window approach
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">
                          Handle edge case: empty string input
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-sky-300 to-blue-300 rounded-full blur-xl opacity-30">
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full blur-xl opacity-30">
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-sky-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                InterviewAI
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform provides everything you need to excel in
              your interviews
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white border border-sky-100 rounded-xl p-6 hover:border-sky-300 transition-all transform hover:scale-[1.02] shadow-sm"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-sky-100 to-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

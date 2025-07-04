import { Suspense } from "react";
import InterviewFeedbackPageContent from "./InterviewFeedbackPageContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading interview feedback...
        </div>
      }
    >
      <InterviewFeedbackPageContent />
    </Suspense>
  );
}

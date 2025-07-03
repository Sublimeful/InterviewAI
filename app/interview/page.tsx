import { Suspense } from "react";
import InterviewPageContent from "./InterviewPageContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading interview session...
        </div>
      }
    >
      <InterviewPageContent />
    </Suspense>
  );
}

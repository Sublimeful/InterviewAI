import "./globals.css";
import "highlight.js/styles/atom-one-dark.css";

export const metadata = {
  title: "InterviewAI | AI-Powered Interview Prep",
  description:
    "Ace your next interview! Practice with our AI interviewer, get instant feedback, and build confidence.",
  icons: {
    icon: "icon.svg",
    shortcut: "icon.svg",
    apple: "icon.svg",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "icon.svg",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

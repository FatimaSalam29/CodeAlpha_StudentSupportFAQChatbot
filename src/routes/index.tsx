import { createFileRoute } from "@tanstack/react-router";
import { ChatBot } from "@/components/chat/ChatBot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Support FAQ Chatbot — NLP FAQ Assistant" },
      {
        name: "description",
        content:
          "Ask common student questions about admissions, fees, exams, results and more. Answers are matched with TF-IDF and cosine similarity.",
      },
      { property: "og:title", content: "Student Support FAQ Chatbot" },
      {
        property: "og:description",
        content: "An NLP-powered FAQ assistant that matches student questions using TF-IDF and cosine similarity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <ChatBot />;
}

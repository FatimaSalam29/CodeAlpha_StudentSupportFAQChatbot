import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChatBot } from "@/components/chat/ChatBot";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChatBot />
  </StrictMode>,
);

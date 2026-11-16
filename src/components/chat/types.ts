import type { MatchResult } from "@/lib/nlp";

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "bot"; kind: "welcome" }
  | { id: string; role: "bot"; kind: "result"; result: MatchResult; repeated: boolean };

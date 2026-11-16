import { CornerDownRight, Info, Search } from "lucide-react";
import type { ScoredFaq } from "@/lib/nlp";
import { BotAvatar } from "./BotAvatar";
import type { ChatMessage } from "./types";

interface Props {
  message: ChatMessage;
  onAsk: (question: string) => void;
  welcomeSuggestions: string[];
  faqCount: number;
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
    </button>
  );
}

function SuggestionList({ items, onAsk, title }: { items: ScoredFaq[]; onAsk: (q: string) => void; title: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-1.5">
        {items.map((s) => (
          <button
            key={s.faq.id}
            type="button"
            onClick={() => onAsk(s.faq.question)}
            className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-secondary-foreground transition-colors hover:bg-accent"
          >
            <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="flex-1">{s.faq.question}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function BotBody({ message, onAsk, welcomeSuggestions, faqCount }: Props) {
  if (message.role !== "bot") return null;

  if (message.kind === "welcome") {
    return (
      <>
        <p className="font-display text-lg font-semibold text-foreground">Hi, I'm your Student Support assistant.</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Ask me about admissions, fees, attendance, exams, results, scholarships, the library, the LMS, course
          registration, timetables or student support. I search {faqCount} demonstration FAQs and only answer when I find
          a close match.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {welcomeSuggestions.map((q) => (
            <Chip key={q} label={q} onClick={() => onAsk(q)} />
          ))}
        </div>
      </>
    );
  }

  const { result, repeated } = message;
  if (result.type === "answer") {
    const pct = Math.round(result.best.score * 100);
    return (
      <>
        {repeated && (
          <p className="mb-2 text-xs font-medium text-muted-foreground">You asked this a moment ago — here it is again.</p>
        )}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
            {result.best.faq.category}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground" title="Cosine similarity between your question and the matched FAQ">
            {pct}% match
          </span>
        </div>
        <p className="text-sm font-semibold text-foreground">{result.best.faq.question}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-bubble-bot-foreground">{result.best.faq.answer}</p>
        <SuggestionList items={result.alternatives} onAsk={onAsk} title="Related questions" />
      </>
    );
  }

  const text =
    result.reason === "too-short"
      ? "That's a little too short for me to understand. Could you ask a full question, for example “How do I pay my fees?”"
      : "Sorry, I couldn't find a sufficiently relevant answer in my FAQ list, so I won't guess. Try rephrasing your question, pick one of the topics, or contact your institution's student support office through its official channels.";
  return (
    <>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-warning-foreground">
        <Search className="h-3.5 w-3.5" /> No confident match
      </div>
      <p className="text-sm leading-relaxed text-bubble-bot-foreground">{text}</p>
      <SuggestionList items={result.suggestions} onAsk={onAsk} title="Did you mean" />
    </>
  );
}

export function MessageBubble(props: Props) {
  const { message } = props;
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-message-in">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-bubble-user px-4 py-2.5 text-sm leading-relaxed text-bubble-user-foreground shadow-soft sm:max-w-[75%]">
          {message.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-3 animate-message-in">
      <BotAvatar />
      <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-border bg-bubble-bot px-4 py-3.5 shadow-soft sm:max-w-[78%]">
        <BotBody {...props} />
      </div>
    </div>
  );
}

export function DemoNotice({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-warning px-3 py-2 text-xs leading-relaxed text-warning-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{text}</span>
    </p>
  );
}

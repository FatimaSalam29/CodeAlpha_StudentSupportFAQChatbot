import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { BookOpen, Calculator, CalendarDays, ClipboardList, GraduationCap, LifeBuoy, Library, MonitorSmartphone, RotateCcw, SendHorizontal, Wallet, Award, UserCheck, FileText, Sparkles } from "lucide-react";
import { FAQ_DATASET, getFaqMatcher } from "@/lib/nlp";
import { BotAvatar } from "./BotAvatar";
import { DemoNotice, MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage } from "./types";

const STORAGE_KEY = "student-faq-chat-v1";
const WELCOME: ChatMessage = { id: "welcome", role: "bot", kind: "welcome" };
const THINKING_DELAY_MS = 450;
const MAX_INPUT = 300;

const WELCOME_SUGGESTIONS = [
  "How do I apply for admission?",
  "How do I pay my fees?",
  "What is the minimum attendance requirement?",
  "How can I check my exam results?",
];

const TOPICS: { label: string; question: string; icon: typeof BookOpen }[] = [
  { label: "Admissions", question: "How do I apply for admission?", icon: GraduationCap },
  { label: "Eligibility", question: "What are the eligibility criteria for admission?", icon: UserCheck },
  { label: "Applications", question: "How can I check my application status?", icon: FileText },
  { label: "Fees", question: "Can I pay my fees in installments?", icon: Wallet },
  { label: "Attendance", question: "What happens if my attendance is short?", icon: ClipboardList },
  { label: "Exams", question: "What should I do if I miss an exam?", icon: Calculator },
  { label: "Results", question: "How do I apply for rechecking of my paper?", icon: Award },
  { label: "Scholarships", question: "How do I apply for a scholarship?", icon: Sparkles },
  { label: "Library", question: "How can I borrow books from the library?", icon: Library },
  { label: "LMS", question: "How do I submit assignments on the LMS?", icon: MonitorSmartphone },
  { label: "Registration & timetables", question: "Can I add or drop a course?", icon: CalendarDays },
  { label: "Student support", question: "Is counseling available for students?", icon: LifeBuoy },
];

const QUICK_CHIPS = ["Fee refund policy", "Library timings", "Forgot my LMS password", "Exam admit card", "Hostel accommodation"];

let idCounter = 0;
const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export function ChatBot() {
  const matcher = useMemo(() => getFaqMatcher(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  // Restore this browser session's chat history (client-only, after hydration).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const ask = useCallback(
    (raw: string) => {
      const text = raw.trim().slice(0, MAX_INPUT);
      if (!text) {
        setHint("Please type a question first.");
        inputRef.current?.focus();
        return;
      }
      if (thinking) return;
      setHint(null);
      setInput("");

      let repeated = false;
      setMessages((prev) => {
        const lastUser = [...prev].reverse().find((m) => m.role === "user");
        repeated = !!lastUser && lastUser.role === "user" && lastUser.text.toLowerCase() === text.toLowerCase();
        return [...prev, { id: newId(), role: "user", text }];
      });
      setThinking(true);

      timer.current = setTimeout(() => {
        const result = matcher.match(text);
        setMessages((prev) => [...prev, { id: newId(), role: "bot", kind: "result", result, repeated }]);
        setThinking(false);
        inputRef.current?.focus();
      }, THINKING_DELAY_MS);
    },
    [matcher, thinking],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      ask(input);
    }
  };

  const clearChat = () => {
    if (timer.current) clearTimeout(timer.current);
    setThinking(false);
    setHint(null);
    setInput("");
    setMessages([WELCOME]);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto flex h-dvh max-w-7xl gap-6 p-0 sm:p-4 lg:p-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-80 shrink-0 flex-col gap-5 overflow-y-auto rounded-3xl border border-border bg-card/80 p-6 shadow-panel backdrop-blur lg:flex">
          <div className="flex items-center gap-3">
            <BotAvatar size="lg" />
            <div>
              <p className="font-display text-xl font-semibold leading-tight text-foreground">Campus Help</p>
              <p className="text-xs text-muted-foreground">Student Support FAQ Chatbot</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Browse topics</p>
            <nav className="flex flex-col gap-0.5">
              {TOPICS.map(({ label, question, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => ask(question)}
                  disabled={thinking}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-60"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl bg-secondary p-4">
            <p className="font-display text-sm font-semibold text-foreground">How I find answers</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Your question is tokenized, cleaned of stop words, spell-checked and stemmed, then turned into a TF-IDF vector.
              I compare it to every stored FAQ with cosine similarity and only answer above a {Math.round(matcher.config.similarityThreshold * 100)}% match.
            </p>
          </div>

          <div className="mt-auto">
            <DemoNotice text={FAQ_DATASET.meta.disclaimer} />
          </div>
        </aside>

        {/* Chat panel */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden border-border bg-card shadow-panel sm:rounded-3xl sm:border">
          <header className="flex items-center gap-3 border-b border-border bg-gradient-primary px-4 py-3.5 text-primary-foreground sm:px-6 sm:py-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg font-semibold leading-tight sm:text-xl">Student Support Assistant</h1>
              <p className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" aria-hidden />
                Online · {matcher.size} FAQs indexed
              </p>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-primary-foreground/25 transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear chat
            </button>
          </header>

          <div className="px-4 pt-3 lg:hidden">
            <DemoNotice text="Demonstration FAQs only — not official university policy." />
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite" aria-label="Chat messages">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} onAsk={ask} welcomeSuggestions={WELCOME_SUGGESTIONS} faqCount={matcher.size} />
              ))}
              {thinking && <TypingIndicator />}
            </div>
          </div>

          <div className="border-t border-border bg-card px-4 pb-4 pt-3 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="-mx-1 mb-2.5 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Suggested questions">
                {QUICK_CHIPS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={thinking}
                    onClick={() => ask(q)}
                    className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-60"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form onSubmit={onSubmit} className="flex items-end gap-2 rounded-2xl border border-input bg-background p-1.5 pl-4 shadow-soft transition-shadow focus-within:ring-2 focus-within:ring-ring">
                <label htmlFor="chat-input" className="sr-only">Type your question</label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={MAX_INPUT}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (hint) setHint(null);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Ask a question, e.g. How do I register for courses?"
                  className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={thinking || !input.trim()}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="hidden sm:inline">Send</span>
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-1.5 min-h-4 px-1 text-[11px] text-muted-foreground" role={hint ? "alert" : undefined}>
                {hint ?? "Press Enter to send · Shift + Enter for a new line"}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

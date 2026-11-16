import { BotAvatar } from "./BotAvatar";

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-message-in" role="status" aria-label="Assistant is typing">
      <BotAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-bubble-bot px-4 py-3.5 shadow-soft">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-primary animate-typing-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

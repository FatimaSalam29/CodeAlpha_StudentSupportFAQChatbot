import { GraduationCap } from "lucide-react";

export function BotAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-11 w-11 rounded-2xl" : "h-8 w-8 rounded-xl";
  return (
    <div className={`${cls} grid shrink-0 place-items-center bg-gradient-primary text-primary-foreground shadow-soft`} aria-hidden>
      <GraduationCap className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
    </div>
  );
}

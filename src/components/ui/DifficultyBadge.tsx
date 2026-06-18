import type { Difficulty } from "@/types";
import { DIFFICULTY_LABELS } from "@/types";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: "sm" | "md";
}

export default function DifficultyBadge({
  difficulty,
  size = "sm",
}: DifficultyBadgeProps) {
  const colorMap: Record<Difficulty, string> = {
    simple: "bg-easy/10 text-easy-dark border-easy/20",
    medium: "bg-medium/10 text-medium-dark border-medium/20",
    hard: "bg-hard/10 text-hard-dark border-hard/20",
  };

  const dotColorMap: Record<Difficulty, string> = {
    simple: "bg-easy",
    medium: "bg-medium",
    hard: "bg-hard",
  };

  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-sans font-500 ${colorMap[difficulty]} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColorMap[difficulty]}`} />
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}

import { useAppStore } from "@/store/useAppStore";
import { Sparkles, X } from "lucide-react";

export default function AchievementPopup() {
  const { achievementPopup, hideAchievementPopup } = useAppStore();

  if (!achievementPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-sm animate-slide-up">
        <button
          onClick={hideAchievementPopup}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream-50 text-ink-500 shadow-md hover:text-ink-700 transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-cream-50 shadow-2xl">
          {/* 顶部装饰 */}
          <div className="relative h-24 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-2 left-4 h-1 w-1 rounded-full bg-cream-50 animate-float" />
              <div className="absolute top-6 right-8 h-1.5 w-1.5 rounded-full bg-cream-50 animate-float" style={{ animationDelay: "0.5s" }} />
              <div className="absolute bottom-3 left-12 h-1 w-1 rounded-full bg-cream-50 animate-float" style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-6 right-4 h-2 w-2 rounded-full bg-cream-50 animate-float" style={{ animationDelay: "1.5s" }} />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-cream-50 bg-gradient-to-br from-amber-300 to-amber-500 achievement-glow">
                <Sparkles className="h-7 w-7 text-cream-50" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* 内容 */}
          <div className="px-8 pb-8 pt-12 text-center">
            <p className="font-sans text-[10px] font-600 uppercase tracking-[0.2em] text-amber-600">
              Achievement Unlocked
            </p>
            <h3 className="mt-2 font-serif text-2xl font-700 text-ink-700">
              {achievementPopup.name}
            </h3>
            <p className="mt-2 font-sans text-sm leading-relaxed text-ink-500">
              {achievementPopup.description}
            </p>
            <button
              onClick={hideAchievementPopup}
              className="mt-6 w-full rounded-lg bg-ink-700 px-4 py-2.5 font-sans text-sm font-500 text-cream-50 transition-colors hover:bg-ink-800"
            >
              继续学习
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

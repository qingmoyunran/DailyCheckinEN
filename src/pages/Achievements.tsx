import { useEffect, useState } from "react";
import {
  Trophy,
  Sparkles,
  Flame,
  Headphones,
  Crown,
  CalendarCheck,
  Medal,
  BookOpen,
  GraduationCap,
  Award,
  Lock,
  TrendingUp,
} from "lucide-react";
import {
  getAchievements,
  getUserAchievements,
  getStreakRecord,
} from "@/services/db";
import type { Achievement } from "@/types";

const iconMap: Record<string, any> = {
  sparkles: Sparkles,
  flame: Flame,
  headphones: Headphones,
  crown: Crown,
  "calendar-check": CalendarCheck,
  medal: Medal,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  award: Award,
  trophy: Trophy,
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set());
  const [unlockedTimes, setUnlockedTimes] = useState<Map<number, number>>(
    new Map()
  );
  const [streak, setStreak] = useState({ current_streak: 0, max_streak: 0 });

  useEffect(() => {
    const achs = getAchievements();
    setAchievements(achs);
    const userAchs = getUserAchievements();
    setUnlockedIds(new Set(userAchs.map((a) => a.achievement_id)));
    setUnlockedTimes(
      new Map(userAchs.map((a) => [a.achievement_id, a.unlocked_at]))
    );
    setStreak(getStreakRecord());
  }, []);

  const unlockedCount = unlockedIds.size;
  const totalCount = achievements.length;
  const progressPercent =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // 按类型分组
  const groups: Record<string, Achievement[]> = {};
  achievements.forEach((a) => {
    if (!groups[a.condition_type]) groups[a.condition_type] = [];
    groups[a.condition_type].push(a);
  });

  const groupLabels: Record<string, string> = {
    consecutive_correct: "连续答对",
    study_days: "学习坚持",
    lessons_completed: "课时完成",
    questions_answered: "答题数量",
    perfect_course: "满分挑战",
  };

  return (
    <div className="animate-fade-in">
      {/* 标题区 */}
      <div className="mb-6">
        <p className="font-display text-sm italic text-ink-400">Achievements</p>
        <h1 className="mt-1 font-serif text-3xl font-700 text-ink-700">成就中心</h1>
        <p className="mt-2 font-sans text-sm text-ink-400">
          挑战自我，解锁更多荣誉徽章
        </p>
      </div>

      {/* 总览卡片 */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {/* 解锁进度 */}
        <div className="col-span-2 rounded-2xl border border-ink-100 bg-gradient-to-br from-ink-700 to-ink-800 p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-xs italic text-cream-200/60">
                Overall Progress
              </p>
              <h3 className="mt-1 font-serif text-2xl font-600 text-cream-50">
                成就解锁进度
              </h3>
              <p className="mt-1 font-sans text-sm text-cream-200/70">
                已解锁 {unlockedCount} / {totalCount} 个成就
              </p>
            </div>
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-cream-50/15"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={`${(progressPercent / 100) * 213.6} 213.6`}
                  strokeLinecap="round"
                  className="text-amber-400"
                />
              </svg>
              <span className="font-display text-lg font-700 text-cream-50">
                {progressPercent}%
              </span>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-cream-50/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 连续答对 */}
        <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100/40 p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-xs italic text-amber-700/70">
                Current Streak
              </p>
              <h3 className="mt-1 font-serif text-lg font-600 text-amber-800">
                连续答对
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 achievement-glow">
              <Flame className="h-6 w-6 text-cream-50" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-700 text-amber-700">
              {streak.current_streak}
            </span>
            <span className="font-sans text-sm text-amber-600">题</span>
          </div>
          <p className="mt-1 font-sans text-xs text-amber-600/70">
            历史最高：{streak.max_streak} 题
          </p>
        </div>
      </div>

      {/* 成就分组展示 */}
      <div className="space-y-8">
        {Object.entries(groups).map(([type, achs]) => (
          <div key={type}>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-ink-400" strokeWidth={1.5} />
              <h2 className="font-serif text-lg font-600 text-ink-700">
                {groupLabels[type] || type}
              </h2>
              <span className="font-sans text-xs text-ink-400">
                · {achs.filter((a) => unlockedIds.has(a.id)).length} / {achs.length}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {achs.map((ach) => {
                const isUnlocked = unlockedIds.has(ach.id);
                const Icon = iconMap[ach.icon] || Trophy;
                const unlockedAt = unlockedTimes.get(ach.id);

                return (
                  <div
                    key={ach.id}
                    className={`relative overflow-hidden rounded-xl border p-5 transition-all ${
                      isUnlocked
                        ? "border-amber-200 bg-gradient-to-br from-amber-50 to-cream-50 card-shadow"
                        : "border-ink-100 bg-cream-100/30"
                    }`}
                  >
                    {/* 装饰 */}
                    {isUnlocked && (
                      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-300/10 blur-2xl" />
                    )}

                    <div className="relative">
                      {/* 图标 */}
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
                          isUnlocked
                            ? "bg-gradient-to-br from-amber-300 to-amber-500 achievement-glow"
                            : "bg-ink-100"
                        }`}
                      >
                        {isUnlocked ? (
                          <Icon className="h-7 w-7 text-cream-50" strokeWidth={1.5} />
                        ) : (
                          <Lock className="h-6 w-6 text-ink-300" strokeWidth={1.5} />
                        )}
                      </div>

                      {/* 信息 */}
                      <h3
                        className={`mt-3 font-serif text-base font-600 ${
                          isUnlocked ? "text-ink-700" : "text-ink-400"
                        }`}
                      >
                        {ach.name}
                      </h3>
                      <p
                        className={`mt-1 font-sans text-xs leading-relaxed ${
                          isUnlocked ? "text-ink-500" : "text-ink-300"
                        }`}
                      >
                        {ach.description}
                      </p>

                      {/* 解锁时间 */}
                      {isUnlocked && unlockedAt && (
                        <p className="mt-3 font-sans text-[10px] text-amber-600/70">
                          解锁于{" "}
                          {new Date(unlockedAt).toLocaleDateString("zh-CN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

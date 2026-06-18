import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Flame,
  Target,
  ArrowRight,
  BookOpen,
  Trophy,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  getCoursesWithProgress,
  getTodayStats,
  getWeeklyAccuracy,
  getStudyStreakDays,
  getUserAchievements,
  getAchievements,
  getLessonsWithProgress,
} from "@/services/db";
import type { CourseWithProgress, LessonWithProgress } from "@/types";
import DifficultyBadge from "@/components/ui/DifficultyBadge";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    study_time: 0,
    questions_answered: 0,
    correct_count: 0,
  });
  const [weeklyAccuracy, setWeeklyAccuracy] = useState(0);
  const [studyDays, setStudyDays] = useState(0);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [continueLesson, setContinueLesson] = useState<{
    course: CourseWithProgress;
    lesson: LessonWithProgress | null;
  } | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<
    { name: string; description: string; icon: string; unlocked_at: number }[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const stats = getTodayStats();
    setTodayStats(stats);

    setWeeklyAccuracy(getWeeklyAccuracy());
    setStudyDays(getStudyStreakDays());

    const allCourses = getCoursesWithProgress();
    setCourses(allCourses);

    // 找到继续学习的课程（有进行中的课时）
    let foundContinue: typeof continueLesson = null;
    for (const course of allCourses) {
      const lessons = getLessonsWithProgress(course.id);
      const inProgress = lessons.find((l) => l.status === "in_progress");
      const notStarted = lessons.find((l) => l.status === "not_started");
      const target = inProgress || notStarted;
      if (target) {
        foundContinue = { course, lesson: target };
        break;
      }
    }
    if (!foundContinue && allCourses.length > 0) {
      foundContinue = { course: allCourses[0], lesson: null };
    }
    setContinueLesson(foundContinue);

    // 最近成就
    const userAchs = getUserAchievements();
    const allAchs = getAchievements();
    const recent = userAchs
      .map((ua) => {
        const ach = allAchs.find((a) => a.id === ua.achievement_id);
        return ach
          ? { ...ach, unlocked_at: ua.unlocked_at }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b!.unlocked_at - a!.unlocked_at))
      .slice(0, 3) as typeof recentAchievements;
    setRecentAchievements(recent);

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}min${sec}s` : `${min}min`;
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了";
    if (hour < 12) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-700" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* 欢迎区 */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-display text-sm italic text-ink-400">{dateStr}</p>
          <h1 className="mt-1 font-serif text-4xl font-700 text-ink-700">
            {greeting()}，继续你的听力之旅
          </h1>
          <p className="mt-2 font-sans text-sm text-ink-400">
            每天进步一点点，让英语听力成为你的优势
          </p>
        </div>
      </div>

      {/* 数据卡片 */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          label="今日学习"
          value={formatTime(todayStats.study_time)}
          sublabel=""
          color="ink"
        />
        <StatCard
          icon={Flame}
          label="连续打卡"
          value={`${studyDays}`}
          sublabel="天"
          color="amber"
        />
        <StatCard
          icon={Target}
          label="本周正确率"
          value={`${weeklyAccuracy}%`}
          sublabel="答题准确度"
          color="easy"
        />
      </div>

      {/* 继续学习 */}
      {continueLesson && (
        <div className="mb-8">
          <SectionHeader title="继续学习" link="/library" />
          <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br from-ink-700 to-ink-800 p-6 card-shadow">
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-amber-400/10 blur-2xl" />
            <div className="relative flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={continueLesson.course.difficulty} />
                  <span className="font-sans text-xs text-cream-200/60">
                    {continueLesson.course.category}
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-2xl font-600 text-cream-50">
                  {continueLesson.course.title}
                </h3>
                {continueLesson.lesson && (
                  <p className="mt-1 font-sans text-sm text-cream-200/70">
                    下一课时：{continueLesson.lesson.title}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-1.5 w-40 overflow-hidden rounded-full bg-cream-50/20">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${continueLesson.course.progress_percent}%` }}
                    />
                  </div>
                  <span className="font-sans text-xs text-cream-200/80">
                    {continueLesson.course.progress_percent}%
                  </span>
                </div>
              </div>
              <Link
                to={`/learn/${continueLesson.course.id}`}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-sans text-sm font-600 text-ink-800 transition-all hover:bg-amber-300 hover:shadow-lg"
              >
                继续学习
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 推荐课程 */}
      <div className="mb-8">
        <SectionHeader title="推荐课程" link="/library" />
        <div className="grid grid-cols-3 gap-4">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* 最近成就 */}
      <div className="mb-8">
        <SectionHeader title="最近成就" link="/achievements" />
        {recentAchievements.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {recentAchievements.map((ach, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-amber-200/50 bg-amber-50/40 p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 achievement-glow">
                  <Sparkles className="h-5 w-5 text-cream-50" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-serif text-sm font-600 text-ink-700">
                    {ach.name}
                  </p>
                  <p className="font-sans text-xs text-ink-400">
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-ink-200 bg-cream-50/50 p-8 text-center">
            <Trophy className="mx-auto h-8 w-8 text-ink-200" strokeWidth={1.5} />
            <p className="mt-2 font-sans text-sm text-ink-400">
              还没有解锁成就，快去答题挑战吧！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  sublabel: string;
  color: "ink" | "amber" | "easy";
}) {
  const colorMap = {
    ink: "from-ink-50 to-ink-100 text-ink-700",
    amber: "from-amber-50 to-amber-100/50 text-amber-700",
    easy: "from-easy/5 to-easy/10 text-easy-dark",
  };
  const iconColorMap = {
    ink: "text-ink-500 bg-ink-50",
    amber: "text-amber-600 bg-amber-50",
    easy: "text-easy-dark bg-easy/10",
  };

  return (
    <div className={`rounded-xl border border-ink-100 bg-gradient-to-br ${colorMap[color]} p-5 card-shadow`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconColorMap[color]}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-ink-300">
          {label}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-3xl font-700">{value}</span>
        <span className="font-sans text-xs text-ink-400">{sublabel}</span>
      </div>
    </div>
  );
}

function SectionHeader({ title, link }: { title: string; link: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-serif text-lg font-600 text-ink-700">{title}</h2>
      <Link
        to={link}
        className="flex items-center gap-1 font-sans text-xs text-ink-400 hover:text-ink-700 transition-colors"
      >
        查看全部
        <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
      </Link>
    </div>
  );
}

function CourseCard({ course }: { course: CourseWithProgress }) {
  return (
    <Link
      to={`/learn/${course.id}`}
      className="group block rounded-xl border border-ink-100 bg-cream-50 p-5 card-shadow card-shadow-hover"
    >
      <div className="flex items-center justify-between">
        <DifficultyBadge difficulty={course.difficulty} />
        <BookOpen className="h-4 w-4 text-ink-300" strokeWidth={1.5} />
      </div>
      <h3 className="mt-3 font-serif text-base font-600 leading-snug text-ink-700 group-hover:text-ink-800">
        {course.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 font-sans text-xs leading-relaxed text-ink-400">
        {course.description}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-sans text-[11px] text-ink-400">
          {course.total_lessons} 课时
        </span>
        <div className="flex items-center gap-2">
          <div className="h-1 w-16 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{ width: `${course.progress_percent}%` }}
            />
          </div>
          <span className="font-sans text-[11px] font-500 text-ink-500">
            {course.progress_percent}%
          </span>
        </div>
      </div>
    </Link>
  );
}

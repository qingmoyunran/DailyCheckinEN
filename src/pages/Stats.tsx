import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Clock,
  Target,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Award,
  Flame,
} from "lucide-react";
import {
  getStatsRange,
  getStreakRecord,
  getTotalQuestionsAnswered,
  getCompletedLessonsCount,
  getStudyDaysCount,
} from "@/services/db";
import type { StudyStats } from "@/types";

export default function Stats() {
  const [stats30, setStats30] = useState<StudyStats[]>([]);
  const [streak, setStreak] = useState({ current_streak: 0, max_streak: 0 });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [studyDays, setStudyDays] = useState(0);

  useEffect(() => {
    setStats30(getStatsRange(30));
    setStreak(getStreakRecord());
    setTotalQuestions(getTotalQuestionsAnswered());
    setCompletedLessons(getCompletedLessonsCount());
    setStudyDays(getStudyDaysCount());
  }, []);

  // 学习时长图表数据
  const timeChartData = useMemo(() => {
    return stats30.slice(-14).map((s) => ({
      date: s.date.slice(5).replace("-", "/"),
      time: Math.round(s.study_time / 60),
    }));
  }, [stats30]);

  // 正确率图表数据
  const accuracyChartData = useMemo(() => {
    return stats30.slice(-7).map((s) => {
      const rate =
        s.questions_answered > 0
          ? Math.round((s.correct_count / s.questions_answered) * 100)
          : 0;
      return {
        date: s.date.slice(5).replace("-", "/"),
        rate,
        answered: s.questions_answered,
      };
    });
  }, [stats30]);

  // 打卡日历数据（最近 35 天）
  const calendarData = useMemo(() => {
    return stats30.slice(-35).map((s) => ({
      date: s.date,
      day: s.date.slice(8),
      active: s.study_time > 0,
      intensity: s.study_time > 0 ? Math.min(Math.ceil(s.study_time / 300), 4) : 0,
    }));
  }, [stats30]);

  // 总学习时长（分钟）
  const totalMinutes = stats30.reduce((sum, s) => sum + s.study_time, 0);
  const totalHours = (totalMinutes / 3600).toFixed(1);

  // 平均正确率
  const totalAnswered = stats30.reduce((sum, s) => sum + s.questions_answered, 0);
  const totalCorrect = stats30.reduce((sum, s) => sum + s.correct_count, 0);
  const avgAccuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="animate-fade-in">
      {/* 标题区 */}
      <div className="mb-6">
        <p className="font-display text-sm italic text-ink-400">Statistics</p>
        <h1 className="mt-1 font-serif text-3xl font-700 text-ink-700">学习统计</h1>
        <p className="mt-2 font-sans text-sm text-ink-400">
          追踪你的学习进度，发现进步的轨迹
        </p>
      </div>

      {/* 总览数据 */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <SummaryCard
          icon={Clock}
          label="总学习时长"
          value={totalHours}
          unit="小时"
          color="ink"
        />
        <SummaryCard
          icon={Flame}
          label="连续打卡"
          value={`${streak.current_streak}`}
          unit="天"
          color="amber"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="总答题数"
          value={`${totalQuestions}`}
          unit="题"
          color="easy"
        />
        <SummaryCard
          icon={Target}
          label="平均正确率"
          value={`${avgAccuracy}`}
          unit="%"
          color="medium"
        />
      </div>

      {/* 学习时长趋势 */}
      <div className="mb-6 rounded-2xl border border-ink-100 bg-cream-50 p-6 card-shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-600 text-ink-700">
              学习时长趋势
            </h2>
            <p className="font-sans text-xs text-ink-400">最近 14 天每日学习时长（分钟）</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
            <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={timeChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A2B4A" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#1A2B4A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9DB0D1", fontFamily: "Plus Jakarta Sans" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9DB0D1", fontFamily: "Plus Jakarta Sans" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FAF6EE",
                border: "1px solid #C9D4E8",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "Plus Jakarta Sans",
              }}
              labelStyle={{ color: "#1A2B4A", fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#1A2B4A"
              strokeWidth={2}
              dot={{ fill: "#D4A24C", r: 3 }}
              activeDot={{ r: 5, fill: "#1A2B4A" }}
              fill="url(#timeGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 正确率 */}
        <div className="rounded-2xl border border-ink-100 bg-cream-50 p-6 card-shadow">
          <div className="mb-4">
            <h2 className="font-serif text-lg font-600 text-ink-700">
              本周正确率
            </h2>
            <p className="font-sans text-xs text-ink-400">最近 7 天答题正确率</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={accuracyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9DB0D1", fontFamily: "Plus Jakarta Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#9DB0D1", fontFamily: "Plus Jakarta Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FAF6EE",
                  border: "1px solid #C9D4E8",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "Plus Jakarta Sans",
                }}
                labelStyle={{ color: "#1A2B4A", fontWeight: 600 }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {accuracyChartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.rate >= 80
                        ? "#6B9E78"
                        : entry.rate >= 60
                        ? "#D4A24C"
                        : entry.rate > 0
                        ? "#C8553D"
                        : "#E8EDF5"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 打卡日历 */}
        <div className="rounded-2xl border border-ink-100 bg-cream-50 p-6 card-shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-600 text-ink-700">
                打卡日历
              </h2>
              <p className="font-sans text-xs text-ink-400">最近 30 天学习记录</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-[10px] text-ink-400">少</span>
              <div className="h-3 w-3 rounded-sm bg-cream-200" />
              <div className="h-3 w-3 rounded-sm bg-amber-200" />
              <div className="h-3 w-3 rounded-sm bg-amber-300" />
              <div className="h-3 w-3 rounded-sm bg-amber-400" />
              <div className="h-3 w-3 rounded-sm bg-amber-600" />
              <span className="font-sans text-[10px] text-ink-400">多</span>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {calendarData.map((day, idx) => {
              const bgClass =
                day.intensity === 0
                  ? "bg-cream-200"
                  : day.intensity === 1
                  ? "bg-amber-200"
                  : day.intensity === 2
                  ? "bg-amber-300"
                  : day.intensity === 3
                  ? "bg-amber-400"
                  : "bg-amber-600";
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded ${bgClass} transition-all hover:scale-110 cursor-default`}
                  title={`${day.date} ${day.active ? "已学习" : "未学习"}`}
                />
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink-50 pt-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-ink-400" strokeWidth={1.5} />
              <span className="font-sans text-xs text-ink-500">
                累计学习 {studyDays} 天
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
              <span className="font-sans text-xs text-ink-500">
                完成 {completedLessons} 课时
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  unit: string;
  color: "ink" | "amber" | "easy" | "medium";
}) {
  const colorMap = {
    ink: { bg: "bg-ink-50", text: "text-ink-600", value: "text-ink-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", value: "text-amber-700" },
    easy: { bg: "bg-easy/10", text: "text-easy-dark", value: "text-easy-dark" },
    medium: { bg: "bg-medium/10", text: "text-medium-dark", value: "text-medium-dark" },
  };
  const c = colorMap[color];

  return (
    <div className="rounded-xl border border-ink-100 bg-cream-50 p-5 card-shadow">
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
          <Icon className={`h-[18px] w-[18px] ${c.text}`} strokeWidth={1.5} />
        </div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-ink-300">
          {label}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={`font-display text-2xl font-700 ${c.value}`}>{value}</span>
        <span className="font-sans text-xs text-ink-400">{unit}</span>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Plus, ArrowRight } from "lucide-react";
import { getCoursesWithProgress } from "@/services/db";
import { useLearnStore } from "@/store/useLearnStore";
import type { CourseWithProgress, Difficulty } from "@/types";
import { DIFFICULTY_LABELS } from "@/types";
import DifficultyBadge from "@/components/ui/DifficultyBadge";

type FilterType = "all" | Difficulty;

export default function Library() {
  const { filterDifficulty, setFilterDifficulty } = useLearnStore();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setCourses(getCoursesWithProgress());
    setLoading(false);
  };

  const filtered = courses.filter((c) => {
    const matchDifficulty =
      filterDifficulty === "all" || c.difficulty === filterDifficulty;
    const matchSearch =
      !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDifficulty && matchSearch;
  });

  const filters: { value: FilterType; label: string; color?: string }[] = [
    { value: "all", label: "全部" },
    { value: "simple", label: DIFFICULTY_LABELS.simple },
    { value: "medium", label: DIFFICULTY_LABELS.medium },
    { value: "hard", label: DIFFICULTY_LABELS.hard },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-700" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* 标题区 */}
      <div className="mb-6">
        <p className="font-display text-sm italic text-ink-400">Course Library</p>
        <h1 className="mt-1 font-serif text-3xl font-700 text-ink-700">课程库</h1>
        <p className="mt-2 font-sans text-sm text-ink-400">
          按难度分级，找到适合你的听力课程
        </p>
      </div>

      {/* 筛选与搜索 */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-xl border border-ink-100 bg-cream-50 p-1">
          {filters.map((f) => {
            const isActive = filterDifficulty === f.value;
            const activeColor =
              f.value === "simple"
                ? "bg-easy text-cream-50"
                : f.value === "medium"
                ? "bg-medium text-cream-50"
                : f.value === "hard"
                ? "bg-hard text-cream-50"
                : "bg-ink-700 text-cream-50";
            return (
              <button
                key={f.value}
                onClick={() => setFilterDifficulty(f.value)}
                className={`rounded-lg px-4 py-2 font-sans text-sm font-500 transition-all ${
                  isActive
                    ? activeColor
                    : "text-ink-500 hover:text-ink-700"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索课程..."
            className="w-64 rounded-xl border border-ink-100 bg-cream-50 py-2.5 pl-9 pr-4 font-sans text-sm text-ink-700 placeholder:text-ink-300 focus:border-ink-300 transition-colors"
          />
        </div>
      </div>

      {/* 课程网格 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((course) => (
            <Link
              key={course.id}
              to={`/learn/${course.id}`}
              className="group flex flex-col rounded-2xl border border-ink-100 bg-cream-50 p-6 card-shadow card-shadow-hover"
            >
              {/* 顶部 */}
              <div className="mb-4 flex items-start justify-between">
                <DifficultyBadge difficulty={course.difficulty} size="md" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-ink-400 group-hover:bg-ink-700 group-hover:text-cream-50 transition-colors">
                  <BookOpen className="h-5 w-5" strokeWidth={1.5} />
                </div>
              </div>

              {/* 标题 */}
              <h3 className="font-serif text-lg font-600 leading-snug text-ink-700 group-hover:text-ink-800">
                {course.title}
              </h3>
              <p className="mt-2 line-clamp-2 flex-1 font-sans text-xs leading-relaxed text-ink-400">
                {course.description}
              </p>

              {/* 底部信息 */}
              <div className="mt-4 border-t border-ink-50 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-xs text-ink-400">
                      {course.total_lessons} 课时
                    </span>
                    <span className="font-sans text-xs text-ink-300">·</span>
                    <span className="font-sans text-xs text-ink-400">
                      {course.category}
                    </span>
                  </div>
                  <span className="font-sans text-xs font-500 text-ink-500">
                    {course.progress_percent}%
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${course.progress_percent}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-cream-50/50 p-16 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-ink-200" strokeWidth={1.5} />
          <p className="mt-3 font-serif text-lg text-ink-500">
            {searchTerm ? "未找到匹配的课程" : "暂无课程"}
          </p>
          <p className="mt-1 font-sans text-sm text-ink-400">
            {searchTerm
              ? "试试其他关键词"
              : "前往真题录入页面添加高考听力题目"}
          </p>
          <Link
            to="/admin"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink-700 px-4 py-2 font-sans text-sm text-cream-50 hover:bg-ink-800 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            录入真题
          </Link>
        </div>
      )}
    </div>
  );
}

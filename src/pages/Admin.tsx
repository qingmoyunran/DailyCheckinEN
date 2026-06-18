import { useEffect, useState } from "react";
import {
  PenSquare,
  Plus,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Upload,
  Check,
} from "lucide-react";
import {
  getCourses,
  addCourse,
  addLesson,
  addQuestion,
  getLessons,
  getQuestions,
  deleteQuestion,
  deleteCourse,
} from "@/services/db";
import { useAppStore } from "@/store/useAppStore";
import { useLearnStore } from "@/store/useLearnStore";
import type { Course, Lesson, Question, Difficulty } from "@/types";
import { DIFFICULTY_LABELS } from "@/types";
import DifficultyBadge from "@/components/ui/DifficultyBadge";

export default function Admin() {
  const { showNotification, hideNotification } = useAppStore();
  const { triggerRefresh } = useLearnStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // 表单状态
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const loadData = () => {
    setCourses(getCourses());
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadLessons = (courseId: number) => {
    const ls = getLessons(courseId);
    setLessons(ls);
    if (ls.length > 0 && !selectedLessonId) {
      setSelectedLessonId(ls[0].id);
    }
  };

  const loadQuestions = (lessonId: number) => {
    setQuestions(getQuestions(lessonId));
  };

  const handleExpand = (courseId: number) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
    } else {
      setExpandedCourseId(courseId);
      loadLessons(courseId);
      setSelectedCourseId(courseId);
    }
  };

  const handleDeleteQuestion = (id: number) => {
    deleteQuestion(id);
    if (selectedLessonId) loadQuestions(selectedLessonId);
    showNotification("题目已删除", "success");
    triggerRefresh();
  };

  const handleDeleteCourse = (id: number) => {
    if (confirm("确定删除该课程及其所有课时和题目吗？")) {
      deleteCourse(id);
      loadData();
      showNotification("课程已删除", "success");
      triggerRefresh();
    }
  };

  return (
    <div className="animate-fade-in">
      {/* 标题区 */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-display text-sm italic text-ink-400">Admin Panel</p>
          <h1 className="mt-1 font-serif text-3xl font-700 text-ink-700">
            真题录入
          </h1>
          <p className="mt-2 font-sans text-sm text-ink-400">
            录入高考听力真题，构建你的专属题库
          </p>
        </div>
        <button
          onClick={() => {
            setShowCourseForm(true);
            setShowQuestionForm(false);
          }}
          className="flex items-center gap-2 rounded-xl bg-ink-700 px-4 py-2.5 font-sans text-sm font-500 text-cream-50 hover:bg-ink-800 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          新建课程
        </button>
      </div>

      {/* 课程表单 */}
      {showCourseForm && (
        <CourseForm
          onSave={(data) => {
            addCourse(data);
            loadData();
            setShowCourseForm(false);
            showNotification("课程创建成功", "success");
            triggerRefresh();
          }}
          onCancel={() => setShowCourseForm(false)}
        />
      )}

      {/* 题目录入表单 */}
      {showQuestionForm && selectedCourseId && (
        <QuestionForm
          courses={courses}
          lessons={lessons}
          defaultCourseId={selectedCourseId}
          defaultLessonId={selectedLessonId}
          onSave={(data) => {
            addQuestion(data);
            if (selectedLessonId) loadQuestions(selectedLessonId);
            setShowQuestionForm(false);
            showNotification("题目录入成功", "success");
            triggerRefresh();
          }}
          onCancel={() => setShowQuestionForm(false)}
          onCourseChange={(cid) => {
            loadLessons(cid);
            setSelectedLessonId(null);
          }}
          onAddLesson={(title) => {
            if (selectedCourseId) {
              addLesson({
                course_id: selectedCourseId,
                title,
                script_text: "",
                audio_url: "",
                duration: 0,
              });
              loadLessons(selectedCourseId);
              showNotification("课时已创建", "success");
            }
          }}
        />
      )}

      {/* 课程列表 */}
      <div className="space-y-3">
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-cream-50/50 p-16 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-ink-200" strokeWidth={1.5} />
            <p className="mt-3 font-serif text-lg text-ink-500">暂无课程</p>
            <p className="mt-1 font-sans text-sm text-ink-400">
              点击右上角"新建课程"开始录入真题
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="overflow-hidden rounded-xl border border-ink-100 bg-cream-50"
            >
              {/* 课程头部 */}
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => handleExpand(course.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  {expandedCourseId === course.id ? (
                    <ChevronDown className="h-4 w-4 text-ink-400" strokeWidth={1.5} />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-ink-400" strokeWidth={1.5} />
                  )}
                  <DifficultyBadge difficulty={course.difficulty} />
                  <div>
                    <h3 className="font-serif text-base font-600 text-ink-700">
                      {course.title}
                    </h3>
                    <p className="font-sans text-xs text-ink-400">
                      {course.category} · {course.total_lessons} 课时
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      loadLessons(course.id);
                      setShowQuestionForm(true);
                      setShowCourseForm(false);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-ink-100 bg-cream-100 px-3 py-1.5 font-sans text-xs font-500 text-ink-600 hover:bg-ink-50 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                    添加题目
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 hover:bg-hard/10 hover:text-hard transition-colors"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* 展开内容 - 课时与题目 */}
              {expandedCourseId === course.id && (
                <div className="border-t border-ink-50 bg-cream-100/30 p-4">
                  {lessons.length === 0 ? (
                    <p className="py-4 text-center font-sans text-sm text-ink-400">
                      暂无课时，请在添加题目时创建
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {lessons.map((lesson) => {
                        const qs = getQuestions(lesson.id);
                        return (
                          <LessonQuestionList
                            key={lesson.id}
                            lesson={lesson}
                            questions={qs}
                            onDeleteQuestion={handleDeleteQuestion}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============ 课程表单 ============
function CourseForm({
  onSave,
  onCancel,
}: {
  onSave: (data: {
    title: string;
    description: string;
    difficulty: Difficulty;
    category: string;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("simple");
  const [category, setCategory] = useState("高考真题");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({ title, description, difficulty, category });
  };

  return (
    <div className="mb-6 rounded-xl border border-ink-100 bg-cream-50 p-6 animate-slide-up">
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-ink-500" strokeWidth={1.5} />
        <h3 className="font-serif text-lg font-600 text-ink-700">新建课程</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
            课程标题
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：2024 高考听力真题精讲"
            className="w-full rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2.5 font-sans text-sm text-ink-700 placeholder:text-ink-300 focus:border-ink-300"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
            难度等级
          </label>
          <div className="flex gap-2">
            {(["simple", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-lg border px-3 py-2 font-sans text-sm font-500 transition-all ${
                  difficulty === d
                    ? d === "simple"
                      ? "border-easy bg-easy/10 text-easy-dark"
                      : d === "medium"
                      ? "border-medium bg-medium/10 text-medium-dark"
                      : "border-hard bg-hard/10 text-hard-dark"
                    : "border-ink-100 bg-cream-100/50 text-ink-400"
                }`}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
            分类
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="如：高考真题"
            className="w-full rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2.5 font-sans text-sm text-ink-700 placeholder:text-ink-300 focus:border-ink-300"
          />
        </div>
        <div className="col-span-2">
          <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
            课程描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简要描述课程内容..."
            rows={2}
            className="w-full resize-none rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2.5 font-sans text-sm text-ink-700 placeholder:text-ink-300 focus:border-ink-300"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 font-sans text-sm text-ink-400 hover:text-ink-700 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="rounded-lg bg-ink-700 px-5 py-2 font-sans text-sm font-500 text-cream-50 hover:bg-ink-800 disabled:opacity-40 transition-all"
        >
          创建
        </button>
      </div>
    </div>
  );
}

// ============ 题目表单 ============
function QuestionForm({
  courses,
  lessons,
  defaultCourseId,
  defaultLessonId,
  onSave,
  onCancel,
  onCourseChange,
  onAddLesson,
}: {
  courses: Course[];
  lessons: Lesson[];
  defaultCourseId: number;
  defaultLessonId: number | null;
  onSave: (data: Omit<Question, "id">) => void;
  onCancel: () => void;
  onCourseChange: (cid: number) => void;
  onAddLesson: (title: string) => void;
}) {
  const [courseId, setCourseId] = useState(defaultCourseId);
  const [lessonId, setLessonId] = useState(defaultLessonId || 0);
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  const handleSubmit = () => {
    if (!questionText.trim() || !lessonId) return;
    onSave({
      lesson_id: lessonId,
      question_text: questionText,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
      audio_url: "",
      explanation,
      year,
    });
  };

  return (
    <div className="mb-6 rounded-xl border border-ink-100 bg-cream-50 p-6 animate-slide-up">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-ink-500" strokeWidth={1.5} />
        <h3 className="font-serif text-lg font-600 text-ink-700">录入题目</h3>
      </div>

      <div className="space-y-4">
        {/* 课程与课时选择 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
              所属课程
            </label>
            <select
              value={courseId}
              onChange={(e) => {
                const cid = parseInt(e.target.value);
                setCourseId(cid);
                onCourseChange(cid);
                setLessonId(0);
              }}
              className="w-full rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2.5 font-sans text-sm text-ink-700 focus:border-ink-300"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
              所属课时
            </label>
            <div className="flex gap-2">
              <select
                value={lessonId}
                onChange={(e) => setLessonId(parseInt(e.target.value))}
                className="flex-1 rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2.5 font-sans text-sm text-ink-700 focus:border-ink-300"
              >
                <option value={0}>请选择课时</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowNewLesson(!showNewLesson)}
                className="flex items-center justify-center rounded-lg border border-ink-100 bg-cream-100/50 px-3 text-ink-500 hover:bg-ink-50 transition-colors"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            {showNewLesson && (
              <div className="mt-2 flex gap-2">
                <input
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="新课时标题"
                  className="flex-1 rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2 font-sans text-xs text-ink-700 placeholder:text-ink-300 focus:border-ink-300"
                />
                <button
                  onClick={() => {
                    if (newLessonTitle.trim()) {
                      onAddLesson(newLessonTitle);
                      setNewLessonTitle("");
                      setShowNewLesson(false);
                    }
                  }}
                  className="rounded-lg bg-ink-700 px-3 py-2 font-sans text-xs text-cream-50 hover:bg-ink-800"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 题干 */}
        <div>
          <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
            题目内容
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="如：What does the man mean?"
            rows={2}
            className="w-full resize-none rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2.5 font-sans text-sm text-ink-700 placeholder:text-ink-300 focus:border-ink-300"
          />
        </div>

        {/* 选项 */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "A", value: optionA, set: setOptionA },
            { label: "B", value: optionB, set: setOptionB },
            { label: "C", value: optionC, set: setOptionC },
            { label: "D", value: optionD, set: setOptionD },
          ].map((opt) => (
            <div key={opt.label} className="relative">
              <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
                选项 {opt.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={opt.value}
                  onChange={(e) => opt.set(e.target.value)}
                  placeholder={`选项 ${opt.label} 内容`}
                  className="w-full rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2 pl-9 font-sans text-sm text-ink-700 placeholder:text-ink-300 focus:border-ink-300"
                />
                <button
                  onClick={() => setCorrectAnswer(opt.label)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-600 transition-all ${
                    correctAnswer === opt.label
                      ? "bg-easy text-cream-50"
                      : "bg-cream-200 text-ink-400 hover:bg-cream-300"
                  }`}
                  title="设为正确答案"
                >
                  {correctAnswer === opt.label ? (
                    <Check className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    opt.label
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 年份与解析 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
              年份
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2.5 font-sans text-sm text-ink-700 focus:border-ink-300"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1.5 block font-sans text-xs font-500 text-ink-500">
              答案解析
            </label>
            <input
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="解析说明（可选）"
              className="w-full rounded-lg border border-ink-100 bg-cream-100/50 px-3 py-2.5 font-sans text-sm text-ink-700 placeholder:text-ink-300 focus:border-ink-300"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 font-sans text-sm text-ink-400 hover:text-ink-700 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!questionText.trim() || !lessonId}
          className="rounded-lg bg-ink-700 px-5 py-2 font-sans text-sm font-500 text-cream-50 hover:bg-ink-800 disabled:opacity-40 transition-all"
        >
          保存题目
        </button>
      </div>
    </div>
  );
}

// ============ 课时题目列表 ============
function LessonQuestionList({
  lesson,
  questions,
  onDeleteQuestion,
}: {
  lesson: Lesson;
  questions: Question[];
  onDeleteQuestion: (id: number) => void;
}) {
  return (
    <div className="rounded-lg border border-ink-50 bg-cream-50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-100 font-display text-[10px] font-600 text-ink-500">
          {lesson.order_num + 1}
        </span>
        <span className="font-sans text-sm font-500 text-ink-700">
          {lesson.title}
        </span>
        <span className="font-sans text-xs text-ink-400">
          · {questions.length} 题
        </span>
      </div>
      {questions.length > 0 ? (
        <div className="space-y-1.5 pl-7">
          {questions.map((q) => (
            <div
              key={q.id}
              className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-cream-100/50"
            >
              <span className="font-sans text-xs text-ink-400">
                {q.year || "—"} ·
              </span>
              <span className="flex-1 truncate font-sans text-xs text-ink-600">
                {q.question_text}
              </span>
              <span className="rounded bg-easy/10 px-1.5 py-0.5 font-display text-[10px] font-600 text-easy-dark">
                {q.correct_answer}
              </span>
              <button
                onClick={() => onDeleteQuestion(q.id)}
                className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-hard transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="pl-7 py-1 font-sans text-xs text-ink-300">暂无题目</p>
      )}
    </div>
  );
}

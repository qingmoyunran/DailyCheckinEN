import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  Headphones,
  Mic,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Gauge,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  getCourse,
  getLessonsWithProgress,
  getQuestions,
  updateProgress,
  recordAnswer,
  recordStudyTime,
} from "@/services/db";
import { updateConsecutiveCorrect, checkOnLessonComplete } from "@/services/achievement";
import { createRecognition, calculateSimilarity, getScoreFeedback, isSpeechRecognitionSupported } from "@/services/speech";
import { useAppStore } from "@/store/useAppStore";
import { useLearnStore } from "@/store/useLearnStore";
import type { Course, LessonWithProgress, Question } from "@/types";
import DifficultyBadge from "@/components/ui/DifficultyBadge";

type Mode = "listening" | "speaking";

export default function Learn() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { showAchievementPopup, showNotification } = useAppStore();
  const { mode, setMode, triggerRefresh } = useLearnStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // 答题状态
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // 学习计时
  const startTimeRef = useRef<number>(Date.now());

  const loadData = useCallback(() => {
    if (!courseId) return;
    const cid = parseInt(courseId);
    const c = getCourse(cid);
    if (!c) {
      navigate("/library");
      return;
    }
    setCourse(c);
    const ls = getLessonsWithProgress(cid);
    setLessons(ls);

    if (ls.length > 0) {
      const idx = ls.findIndex((l) => l.status !== "completed");
      const startIdx = idx >= 0 ? idx : 0;
      setCurrentLessonIdx(startIdx);
      setQuestions(getQuestions(ls[startIdx].id));
    }
    setLoading(false);
  }, [courseId, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const switchLesson = (idx: number) => {
    if (idx < 0 || idx >= lessons.length) return;
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (elapsed > 0 && lessons[currentLessonIdx]) {
      recordStudyTime(elapsed);
      updateProgress(lessons[currentLessonIdx].id, "in_progress", 0, elapsed);
    }
    startTimeRef.current = Date.now();
    setCurrentLessonIdx(idx);
    setQuestions(getQuestions(lessons[idx].id));
    setCurrentQIdx(0);
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  const currentLesson = lessons[currentLessonIdx];
  const currentQuestion = questions[currentQIdx];

  const handleSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;
    setSubmitted(true);
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    recordAnswer(isCorrect);
    if (isCorrect) {
      const result = updateConsecutiveCorrect(true);
      if (result.unlocked.length > 0) {
        showAchievementPopup(result.unlocked[0]);
      }
    } else {
      updateConsecutiveCorrect(false);
    }
  };

  const handleNext = () => {
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    } else {
      if (currentLesson) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        updateProgress(currentLesson.id, "completed", 100, elapsed);
        recordStudyTime(elapsed);
        startTimeRef.current = Date.now();
        const newAchs = checkOnLessonComplete();
        if (newAchs.length > 0) showAchievementPopup(newAchs[0]);
        showNotification("课时学习完成！", "success");
        triggerRefresh();
        if (currentLessonIdx < lessons.length - 1) {
          setTimeout(() => switchLesson(currentLessonIdx + 1), 1500);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-700" />
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-cream-50/50 p-16 text-center">
        <Headphones className="mx-auto h-10 w-10 text-ink-200" strokeWidth={1.5} />
        <p className="mt-3 font-serif text-lg text-ink-500">该课程暂无课时</p>
        <Link to="/library" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink-700 px-4 py-2 font-sans text-sm text-cream-50 hover:bg-ink-800 transition-colors">
          返回课程库
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* 顶部导航 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/library" className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-100 bg-cream-50 text-ink-500 hover:text-ink-700 transition-colors">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={course.difficulty} />
              <span className="font-sans text-xs text-ink-400">{course.category}</span>
            </div>
            <h1 className="mt-1 font-serif text-xl font-600 text-ink-700">{course.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-ink-100 bg-cream-50 p-1">
          <button onClick={() => setMode("listening")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-500 transition-all ${mode === "listening" ? "bg-ink-700 text-cream-50" : "text-ink-500 hover:text-ink-700"}`}>
            <Headphones className="h-3.5 w-3.5" strokeWidth={1.5} />
            听力训练
          </button>
          <button onClick={() => setMode("speaking")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-500 transition-all ${mode === "speaking" ? "bg-ink-700 text-cream-50" : "text-ink-500 hover:text-ink-700"}`}>
            <Mic className="h-3.5 w-3.5" strokeWidth={1.5} />
            口语跟读
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 课时列表 */}
        <div className="w-56 shrink-0">
          <p className="mb-3 px-2 font-sans text-[10px] font-600 uppercase tracking-wider text-ink-300">课时列表</p>
          <div className="space-y-1">
            {lessons.map((lesson, idx) => {
              const isActive = idx === currentLessonIdx;
              return (
                <button key={lesson.id} onClick={() => switchLesson(idx)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${isActive ? "bg-ink-700 text-cream-50" : "text-ink-500 hover:bg-cream-200/50"}`}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-600 ${lesson.status === "completed" ? isActive ? "bg-cream-50/20 text-cream-50" : "bg-easy/15 text-easy-dark" : isActive ? "bg-cream-50/20 text-cream-50" : "bg-ink-50 text-ink-400"}`}>
                    {lesson.status === "completed" ? "✓" : idx + 1}
                  </div>
                  <span className="flex-1 truncate font-sans text-xs font-500">{lesson.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1">
          {mode === "listening" ? (
            <ListeningMode
              lesson={currentLesson}
              questions={questions}
              currentQIdx={currentQIdx}
              selectedAnswer={selectedAnswer}
              submitted={submitted}
              showScript={showScript}
              playbackRate={playbackRate}
              onSelectAnswer={setSelectedAnswer}
              onSubmit={handleSubmit}
              onNext={handleNext}
              onToggleScript={() => setShowScript(!showScript)}
              onRateChange={setPlaybackRate}
              onPrevQuestion={() => { if (currentQIdx > 0) { setCurrentQIdx(currentQIdx - 1); setSelectedAnswer(null); setSubmitted(false); } }}
            />
          ) : (
            <SpeakingMode
              lesson={currentLesson}
              playbackRate={playbackRate}
              onRateChange={setPlaybackRate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============ 音频播放器组件 ============
function AudioPlayer({ src, playbackRate }: { src: string; playbackRate: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.preload = "metadata";
    }
    const audio = audioRef.current;
    audio.src = src;
    audio.playbackRate = playbackRate;

    const onTimeUpdate = () => { if (!isDragging) setCurrentTime(audio.currentTime); };
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = percent * duration;
    setCurrentTime(percent * duration);
  };

  const handleProgressDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const handleMove = (moveEvent: MouseEvent) => {
      if (!progressRef.current || !audioRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      setCurrentTime(percent * duration);
    };
    const handleUp = (upEvent: MouseEvent) => {
      setIsDragging(false);
      if (!progressRef.current || !audioRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = upEvent.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      audioRef.current.currentTime = percent * duration;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  };

  const formatTime = (t: number) => {
    if (!isFinite(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
      <div className="flex items-center gap-4">
        {/* 播放/暂停 */}
        <button onClick={togglePlay} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-700 text-cream-50 hover:bg-ink-800 transition-colors">
          {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 ml-0.5" fill="currentColor" />}
        </button>

        {/* 时间 */}
        <span className="font-sans text-xs text-ink-500 w-10 text-right">{formatTime(currentTime)}</span>

        {/* 进度条 */}
        <div
          ref={progressRef}
          className="group relative flex-1 h-6 flex items-center cursor-pointer"
          onClick={handleProgressClick}
          onMouseDown={handleProgressDragStart}
        >
          <div className="h-1.5 w-full rounded-full bg-ink-200 overflow-hidden">
            <div className="h-full rounded-full bg-amber-400 transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          {/* 拖动手柄 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-ink-700 border-2 border-cream-50 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* 总时长 */}
        <span className="font-sans text-xs text-ink-400 w-10">{formatTime(duration)}</span>

        {/* 静音 */}
        <button onClick={() => setIsMuted(!isMuted)} className="text-ink-400 hover:text-ink-700 transition-colors">
          {isMuted ? <VolumeX className="h-4 w-4" strokeWidth={1.5} /> : <Volume2 className="h-4 w-4" strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}

// ============ 听力训练模式 ============
function ListeningMode({
  lesson,
  questions,
  currentQIdx,
  selectedAnswer,
  submitted,
  showScript,
  playbackRate,
  onSelectAnswer,
  onSubmit,
  onNext,
  onToggleScript,
  onRateChange,
  onPrevQuestion,
}: {
  lesson: LessonWithProgress;
  questions: Question[];
  currentQIdx: number;
  selectedAnswer: string | null;
  submitted: boolean;
  showScript: boolean;
  playbackRate: number;
  onSelectAnswer: (a: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onToggleScript: () => void;
  onRateChange: (r: number) => void;
  onPrevQuestion: () => void;
}) {
  const question = questions[currentQIdx];
  const options = [
    { key: "A", text: question?.option_a },
    { key: "B", text: question?.option_b },
    { key: "C", text: question?.option_c },
    { key: "D", text: question?.option_d },
  ].filter((o) => o.text);

  const rates = [0.75, 1, 1.25, 1.5];

  return (
    <div className="space-y-5">
      {/* 课时标题 */}
      <div className="rounded-xl border border-ink-100 bg-cream-50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs italic text-ink-400">Lesson {currentQIdx + 1} / {questions.length}</p>
            <h2 className="mt-1 font-serif text-xl font-600 text-ink-700">{lesson.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-ink-100 bg-cream-100 p-0.5">
              <Gauge className="ml-1.5 h-3.5 w-3.5 text-ink-400" strokeWidth={1.5} />
              {rates.map((r) => (
                <button key={r} onClick={() => onRateChange(r)} className={`rounded px-2 py-1 font-sans text-[11px] font-500 transition-all ${playbackRate === r ? "bg-ink-700 text-cream-50" : "text-ink-400 hover:text-ink-600"}`}>
                  {r}x
                </button>
              ))}
            </div>
            <button onClick={onToggleScript} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-sans text-xs font-500 transition-all ${showScript ? "border-ink-300 bg-ink-50 text-ink-700" : "border-ink-100 bg-cream-100 text-ink-400"}`}>
              {showScript ? <Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> : <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />}
              {showScript ? "隐藏原文" : "显示原文"}
            </button>
          </div>
        </div>
      </div>

      {/* 音频播放器 */}
      {lesson.audio_url && (
        <AudioPlayer src={lesson.audio_url} playbackRate={playbackRate} />
      )}

      {/* 听力原文 */}
      {showScript && lesson.script_text && (
        <div className="rounded-xl border border-amber-200/50 bg-amber-50/30 p-5 animate-slide-up">
          <p className="mb-3 font-sans text-xs font-600 uppercase tracking-wider text-amber-700">听力原文 · Script</p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-600">{lesson.script_text}</pre>
        </div>
      )}

      {/* 题目区 */}
      {question && (
        <div className="rounded-xl border border-ink-100 bg-cream-50 p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-700 font-display text-xs font-600 text-cream-50">{currentQIdx + 1}</span>
                <span className="font-sans text-xs text-ink-400">{question.year && `${question.year} 年 · `}高考真题</span>
              </div>
              <p className="mt-3 font-serif text-lg font-500 leading-relaxed text-ink-700">{question.question_text}</p>
            </div>
          </div>

          {/* 选项 */}
          <div className="space-y-2.5">
            {options.map((opt) => {
              const isSelected = selectedAnswer === opt.key;
              const isCorrect = opt.key === question.correct_answer;
              const showResult = submitted;
              let bgClass = "border-ink-100 bg-cream-100/50 hover:border-ink-200 hover:bg-cream-100";
              if (showResult) {
                if (isCorrect) bgClass = "border-easy/40 bg-easy/8";
                else if (isSelected && !isCorrect) bgClass = "border-hard/40 bg-hard/8";
                else bgClass = "border-ink-100 bg-cream-100/30 opacity-60";
              } else if (isSelected) {
                bgClass = "border-ink-300 bg-ink-50";
              }
              return (
                <button key={opt.key} onClick={() => !submitted && onSelectAnswer(opt.key)} disabled={submitted} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${bgClass} ${!submitted ? "cursor-pointer" : "cursor-default"}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-600 ${showResult && isCorrect ? "bg-easy text-cream-50" : showResult && isSelected && !isCorrect ? "bg-hard text-cream-50" : isSelected ? "bg-ink-700 text-cream-50" : "bg-cream-200 text-ink-500"}`}>
                    {opt.key}
                  </span>
                  <span className="flex-1 font-sans text-sm text-ink-700">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* 解析 */}
          {submitted && question.explanation && (
            <div className="mt-4 rounded-lg border border-ink-100 bg-ink-50/50 p-4 animate-slide-up">
              <p className="mb-1 font-sans text-xs font-600 text-ink-500">答案解析</p>
              <p className="font-sans text-sm leading-relaxed text-ink-600">{question.explanation}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="mt-5 flex items-center justify-between">
            <button onClick={onPrevQuestion} disabled={currentQIdx === 0} className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-sans text-sm text-ink-400 disabled:opacity-30 hover:text-ink-700 transition-colors">
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              上一题
            </button>
            {!submitted ? (
              <button onClick={onSubmit} disabled={!selectedAnswer} className="rounded-lg bg-ink-700 px-6 py-2.5 font-sans text-sm font-500 text-cream-50 transition-all hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed">提交答案</button>
            ) : (
              <button onClick={onNext} className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-6 py-2.5 font-sans text-sm font-600 text-ink-800 transition-all hover:bg-amber-300">
                {currentQIdx < questions.length - 1 ? "下一题" : "完成课时"}
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 进度指示 */}
      <div className="flex items-center justify-center gap-1.5">
        {questions.map((_, idx) => (
          <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentQIdx ? "w-8 bg-ink-700" : idx < currentQIdx ? "w-1.5 bg-amber-400" : "w-1.5 bg-ink-100"}`} />
        ))}
      </div>
    </div>
  );
}

// ============ 口语跟读模式 ============
function SpeakingMode({
  lesson,
  playbackRate,
  onRateChange,
}: {
  lesson: LessonWithProgress;
  playbackRate: number;
  onRateChange: (r: number) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const supported = isSpeechRecognitionSupported();

  const sentences = lesson.script_text
    ? lesson.script_text.split(/[.\n!?]+/).map((s) => s.trim()).filter((s) => s.length > 0)
    : [];

  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const currentSentence = sentences[currentSentenceIdx] || "";
  const rates = [0.75, 1, 1.25, 1.5];

  const handleStartRecord = () => {
    setError("");
    setTranscript("");
    setScore(null);
    if (!supported) { setError("当前浏览器不支持语音识别，请使用 Chrome 浏览器"); return; }
    const recognition = createRecognition(
      (text) => { setTranscript(text); setScore(calculateSimilarity(currentSentence, text)); setIsRecording(false); },
      (err) => { setError(`识别失败：${err}`); setIsRecording(false); },
      () => { setIsRecording(false); }
    );
    if (recognition) { recognitionRef.current = recognition; recognition.start(); setIsRecording(true); }
  };

  const handleStopRecord = () => { recognitionRef.current?.stop(); setIsRecording(false); };
  const feedback = score !== null ? getScoreFeedback(score) : null;

  return (
    <div className="space-y-5">
      {/* 课时信息 */}
      <div className="rounded-xl border border-ink-100 bg-cream-50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs italic text-ink-400">Speaking Practice</p>
            <h2 className="mt-1 font-serif text-xl font-600 text-ink-700">{lesson.title} · 口语跟读</h2>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-ink-100 bg-cream-100 p-0.5">
            <Gauge className="ml-1.5 h-3.5 w-3.5 text-ink-400" strokeWidth={1.5} />
            {rates.map((r) => (
              <button key={r} onClick={() => onRateChange(r)} className={`rounded px-2 py-1 font-sans text-[11px] font-500 transition-all ${playbackRate === r ? "bg-ink-700 text-cream-50" : "text-ink-400 hover:text-ink-600"}`}>
                {r}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 音频播放器 */}
      {lesson.audio_url && (
        <AudioPlayer src={lesson.audio_url} playbackRate={playbackRate} />
      )}

      {/* 原文显示 */}
      <div className="rounded-xl border border-ink-100 bg-cream-50 p-6">
        <p className="mb-4 font-sans text-xs font-600 uppercase tracking-wider text-ink-400">请跟读以下句子</p>
        <div className="space-y-2">
          {sentences.slice(0, 5).map((sentence, idx) => (
            <div key={idx} className={`rounded-lg border p-3 transition-all ${idx === currentSentenceIdx ? "border-amber-300 bg-amber-50/40" : "border-transparent bg-cream-100/30"}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-display text-[10px] font-600 ${idx === currentSentenceIdx ? "bg-amber-400 text-ink-800" : "bg-ink-100 text-ink-400"}`}>
                  {idx + 1}
                </span>
                <p className={`flex-1 font-sans text-sm leading-relaxed ${idx === currentSentenceIdx ? "text-ink-700 font-500" : "text-ink-400"}`}>
                  {sentence}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 录音区 */}
      <div className="rounded-xl border border-ink-100 bg-cream-50 p-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            {isRecording && <div className="absolute inset-0 rounded-full bg-hard/30 animate-pulse-ring" />}
            <button onClick={isRecording ? handleStopRecord : handleStartRecord} disabled={!supported} className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all ${isRecording ? "bg-hard text-cream-50" : "bg-ink-700 text-cream-50 hover:bg-ink-800"} ${!supported ? "opacity-40 cursor-not-allowed" : ""}`}>
              {isRecording ? (
                <div className="flex items-end gap-1">
                  <div className="h-4 w-1 bg-cream-50 wave-bar" style={{ animationDelay: "0s" }} />
                  <div className="h-6 w-1 bg-cream-50 wave-bar" style={{ animationDelay: "0.2s" }} />
                  <div className="h-4 w-1 bg-cream-50 wave-bar" style={{ animationDelay: "0.4s" }} />
                </div>
              ) : (
                <Mic className="h-8 w-8" strokeWidth={1.5} />
              )}
            </button>
          </div>
          <p className="mt-4 font-sans text-sm font-500 text-ink-600">{isRecording ? "正在录音... 点击停止" : "点击麦克风开始跟读"}</p>
          {!supported && <p className="mt-1 font-sans text-xs text-hard">当前浏览器不支持语音识别，建议使用 Chrome</p>}
          {error && <p className="mt-2 font-sans text-xs text-hard">{error}</p>}
        </div>

        {/* 识别结果 */}
        {transcript && (
          <div className="mt-6 animate-slide-up">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-ink-100 bg-cream-100/50 p-4">
                <p className="mb-2 font-sans text-[10px] font-600 uppercase tracking-wider text-ink-400">原文</p>
                <p className="font-sans text-sm leading-relaxed text-ink-600">{currentSentence}</p>
              </div>
              <div className="rounded-lg border border-ink-100 bg-cream-100/50 p-4">
                <p className="mb-2 font-sans text-[10px] font-600 uppercase tracking-wider text-ink-400">你的发音</p>
                <p className="font-sans text-sm leading-relaxed text-ink-600">{transcript}</p>
              </div>
            </div>
            {score !== null && feedback && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-ink-100 bg-cream-100/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <svg className="absolute inset-0 h-full w-full -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-ink-100" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(score / 100) * 175.9} 175.9`} strokeLinecap="round" className={score >= 75 ? "text-easy" : score >= 60 ? "text-medium" : "text-hard"} />
                    </svg>
                    <span className="font-display text-lg font-700 text-ink-700">{score}</span>
                  </div>
                  <div>
                    <p className={`font-serif text-lg font-600 ${feedback.color}`}>{feedback.label}</p>
                    <p className="font-sans text-xs text-ink-400">{feedback.message}</p>
                  </div>
                </div>
                <button onClick={() => { if (currentSentenceIdx < sentences.length - 1) { setCurrentSentenceIdx(currentSentenceIdx + 1); setTranscript(""); setScore(null); } }} disabled={currentSentenceIdx >= sentences.length - 1} className="flex items-center gap-1.5 rounded-lg bg-ink-700 px-4 py-2 font-sans text-sm font-500 text-cream-50 hover:bg-ink-800 disabled:opacity-40 transition-all">
                  下一句
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

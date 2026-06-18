// 类型定义

export type Difficulty = "simple" | "medium" | "hard";
export type LessonStatus = "not_started" | "in_progress" | "completed";
export type AchievementConditionType =
  | "consecutive_correct"
  | "study_days"
  | "lessons_completed"
  | "questions_answered";

export interface Course {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  total_lessons: number;
  created_at: number;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  script_text: string;
  audio_url: string;
  order_num: number;
  duration: number;
}

export interface Question {
  id: number;
  lesson_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  audio_url: string;
  explanation: string;
  year: number;
}

export interface UserProgress {
  id: number;
  lesson_id: number;
  status: LessonStatus;
  score: number;
  time_spent: number;
  last_accessed: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  condition_type: AchievementConditionType;
  condition_value: number;
}

export interface UserAchievement {
  id: number;
  achievement_id: number;
  unlocked_at: number;
}

export interface StudyStats {
  id: number;
  date: string;
  study_time: number;
  questions_answered: number;
  correct_count: number;
  streak_days: number;
}

export interface StreakRecord {
  id: number;
  current_streak: number;
  max_streak: number;
  updated_at: number;
}

export interface CourseWithProgress extends Course {
  completed_lessons: number;
  progress_percent: number;
}

export interface LessonWithProgress extends Lesson {
  status: LessonStatus;
  score: number;
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  simple: "简单",
  medium: "中等",
  hard: "困难",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  simple: "easy",
  medium: "medium",
  hard: "hard",
};

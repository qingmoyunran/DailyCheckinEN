// 成就服务 - 检查并解锁成就
import {
  getAchievements,
  getUnlockedAchievementIds,
  unlockAchievement,
  getStreakRecord,
  updateStreakRecord,
  getStudyDaysCount,
  getCompletedLessonsCount,
  getTotalQuestionsAnswered,
} from "./db";
import type { Achievement } from "@/types";

export interface AchievementCheckResult {
  unlocked: Achievement[];
  currentStreak: number;
  maxStreak: number;
}

// 更新连续答对
export function updateConsecutiveCorrect(isCorrect: boolean): AchievementCheckResult {
  const record = getStreakRecord();
  let currentStreak = record.current_streak;
  let maxStreak = record.max_streak;

  if (isCorrect) {
    currentStreak += 1;
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
  } else {
    currentStreak = 0;
  }

  updateStreakRecord(currentStreak, maxStreak);

  const unlocked = checkAchievements({
    consecutive_correct: currentStreak,
  });

  return { unlocked, currentStreak, maxStreak };
}

// 检查所有成就条件
export function checkAchievements(metrics: {
  consecutive_correct?: number;
}): Achievement[] {
  const allAchievements = getAchievements();
  const unlockedIds = getUnlockedAchievementIds();
  const newlyUnlocked: Achievement[] = [];

  const studyDays = getStudyDaysCount();
  const lessonsCompleted = getCompletedLessonsCount();
  const questionsAnswered = getTotalQuestionsAnswered();

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let met = false;
    switch (achievement.condition_type) {
      case "consecutive_correct":
        met =
          metrics.consecutive_correct !== undefined &&
          metrics.consecutive_correct >= achievement.condition_value;
        break;
      case "study_days":
        met = studyDays >= achievement.condition_value;
        break;
      case "lessons_completed":
        met = lessonsCompleted >= achievement.condition_value;
        break;
      case "questions_answered":
        met = questionsAnswered >= achievement.condition_value;
        break;
    }

    if (met) {
      unlockAchievement(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

// 课程完成时检查成就
export function checkOnLessonComplete(): Achievement[] {
  return checkAchievements({});
}

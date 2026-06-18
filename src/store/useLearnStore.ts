import { create } from "zustand";
import type { Difficulty } from "@/types";

interface LearnState {
  // 当前学习的课程 ID
  currentCourseId: number | null;
  setCurrentCourseId: (id: number | null) => void;

  // 当前课时 ID
  currentLessonId: number | null;
  setCurrentLessonId: (id: number | null) => void;

  // 学习模式
  mode: "listening" | "speaking";
  setMode: (mode: "listening" | "speaking") => void;

  // 课程库筛选难度
  filterDifficulty: Difficulty | "all";
  setFilterDifficulty: (d: Difficulty | "all") => void;

  // 刷新计数器（用于触发数据刷新）
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useLearnStore = create<LearnState>((set) => ({
  currentCourseId: null,
  setCurrentCourseId: (id) => set({ currentCourseId: id }),

  currentLessonId: null,
  setCurrentLessonId: (id) => set({ currentLessonId: id }),

  mode: "listening",
  setMode: (mode) => set({ mode }),

  filterDifficulty: "all",
  setFilterDifficulty: (d) => set({ filterDifficulty: d }),

  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));

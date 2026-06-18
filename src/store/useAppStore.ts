import { create } from "zustand";
import type { Achievement } from "@/types";

interface AppState {
  // 数据库就绪状态
  dbReady: boolean;
  setDbReady: (ready: boolean) => void;

  // 成就弹窗
  achievementPopup: Achievement | null;
  showAchievementPopup: (achievement: Achievement) => void;
  hideAchievementPopup: () => void;

  // 通知消息
  notification: { message: string; type: "success" | "error" | "info" } | null;
  showNotification: (
    message: string,
    type?: "success" | "error" | "info"
  ) => void;
  hideNotification: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  dbReady: false,
  setDbReady: (ready) => set({ dbReady: ready }),

  achievementPopup: null,
  showAchievementPopup: (achievement) =>
    set({ achievementPopup: achievement }),
  hideAchievementPopup: () => set({ achievementPopup: null }),

  notification: null,
  showNotification: (message, type = "success") =>
    set({ notification: { message, type } }),
  hideNotification: () => set({ notification: null }),
}));

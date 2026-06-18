import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initDatabase } from "@/services/db";
import { seedDataIfEmpty } from "@/services/seed";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/Layout/Sidebar";
import Notification from "@/components/Layout/Notification";
import AchievementPopup from "@/components/Layout/AchievementPopup";
import Home from "@/pages/Home";
import Library from "@/pages/Library";
import Learn from "@/pages/Learn";
import Admin from "@/pages/Admin";
import Achievements from "@/pages/Achievements";
import Stats from "@/pages/Stats";

export default function App() {
  const { dbReady, setDbReady } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        seedDataIfEmpty();
        setDbReady(true);
      } catch (e) {
        console.error("Database init failed:", e);
        setError("数据库初始化失败，请刷新页面重试");
      }
    };
    init();
  }, [setDbReady]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream-100">
        <div className="max-w-md rounded-2xl border border-hard/20 bg-cream-50 p-8 text-center">
          <p className="font-serif text-lg text-hard">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-ink-700 px-4 py-2 font-sans text-sm text-cream-50"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-ink-700" />
          <p className="mt-4 font-sans text-sm text-ink-500">
            正在初始化数据库...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-cream-100 paper-texture">
        <Sidebar />
        <main className="ml-60 min-h-screen p-8">
          <div className="mx-auto max-w-6xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/learn/:courseId" element={<Learn />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </div>
        </main>
        <Notification />
        <AchievementPopup />
      </div>
    </Router>
  );
}

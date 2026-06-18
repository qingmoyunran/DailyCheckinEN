import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export default function Notification() {
  const { notification, hideNotification } = useAppStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) return null;

  const { message, type } = notification;
  const Icon = type === "success" ? CheckCircle2 : type === "error" ? XCircle : Info;
  const colorClass =
    type === "success"
      ? "bg-easy/10 border-easy/30 text-easy-dark"
      : type === "error"
      ? "bg-hard/10 border-hard/30 text-hard-dark"
      : "bg-ink-50 border-ink-200 text-ink-700";

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${colorClass}`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.5} />
        <span className="font-sans text-sm font-500">{message}</span>
        <button
          onClick={hideNotification}
          className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Library,
  GraduationCap,
  Trophy,
  BarChart3,
  PenSquare,
  Headphones,
} from "lucide-react";

const navItems = [
  { path: "/", label: "学习中心", labelEn: "Home", icon: Home },
  { path: "/library", label: "课程库", labelEn: "Library", icon: Library },
  { path: "/achievements", label: "成就中心", labelEn: "Achievements", icon: Trophy },
  { path: "/stats", label: "学习统计", labelEn: "Statistics", icon: BarChart3 },
  { path: "/admin", label: "真题录入", labelEn: "Admin", icon: PenSquare },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-ink-100 bg-cream-50/80 backdrop-blur-md">
      {/* Logo 区域 */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-700 text-cream-50 shadow-lg">
          <Headphones className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-xl font-700 leading-none text-ink-700">
            听境
          </h1>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400">
            Listening Hub
          </p>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-3 py-4">
        <p className="px-3 pb-3 font-sans text-[10px] font-600 uppercase tracking-[0.15em] text-ink-300">
          导航
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                    isActive
                      ? "bg-ink-700 text-cream-50 shadow-md"
                      : "text-ink-500 hover:bg-cream-200/60 hover:text-ink-700"
                  }`}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.5}
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="font-sans text-sm font-500">
                      {item.label}
                    </span>
                    <span
                      className={`font-display text-[10px] italic ${
                        isActive ? "text-cream-200/70" : "text-ink-300"
                      }`}
                    >
                      {item.labelEn}
                    </span>
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部装饰 */}
      <div className="px-6 py-5">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
            <span className="font-sans text-xs font-600 text-amber-700">
              离线学习模式
            </span>
          </div>
          <p className="mt-1.5 font-sans text-[11px] leading-relaxed text-amber-600/80">
            所有数据存储于本地，无需联网即可使用
          </p>
        </div>
      </div>
    </aside>
  );
}

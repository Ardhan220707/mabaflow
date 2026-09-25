"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, CalendarDays, Sparkles } from "lucide-react";

const navItems = [
  {
    label: "Beranda",
    href: "/beranda",
    icon: Home,
  },
  {
    label: "Tugas",
    href: "/tugas",
    icon: CheckSquare,
  },
  {
    label: "Planer",
    href: "/planner",
    icon: "CalendarDays",
  },
  {
    label: "AI",
    href: "/ai",
    icon: "Sparkles",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                'flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition ${active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}'
              }
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

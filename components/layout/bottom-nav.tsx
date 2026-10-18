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
    label: "Planner",
    href: "/planner",
    icon: CalendarDays,
  },
  {
    label: "AI Assistant",
    href: "/ai",
    icon: Sparkles,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2EAE0] bg-[#F7FAF5]/95 shadow-[0_-4px_16px_rgba(24,61,50,0.04)] backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors duration-200 ${
                active
                  ? "text-[#17664E]"
                  : "text-[#82978A] hover:text-[#456454]"
              }`}
            >
              <span
                className={`flex h-8 w-10 items-center justify-center rounded-xl transition-colors duration-200 ${
                  active ? "bg-[#DCEBDD]" : "bg-transparent"
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
              </span>

              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

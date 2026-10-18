"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, Clock3 } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import { usePlannerStore } from "@/stores/planner-store";

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getTodayDate() {
  return formatDate(new Date());
}

export default function MabaFlowCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tasks = useTaskStore((state) => state.tasks);
  const plannerItems = usePlannerStore((state) => state.plannerItems);

  const selectedItemId = searchParams.get("item");
  const dateFromUrl = searchParams.get("date");

  const selectedItem = plannerItems.find(
    (item) => String(item.id) === selectedItemId,
  );

  const selectedDate = dateFromUrl || selectedItem?.date || getTodayDate();

  const [currentDate, setCurrentDate] = useState(() => {
    const date = parseDate(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const todayDate = getTodayDate();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  function hasPlannerSchedule(dateString: string) {
    return plannerItems.some((item) => item.date === dateString);
  }

  function getDayStatus(dateString: string) {
    const dayTasks = tasks.filter(
      (task) => task.dueDate === dateString && !task.completed,
    );

    if (dayTasks.length === 0) return "empty";

    const date = parseDate(dateString);
    const today = parseDate(todayDate);

    const difference = Math.round(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (difference < 0) return "overdue";

    if (
      difference <= 1 ||
      dayTasks.some((task) => task.priority === "Tinggi")
    ) {
      return "urgent";
    }

    if (
      difference <= 3 ||
      dayTasks.some((task) => task.priority === "Sedang")
    ) {
      return "soon";
    }

    return "safe";
  }

  function selectDate(dateString: string) {
    const date = parseDate(dateString);

    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    router.push(`/planner?date=${dateString}`);
  }

  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const selectedDateLabel = parseDate(selectedDate).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const selectedDateItems = plannerItems
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const statusColors: Record<string, string> = {
    overdue: "bg-[#FCE4D8]",
    urgent: "bg-[#F9DFDC]",
    soon: "bg-[#F8EDC9]",
    safe: "bg-[#DDECDD]",
    empty: "bg-transparent",
  };

  const statusLabels = [
    { label: "Hari ini", color: "bg-[#17664E]" },
    { label: "Aman", color: "bg-[#DDECDD]" },
    { label: "Mendekati", color: "bg-[#DCE8F8]" },
    { label: "Urgent", color: "bg-[#FCE8B2]" },
    { label: "Terlambat", color: "bg-[#F5D1CC]" },
  ];

  return (
    <section className="mt-6">
      {/* Header kalender */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DCEBDD] text-[#17664E]">
            <CalendarDays size={21} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#82978A]">Atur waktumu</p>
            <h2 className="mt-0.5 text-lg font-bold capitalize text-[#183D32]">
              {monthName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Bulan sebelumnya"
            onClick={goToPreviousMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2EAE0] bg-white text-[#456454] transition hover:bg-[#EAF2E7]"
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            aria-label="Bulan berikutnya"
            onClick={goToNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2EAE0] bg-white text-[#456454] transition hover:bg-[#EAF2E7]"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      {/* Kalender */}
      <div className="mt-4 rounded-3xl border border-[#E2EAE0] bg-white p-3 shadow-[0_4px_18px_rgba(24,61,50,0.04)] sm:p-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(
            (day, index) => (
              <span
                key={day}
                className={`py-2 text-[11px] font-semibold ${
                  index === 0 ? "text-[#B57C70]" : "text-[#82978A]"
                }`}
              >
                {day}
              </span>
            ),
          )}

          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`calendar-empty-${index}`} />;
            }

            const dateString = formatDate(new Date(year, month, day));
            const status = getDayStatus(dateString);
            const hasSchedule = hasPlannerSchedule(dateString);
            const isToday = dateString === todayDate;
            const isSelected = dateString === selectedDate;

            return (
              <button
                type="button"
                key={dateString}
                aria-label={`${day}${isToday ? ", hari ini" : ""}${
                  hasSchedule ? ", memiliki jadwal" : ""
                }`}
                aria-pressed={isSelected}
                onClick={() => selectDate(dateString)}
                className={`relative flex h-10 items-center justify-center rounded-xl text-sm transition sm:h-11 ${
                  isSelected
                    ? "z-10 font-bold text-white ring-2 ring-[#17664E] ring-offset-1"
                    : isToday
                      ? "font-bold text-white"
                      : "text-[#355746] hover:bg-[#F0F5ED]"
                }`}
              >
                <span
                  className={`absolute inset-1 rounded-lg ${
                    isSelected
                      ? "bg-[#17664E]"
                      : isToday
                        ? "bg-[#43865F]"
                        : statusColors[status]
                  }`}
                />

                <span className="relative z-10 flex flex-col items-center">
                  <span>{day}</span>

                  {hasSchedule && (
                    <span
                      className={`mt-0.5 h-1 w-1 rounded-full ${
                        isSelected || isToday ? "bg-white" : "bg-[#43865F]"
                      }`}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legenda status deadline */}
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-[#EDF1EA] pt-4 text-[10px] text-[#62796A] sm:gap-x-4 sm:text-[11px]">
          {statusLabels.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border-2 border-[#17664E]" />
            Dipilih
          </div>
        </div>

        {/* Jadwal pada tanggal terpilih */}
        <div className="mt-5 border-t border-[#E7EEE4] pt-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2E7] text-[#17664E]">
              <Clock3 size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#82978A]">
                {selectedDate === todayDate
                  ? "Jadwal hari ini"
                  : "Jadwal tanggal dipilih"}
              </p>

              <p className="mt-1 text-sm font-bold text-[#183D32]">
                {selectedDateLabel}
              </p>
            </div>

            <span className="rounded-full bg-[#EAF2E7] px-2.5 py-1 text-xs font-semibold text-[#17664E]">
              {selectedDateItems.length} jadwal
            </span>
          </div>

          {selectedDateItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[#D5E2D3] bg-[#F7FAF5] px-4 py-6 text-center">
              <CalendarDays size={24} className="mx-auto text-[#9DB5A0]" />
              <p className="mt-2 text-sm font-medium text-[#456454]">
                Belum ada jadwal
              </p>
              <p className="mt-1 text-xs text-[#82978A]">
                Jadwal untuk tanggal ini akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {selectedDateItems.map((item) => {
                const isItemSelected = String(item.id) === selectedItemId;

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() =>
                      router.push(
                        `/planner?date=${selectedDate}&item=${item.id}`,
                      )
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      isItemSelected
                        ? "border-[#8FB89A] bg-[#EAF2E7] ring-1 ring-[#B7D1B8]"
                        : "border-[#E7EEE4] bg-[#FAFCF9] hover:bg-[#F0F5ED]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#254B39]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-[#82978A]">
                        {item.startTime} – {item.endTime}
                      </p>
                    </div>

                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        item.completed
                          ? "bg-[#43865F]"
                          : "border-2 border-[#A8B8AA] bg-white"
                      }`}
                      aria-label={item.completed ? "Selesai" : "Belum selesai"}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import { usePlannerStore } from "@/stores/planner-store";

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function MabaFlowCalendar() {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);
  const plannerItems = usePlannerStore((state) => state.plannerItems);

  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(formatDate(today));

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

  function hasPlannerSchedule(day: number) {
    const date = new Date(year, month, day);
    const dateString = formatDate(date);

    return plannerItems.some((item) => item.date === dateString);
  }

  function getSelectedDatePlannerItems() {
    return plannerItems.filter((item) => item.date === selectedDate);
  }

  function getDayStatus(day: number) {
    const date = new Date(year, month, day);
    const dateString = formatDate(date);

    const dayTasks = tasks.filter(
      (task) => task.dueDate === dateString && !task.completed,
    );

    if (dayTasks.length === 0) {
      return "empty";
    }

    const nearestTask = dayTasks.reduce((nearest, task) => {
      if (!nearest) {
        return task;
      }

      return task.priority === "Tinggi" ? task : nearest;
    }, dayTasks[0]);

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const difference = Math.ceil(
      (date.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (difference <= 1 || nearestTask.priority === "Tinggi") {
      return "urgent";
    }

    if (difference <= 3 || nearestTask.priority === "Sedang") {
      return "soon";
    }

    return "safe";
  }

  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Kalender</p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900 capitalize">
            {monthName}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <span
              key={day}
              className="py-2 text-[11px] font-medium text-slate-400"
            >
              {day}
            </span>
          ))}

          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`calendar-empty-${index}`} />;
            }

            const status = getDayStatus(day);
            const hasSchedule = hasPlannerSchedule(day);

            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            const isSelected =
              formatDate(new Date(year, month, day)) === selectedDate;

            return (
              <div
                key={`calendar-day-${index}`}
                onClick={() => {
                  const clickedDate = new Date(year, month, day);
                  setSelectedDate(formatDate(clickedDate));
                }}
                className={`relative flex h-10 cursor-pointer items-center justify-center rounded-xl text-sm ${
                  isSelected
                    ? "font-bold text-slate-900 ring-2 ring-slate-900 ring-offset-1"
                    : isToday
                      ? "font-bold text-slate-900"
                      : "text-slate-700"
                }`}
              >
                <span
                  className={`absolute inset-1 rounded-lg ${
                    status === "urgent"
                      ? "bg-red-100"
                      : status === "soon"
                        ? "bg-yellow-100"
                        : status === "safe"
                          ? "bg-green-100"
                          : "bg-transparent"
                  }`}
                />

                <span className="relative z-10 flex flex-col items-center">
                  <span>{day}</span>

                  {hasSchedule && (
                    <span className="mt-0.5 h-1 w-1 rounded-full bg-slate-900" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-200" />
            Aman
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-200" />
            Mendekati
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-200" />
            Urgent
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-400">Jadwal</p>

          {getSelectedDatePlannerItems().length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">
              Tidak ada jadwal untuk tanggal ini.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {getSelectedDatePlannerItems().map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => router.push(`/planner?item=${item.id}`)}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.startTime} - {item.endTime}
                    </p>
                  </div>

                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.completed ? "bg-green-500" : "bg-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import { usePlannerStore } from "@/stores/planner-store";

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
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

  // useEffect(() => {
  //   const date = parseDate(selectedDate);
  //   setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
  // }, [selectedDate]);

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

    if (dayTasks.length === 0) {
      return "empty";
    }

    const date = parseDate(dateString);
    const today = parseDate(todayDate);

    const difference = Math.round(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Deadline sudah lewat
    if (difference < 0) {
      return "overdue";
    }

    // Deadline hari ini atau besok
    if (
      difference <= 1 ||
      dayTasks.some((task) => task.priority === "Tinggi")
    ) {
      return "urgent";
    }

    // Deadline dalam tiga hari atau prioritas sedang
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

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Kalender</p>

          <h2 className="mt-1 text-lg font-semibold capitalize text-slate-900">
            {monthName}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Bulan sebelumnya"
            onClick={goToPreviousMonth}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            aria-label="Bulan berikutnya"
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
                className={`relative flex h-10 items-center justify-center rounded-xl text-sm transition ${
                  isSelected
                    ? "z-10 font-bold text-slate-900 ring-2 ring-violet-600 ring-offset-1"
                    : isToday && status !== "overdue" && status !== "urgent"
                      ? "font-bold text-white"
                      : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`absolute inset-1 rounded-lg ${
                    status === "overdue"
                      ? "bg-orange-200"
                      : status === "urgent"
                        ? "bg-red-100"
                        : status === "soon"
                          ? "bg-yellow-100"
                          : status === "safe"
                            ? "bg-green-100"
                            : isToday
                              ? "bg-blue-600"
                              : "bg-transparent"
                  }`}
                />

                <span className="relative z-10 flex flex-col items-center">
                  <span>{day}</span>

                  {hasSchedule && (
                    <span
                      className={`mt-0.5 h-1 w-1 rounded-full ${
                        isToday ? "bg-white" : "bg-slate-900"
                      }`}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            Hari ini
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border-2 border-violet-600" />
            Tanggal dipilih
          </div>

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

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-200" />
            Terlambat
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-400">
            Jadwal {selectedDate === todayDate ? "Hari Ini" : "Tanggal Dipilih"}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {parseDate(selectedDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {plannerItems.filter((item) => item.date === selectedDate).length ===
          0 ? (
            <p className="mt-2 text-sm text-slate-400">
              Tidak ada jadwal untuk tanggal ini.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {plannerItems
                .filter((item) => item.date === selectedDate)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() =>
                      router.push(
                        `/planner?date=${selectedDate}&item=${item.id}`,
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-slate-100 ${
                      String(item.id) === selectedItemId
                        ? "bg-violet-50 ring-1 ring-violet-200"
                        : "bg-slate-50"
                    }`}
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
